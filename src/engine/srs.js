import { fsrs, Rating, createEmptyCard } from 'ts-fsrs';
import { getReviewForChar, saveReviewForChar, getAllReviews, getDueReviews } from '../db/schema.js';

const f = fsrs();

export { Rating };

/**
 * Map mistake count from HanziWriter quiz to FSRS Rating
 * 0 mistakes -> Good (3) or Easy (4)
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
  
  // Compute next scheduling options using FSRS
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
  return reviewRecord;
}

export async function fetchSRSStats() {
  const reviews = await getAllReviews();
  const now = new Date().toISOString();
  
  const dueCount = reviews.filter(r => r.due <= now).length;
  const learningCount = reviews.filter(r => r.state === 1 || r.state === 2).length;
  const masteredCount = reviews.filter(r => r.state === 3).length;

  return {
    totalStudied: reviews.length,
    dueCount,
    learningCount,
    masteredCount
  };
}

export { getReviewForChar, getAllReviews, getDueReviews };
