import { Hono } from 'hono';
import { 
  generateId, 
  generateSalt, 
  generateSessionId, 
  hashPassword, 
  verifyPassword 
} from '../utils/crypto';
import { 
  setSessionCookie, 
  clearSessionCookie, 
  getSessionId, 
  SESSION_MAX_AGE 
} from '../utils/cookies';
import { requireAuth } from '../middleware/auth';

const authRouter = new Hono();

/**
 * POST /api/auth/register
 * Create a new user account and initiate a session
 */
authRouter.post('/register', async (c) => {
  try {
    const { email, password, username } = await c.req.json();

    if (!email || !password || !username) {
      return c.json({ error: 'Email, username, and password are required' }, 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (trimmedEmail.length < 3 || !trimmedEmail.includes('@')) {
      return c.json({ error: 'Please provide a valid email address' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    const db = c.env.DB;
    if (!db) {
      return c.json({ error: 'Database binding unavailable' }, 500);
    }

    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(trimmedEmail)
      .first();

    if (existingUser) {
      return c.json({ error: 'An account with this email already exists' }, 409);
    }

    const userId = generateId();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = Math.floor(Date.now() / 1000);

    // Insert user into D1
    await db
      .prepare(
        `INSERT INTO users (id, email, username, password_hash, salt, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(userId, trimmedEmail, trimmedUsername, passwordHash, salt, now, now)
      .run();

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = now + SESSION_MAX_AGE;
    const userAgent = c.req.header('user-agent') || '';
    const ipAddress = c.req.header('cf-connecting-ip') || '';

    await db
      .prepare(
        `INSERT INTO sessions (id, user_id, expires_at, created_at, user_agent, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(sessionId, userId, expiresAt, now, userAgent, ipAddress)
      .run();

    // Set secure HttpOnly cookie
    setSessionCookie(c, sessionId);

    return c.json({
      success: true,
      user: {
        id: userId,
        email: trimmedEmail,
        username: trimmedUsername,
        createdAt: now
      }
    }, 201);
  } catch (err) {
    console.error('Registration error:', err);
    return c.json({ error: 'Internal server error during registration' }, 500);
  }
});

/**
 * POST /api/auth/login
 * Authenticate credentials and set session cookie
 */
authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = c.env.DB;
    if (!db) {
      return c.json({ error: 'Database binding unavailable' }, 500);
    }

    // Lookup user by email
    const user = await db
      .prepare('SELECT id, email, username, password_hash, salt, created_at FROM users WHERE email = ?')
      .bind(trimmedEmail)
      .first();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionId = generateSessionId();
    const expiresAt = now + SESSION_MAX_AGE;
    const userAgent = c.req.header('user-agent') || '';
    const ipAddress = c.req.header('cf-connecting-ip') || '';

    // Create new session in D1
    await db
      .prepare(
        `INSERT INTO sessions (id, user_id, expires_at, created_at, user_agent, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(sessionId, user.id, expiresAt, now, userAgent, ipAddress)
      .run();

    // Set HttpOnly cookie
    setSessionCookie(c, sessionId);

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

/**
 * POST /api/auth/logout
 * Invalidate session in D1 and clear HttpOnly cookie
 */
authRouter.post('/logout', async (c) => {
  const sessionId = getSessionId(c);
  if (sessionId && c.env.DB) {
    try {
      await c.env.DB
        .prepare('DELETE FROM sessions WHERE id = ?')
        .bind(sessionId)
        .run();
    } catch (err) {
      console.warn('Error deleting session during logout:', err);
    }
  }

  clearSessionCookie(c);
  return c.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get currently authenticated user details
 */
authRouter.get('/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

export default authRouter;
