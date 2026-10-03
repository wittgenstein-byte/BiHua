import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../utils/crypto';

const syncRouter = new Hono();

// All sync routes require authenticated user
syncRouter.use('*', requireAuth);

/**
 * GET /api/sync/bookmarks
 * Retrieve all bookmarks for current user
 */
syncRouter.get('/bookmarks', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  const results = await db
    .prepare('SELECT word, folder, notes, updated_at FROM user_bookmarks WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(user.id)
    .all();

  const rows = results.results || [];
  const words = rows.map(r => r.word);

  return c.json({ 
    bookmarks: words,
    details: rows 
  });
});

/**
 * POST /api/sync/bookmark
 * Add or update a single bookmark
 */
syncRouter.post('/bookmark', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const { word, folder = 'All Saved', notes = '' } = await c.req.json();

  if (!word) {
    return c.json({ error: 'word is required' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const id = generateId();

  await db
    .prepare(
      `INSERT INTO user_bookmarks (id, user_id, word, folder, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, word) DO UPDATE SET
         folder = excluded.folder,
         notes = excluded.notes,
         updated_at = excluded.updated_at`
    )
    .bind(id, user.id, word, folder, notes, now, now)
    .run();

  return c.json({ success: true, word });
});

/**
 * DELETE /api/sync/bookmark/:word
 * Delete a single bookmark
 */
syncRouter.delete('/bookmark/:word', async (c) => {
  const user = c.get('user');
  const word = decodeURIComponent(c.req.param('word'));
  const db = c.env.DB;

  await db
    .prepare('DELETE FROM user_bookmarks WHERE user_id = ? AND word = ?')
    .bind(user.id, word)
    .run();

  return c.json({ success: true, word });
});

/**
 * POST /api/sync/bookmarks
 * Bulk sync / upload bookmarks from client
 */
syncRouter.post('/bookmarks', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const { bookmarks } = await c.req.json();

  if (!Array.isArray(bookmarks)) {
    return c.json({ error: 'Expected bookmarks array' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  // Batch upsert using D1 transactions / batching
  const statements = bookmarks.map((b) => {
    const id = generateId();
    const word = typeof b === 'string' ? b : b.word;
    const folder = b.folder || 'All Saved';
    const notes = b.notes || '';

    return db
      .prepare(
        `INSERT INTO user_bookmarks (id, user_id, word, folder, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, word) DO UPDATE SET
           folder = excluded.folder,
           notes = excluded.notes,
           updated_at = excluded.updated_at`
      )
      .bind(id, user.id, word, folder, notes, now, now);
  });

  if (statements.length > 0) {
    await db.batch(statements);
  }

  return c.json({ success: true, count: statements.length });
});

/**
 * DELETE /api/sync/bookmarks/all
 * Clear all bookmarks for user
 */
syncRouter.delete('/bookmarks/all', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  await db
    .prepare('DELETE FROM user_bookmarks WHERE user_id = ?')
    .bind(user.id)
    .run();

  return c.json({ success: true });
});

/**
 * GET /api/sync/decks
 * Retrieve all custom folder decks for user
 */
syncRouter.get('/decks', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  const results = await db
    .prepare('SELECT id, name, description, color, words_json, created_at, updated_at FROM user_decks WHERE user_id = ? ORDER BY created_at ASC')
    .bind(user.id)
    .all();

  const decks = (results.results || []).map(r => {
    let words = [];
    try {
      words = JSON.parse(r.words_json);
    } catch (e) {
      words = [];
    }
    return {
      id: r.id,
      name: r.name,
      description: r.description || '',
      color: r.color || '#e11d48',
      words: Array.isArray(words) ? words : [],
      createdAt: new Date(r.created_at * 1000).toISOString()
    };
  });

  return c.json({ decks });
});

/**
 * POST /api/sync/decks
 * Bulk sync / update all decks for user
 */
syncRouter.post('/decks', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const { decks } = await c.req.json();

  if (!Array.isArray(decks)) {
    return c.json({ error: 'Expected decks array' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  const statements = decks.map(d => {
    const id = d.id || `deck_${Date.now()}`;
    const wordsJson = JSON.stringify(d.words || []);
    return db
      .prepare(
        `INSERT INTO user_decks (id, user_id, name, description, color, words_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           color = excluded.color,
           words_json = excluded.words_json,
           updated_at = excluded.updated_at`
      )
      .bind(id, user.id, d.name, d.description || '', d.color || '#e11d48', wordsJson, now, now);
  });

  if (statements.length > 0) {
    await db.batch(statements);
  }

  return c.json({ success: true, count: statements.length });
});

/**
 * DELETE /api/sync/deck/:id
 * Delete a specific deck
 */
syncRouter.delete('/deck/:id', async (c) => {
  const user = c.get('user');
  const deckId = c.req.param('id');
  const db = c.env.DB;

  await db
    .prepare('DELETE FROM user_decks WHERE id = ? AND user_id = ?')
    .bind(deckId, user.id)
    .run();

  return c.json({ success: true, id: deckId });
});

export default syncRouter;
