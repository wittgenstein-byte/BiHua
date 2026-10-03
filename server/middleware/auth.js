import { getSessionId } from '../utils/cookies';

/**
 * Required authentication middleware
 * Checks HttpOnly session cookie, verifies against D1 database,
 * and attaches user object to Hono context.
 */
export async function requireAuth(c, next) {
  const sessionId = getSessionId(c);

  if (!sessionId) {
    return c.json({ error: 'Unauthorized: No active session' }, 401);
  }

  const db = c.env.DB;
  if (!db) {
    console.error('D1 Database binding (DB) is missing');
    return c.json({ error: 'Database configuration error' }, 500);
  }

  const now = Math.floor(Date.now() / 1000);

  // Query session joined with user
  const result = await db
    .prepare(
      `SELECT s.id as session_id, s.expires_at, 
              u.id as user_id, u.email, u.username, u.avatar_url, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .bind(sessionId, now)
    .first();

  if (!result) {
    return c.json({ error: 'Unauthorized: Session expired or invalid' }, 401);
  }

  // Set user and session context
  c.set('user', {
    id: result.user_id,
    email: result.email,
    username: result.username,
    avatarUrl: result.avatar_url,
    createdAt: result.created_at
  });
  c.set('sessionId', result.session_id);

  await next();
}

/**
 * Optional authentication middleware
 * If a valid session exists, attaches user to context; otherwise continues without error.
 */
export async function optionalAuth(c, next) {
  const sessionId = getSessionId(c);
  if (sessionId && c.env.DB) {
    const now = Math.floor(Date.now() / 1000);
    const result = await c.env.DB
      .prepare(
        `SELECT s.id as session_id, 
                u.id as user_id, u.email, u.username, u.avatar_url, u.created_at
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.expires_at > ?`
      )
      .bind(sessionId, now)
      .first();

    if (result) {
      c.set('user', {
        id: result.user_id,
        email: result.email,
        username: result.username,
        avatarUrl: result.avatar_url,
        createdAt: result.created_at
      });
      c.set('sessionId', result.session_id);
    }
  }

  await next();
}
