import { useState, useEffect, useCallback } from 'react';
import { fetchSRSStats, processCardReview, getDueReviews, getAllReviews } from '../engine/srs';

export function useSRS() {
  const [stats, setStats] = useState({
    totalStudied: 0,
    dueCount: 0,
    learningCount: 0,
    masteredCount: 0
  });
  const [dueCards, setDueCards] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSRSData = useCallback(async () => {
    setLoading(true);
    try {
      const currentStats = await fetchSRSStats();
      const currentDue = await getDueReviews();
      const reviews = await getAllReviews();
      
      setStats(currentStats);
      setDueCards(currentDue);
      setAllReviews(reviews);
    } catch (err) {
      console.error('Error refreshing SRS data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSRSData();
  }, [refreshSRSData]);

  const submitRating = async (char, rating, hskLevel = 1) => {
    await processCardReview(char, rating, hskLevel);
    await refreshSRSData();
  };

  return {
    stats,
    dueCards,
    allReviews,
    loading,
    refreshSRSData,
    submitRating
  };
}
