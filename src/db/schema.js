import Dexie from 'dexie';

export const db = new Dexie('BiHuaSRSDB');

db.version(1).stores({
  // char: primary key, due: indexed for querying due cards, level: HSK level index
  reviews: 'char, due, state, hskLevel, lastReviewed'
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
