import { fsrs, Rating, createEmptyCard, generatorParameters } from 'ts-fsrs';
import {
  getReviewForChar,
  saveReviewForChar,
  getAllReviews,
  getDueReviews,
  logReview,
  getReviewLogs,
  getSetting,
  setSetting
} from '../db/schema.js';

export { Rating };

/**
 * Get FSRS instance with user's target retention preference (default 0.85)
 */
export async function getFSRSInstance() {
  const targetRetention = await getSetting('targetRetention', 0.85);
  const params = generatorParameters({ request_retention: targetRetention });
  return fsrs(params);
}

/**
 * Compute retrievability R (%) based on stability S and elapsed days
 */
export function computeRetrievability(stability, elapsedDays) {
  if (!stability || stability <= 0) return 100;
  if (elapsedDays <= 0) return 100;
  const r = Math.pow(1 + elapsedDays / (9 * stability), -1);
  return Math.max(0, Math.min(100, Math.round(r * 100)));
}

/**
 * Map mistake count from HanziWriter quiz to FSRS Rating
 * 0 mistakes -> Good (3)
 * 1-2 mistakes -> Hard (2)
 * 3+ mistakes -> Again (1)
 */
export function mapMistakesToRating(mistakes) {
  if (mistakes === 0) return Rating.Good;
  if (mistakes <= 2) return Rating.Hard;
  return Rating.Again;
}

export async function processCardReview(char, rating, hskLevel = 1) {
  const now = new Date();
  const existingRecord = await getReviewForChar(char);
  
  let card = existingRecord ? existingRecord.card : createEmptyCard(now);
  
  const f = await getFSRSInstance();
  const schedulingCards = f.repeat(card, now);
  const updatedCard = schedulingCards[rating].card;

  const reviewRecord = {
    card: updatedCard,
    due: updatedCard.due.toISOString(),
    state: updatedCard.state,
    hskLevel,
    lastReviewed: now.toISOString(),
    lastRating: rating
  };

  await saveReviewForChar(char, reviewRecord);
  await logReview(char, rating);
  return reviewRecord;
}

export async function fetchSRSStats() {
  const reviews = await getAllReviews();
  const logs = await getReviewLogs();
  const targetRetention = await getSetting('targetRetention', 0.85);
  const now = new Date();
  const nowISO = now.toISOString();
  
  const dueCount = reviews.filter(r => r.due <= nowISO).length;
  // FSRS states: 0: New, 1: Learning, 2: Review, 3: Relearning
  const learningCount = reviews.filter(r => r.state === 1 || r.state === 3).length;
  const reviewCount = reviews.filter(r => r.state === 2).length;
  
  // Long-term memory: Stability S > 30 days
  const longTermCount = reviews.filter(r => r.card && r.card.stability > 30).length;

  // Calculate daily review log map (last 365 days or 30 days)
  const heatmapData = {};
  logs.forEach(log => {
    heatmapData[log.date] = (heatmapData[log.date] || 0) + 1;
  });

  return {
    totalStudied: reviews.length,
    dueCount,
    learningCount,
    reviewCount,
    longTermCount,
    masteredCount: longTermCount,
    targetRetention,
    heatmapData
  };
}

export { getReviewForChar, getAllReviews, getDueReviews, getSetting, setSetting };

