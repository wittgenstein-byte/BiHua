import HanziWriter from 'hanzi-writer';

/**
 * Creates a configured HanziWriter instance attached to a target DOM container.
 */
export function createStrokeWriter(targetEl, char, options = {}) {
  if (!targetEl || !char) return null;

  // Clear container
  targetEl.innerHTML = '';

  const defaultOptions = {
    width: 280,
    height: 280,
    padding: 15,
    strokeAnimationSpeed: 1.0,
    delayBetweenStrokes: 250,
    strokeColor: '#0f172a',      // Dark slate stroke
    radicalColor: '#f43f5e',     // Vibrant rose radical stroke color
    outlineColor: '#cbd5e1',     // Soft slate outline
    showOutline: true,
    showCharacter: false,
    highlightColor: '#22c55e',   // Green highlight on stroke success
    charDataLoader: (character, onComplete, onError) => {
      fetch(`/stroke/${encodeURIComponent(character)}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => onComplete(data))
        .catch(err => {
          console.error(`Failed to load stroke file for ${character}:`, err);
          if (onError) onError(err);
        });
    },
    ...options
  };

  try {
    return HanziWriter.create(targetEl, char, defaultOptions);
  } catch (err) {
    console.error('HanziWriter initialization error:', err);
    return null;
  }
}
