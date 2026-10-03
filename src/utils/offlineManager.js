// Service Worker Offline Stroke Cache Name
export const STROKE_CACHE_NAME = 'bihua-stroke-cache';

/**
 * Checks how many strokes are currently cached in the browser CacheStorage.
 * Returns { cachedCount: number, isSupported: boolean }
 */
export async function getOfflineStrokeStats() {
  if (!('caches' in window)) {
    return { cachedCount: 0, isSupported: false };
  }

  try {
    const cache = await caches.open(STROKE_CACHE_NAME);
    const keys = await cache.keys();
    // Count how many keys match /stroke/
    const strokeKeys = keys.filter(req => req.url.includes('/stroke/'));
    return {
      cachedCount: strokeKeys.length,
      isSupported: true
    };
  } catch (err) {
    console.error('Failed to get offline cache stats:', err);
    return { cachedCount: 0, isSupported: true };
  }
}

/**
 * Pre-downloads and caches strokes for offline study.
 * @param {string[]} characters Array of single Chinese characters
 * @param {Function} onProgress Callback (progress: { loaded: number, total: number, percentage: number })
 */
export async function cacheCharactersForOffline(characters, onProgress) {
  if (!('caches' in window)) {
    throw new Error('CacheStorage is not supported in this browser.');
  }

  const cache = await caches.open(STROKE_CACHE_NAME);
  const total = characters.length;
  let loaded = 0;

  // Process in small batches of 15 concurrent fetches to prevent network congestion
  const batchSize = 15;
  for (let i = 0; i < characters.length; i += batchSize) {
    const batch = characters.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (char) => {
        const url = `/stroke/${encodeURIComponent(char)}.json`;
        try {
          // Check if already in cache
          const existing = await cache.match(url);
          if (!existing) {
            const res = await fetch(url);
            if (res.ok) {
              await cache.put(url, res.clone());
            }
          }
        } catch (e) {
          console.warn(`Could not cache offline stroke for ${char}:`, e);
        } finally {
          loaded++;
          if (onProgress) {
            onProgress({
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            });
          }
        }
      })
    );
  }

  return { loaded, total };
}

/**
 * Checks if a specific character's stroke is already available in the offline cache
 */
export async function isCharacterCached(char) {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(STROKE_CACHE_NAME);
    const match = await cache.match(`/stroke/${encodeURIComponent(char)}.json`);
    return !!match;
  } catch {
    return false;
  }
}
