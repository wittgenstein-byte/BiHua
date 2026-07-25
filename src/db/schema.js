import Dexie from 'dexie';

export const db = new Dexie('BiHuaSRSDB');

db.version(1).stores({
  // char: primary key, due: indexed for querying due cards, level: HSK level index
  reviews: 'char, due, state, hskLevel, lastReviewed'
});

db.version(2).stores({
  reviews: 'char, due, state, hskLevel, lastReviewed',
  review_logs: '++id, date, char, rating',
  settings: 'key'
});

export async function getReviewForChar(char) {
  try {
    return await db.reviews.get(char);
  } catch (err) {
    console.error('Dexie get error:', err);
    return null;
  }
}

export async function saveReviewForChar(char, reviewData) {
  try {
    await db.reviews.put({
      char,
      ...reviewData
    });
  } catch (err) {
    console.error('Dexie put error:', err);
  }
}

export async function logReview(char, rating) {
  try {
    const today = new Date().toISOString().split('T')[0];
    await db.review_logs.add({
      date: today,
      timestamp: new Date().toISOString(),
      char,
      rating
    });
  } catch (err) {
    console.error('Dexie log error:', err);
  }
}

export async function getReviewLogs() {
  try {
    return await db.review_logs.toArray();
  } catch (err) {
    console.error('Dexie fetch logs error:', err);
    return [];
  }
}

export async function getSetting(key, defaultValue = null) {
  try {
    const item = await db.settings.get(key);
    return item ? item.value : defaultValue;
  } catch (err) {
    console.error('Dexie setting get error:', err);
    return defaultValue;
  }
}

export async function setSetting(key, value) {
  try {
    await db.settings.put({ key, value });
  } catch (err) {
    console.error('Dexie setting put error:', err);
  }
}

export async function getAllReviews() {
  try {
    return await db.reviews.toArray();
  } catch (err) {
    console.error('Dexie fetch error:', err);
    return [];
  }
}

export async function getDueReviews(now = new Date()) {
  try {
    const nowISO = now.toISOString();
    return await db.reviews.filter(r => r.due <= nowISO).toArray();
  } catch (err) {
    console.error('Dexie query error:', err);
    return [];
  }
}
