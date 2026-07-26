import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChineseFlashcardStack } from '../flashcard/ChineseFlashcardStack';
import { X } from 'lucide-react';
import './AntigravityStackGallery.css';

/**
 * AntigravityStackGallery
 *
 * Fuses a 3D perspective carousel with a focus/expand system for Stack decks.
 *
 * BROWSING PHASE: Horizontal 3D carousel — drag/scroll/arrows to navigate.
 * FOCUS PHASE:    Click center deck → it expands, others fade, Stack is fully interactive.
 * EXIT FOCUS:     ESC key, click overlay, or X button.
 *
 * The two phases occupy separate DOM branches to guarantee zero event collision
 * between the carousel's drag-to-scroll and the Stack's drag-to-swipe.
 */
export function AntigravityStackGallery({
  allDecks = [],
  activeDeckIndex = 0,
  onActiveIndexChange,
  bookmarkedWords = [],
}) {
  const [focusedId, setFocusedId] = useState(null);
  const [dragFraction, setDragFraction] = useState(0);

  const containerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startTime: 0,
    didDrag: false,
    pointerId: null,
  });
  const wheelCooldownRef = useRef(false);

  const isFocused = focusedId !== null;
  const focusedDeck = isFocused ? allDecks.find(d => d.id === focusedId) : null;

  // ─── Helper: get words for a given deck ──────────────────────────
  const getDeckWords = useCallback((deck) => {
    if (!deck) return [];
    if (deck.id === 'all') return bookmarkedWords;
    return bookmarkedWords.filter(w => deck.words.includes(w.word));
  }, [bookmarkedWords]);

  // ─── Keyboard support ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isFocused) {
        setFocusedId(null);
      } else if (!isFocused) {
        if (e.key === 'ArrowRight') {
          onActiveIndexChange((activeDeckIndex + 1) % allDecks.length);
        } else if (e.key === 'ArrowLeft') {
          onActiveIndexChange((activeDeckIndex - 1 + allDecks.length) % allDecks.length);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFocused, activeDeckIndex, allDecks.length, onActiveIndexChange]);

  // ─── Pointer drag handlers for carousel ──────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (isFocused) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startTime: Date.now(),
      didDrag: false,
      pointerId: e.pointerId,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [isFocused]);

  const handlePointerMove = useCallback((e) => {
    const dr = dragRef.current;
    if (!dr.active) return;
    const dx = e.clientX - dr.startX;
    if (Math.abs(dx) > 5) dr.didDrag = true;
    // Negative because dragging left = advancing forward
    setDragFraction(-dx / 260);
  }, []);

  const handlePointerUp = useCallback((e) => {
    const dr = dragRef.current;
    if (!dr.active) return;
    dr.active = false;

    const dx = e.clientX - dr.startX;
    const dt = Math.max(Date.now() - dr.startTime, 1);
    const velocity = dx / dt; // px/ms

    setDragFraction(0);

    // Navigate if dragged far enough or fast enough
    if (Math.abs(dx) > 60 || Math.abs(velocity) > 0.3) {
      const dir = dx < 0 ? 1 : -1;
      onActiveIndexChange((activeDeckIndex + dir + allDecks.length) % allDecks.length);
    }

    containerRef.current?.releasePointerCapture(dr.pointerId);
  }, [activeDeckIndex, allDecks.length, onActiveIndexChange]);

  // ─── Wheel scroll ────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    if (isFocused || wheelCooldownRef.current) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 30) return;

    wheelCooldownRef.current = true;
    setTimeout(() => { wheelCooldownRef.current = false; }, 400);

    const dir = d > 0 ? 1 : -1;
    onActiveIndexChange((activeDeckIndex + dir + allDecks.length) % allDecks.length);
  }, [isFocused, activeDeckIndex, allDecks.length, onActiveIndexChange]);

  // ─── Item click (only when pointer didn't drag) ──────────────────
  const handleItemClick = useCallback((deck, index) => {
    if (dragRef.current.didDrag) return; // was a drag, not a click
    if (index === activeDeckIndex) {
      setFocusedId(deck.id);
    } else {
      onActiveIndexChange(index);
    }
  }, [activeDeckIndex, onActiveIndexChange]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className={`asg ${isFocused ? 'asg--focused' : ''}`}>
      {/* ──── CAROUSEL ──── */}
      <div
        ref={containerRef}
        className="asg__carousel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="asg__track">
          {allDecks.map((deck, index) => {
            const rawOffset = index - activeDeckIndex + dragFraction;
            const absOffset = Math.abs(rawOffset);
            const isCenter = index === activeDeckIndex && Math.abs(dragFraction) < 0.25;

            // Only render nearby items (performance)
            if (absOffset > 3) return null;

            const deckWords = getDeckWords(deck);

            return (
              <motion.div
                key={deck.id}
                className={`asg__item ${isCenter ? 'asg__item--center' : ''}`}
                animate={{
                  x: rawOffset * 250,
                  rotateY: rawOffset * -22,
                  z: -absOffset * 60,
                  scale: 1 - absOffset * 0.13,
                  opacity: Math.max(0.15, 1 - absOffset * 0.4),
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => handleItemClick(deck, index)}
                style={{
                  zIndex: 10 - Math.round(absOffset),
                  pointerEvents: isFocused ? 'none' : 'auto',
                }}
              >
                <div
                  className="asg__card"
                  style={{ '--accent': deck.color || '#e11d48' }}
                >
                  {/* Top color accent line */}
                  <div className="asg__accent" />

                  {/* Mini stack preview: top 3 words */}
                  <div className="asg__mini-stack">
                    {deckWords.length > 0 ? (
                      deckWords.slice(0, 3).map((w, i) => (
                        <div
                          key={w.word}
                          className="asg__mini-card"
                          style={{
                            transform: `translateY(${i * -6}px) rotate(${(i - 1) * 4}deg)`,
                            zIndex: 3 - i,
                            opacity: 1 - i * 0.18,
                          }}
                        >
                          <span className="asg__mini-hanzi">{w.word}</span>
                          <span className="asg__mini-pinyin">{w.pinyin}</span>
                        </div>
                      ))
                    ) : (
                      <div className="asg__mini-card asg__mini-card--empty">
                        <span>Empty</span>
                      </div>
                    )}
                  </div>

                  {/* Deck info */}
                  <h3 className="asg__title">{deck.name}</h3>
                  <span className="asg__count">{deckWords.length} cards</span>

                  {isCenter && !isFocused && (
                    <span className="asg__hint">Tap to practice</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ──── FOCUS OVERLAY + STAGE ──── */}
      <AnimatePresence>
        {isFocused && focusedDeck && (
          <>
            {/* Dim backdrop — click to exit */}
            <motion.div
              key="overlay"
              className="asg__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setFocusedId(null)}
            />

            {/* Close button */}
            <motion.button
              key="close"
              className="asg__close"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.1 }}
              onClick={() => setFocusedId(null)}
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Focused stack — all pointer events stay inside */}
            <motion.div
              key="stage"
              className="asg__stage"
              initial={{ opacity: 0, scale: 0.75, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 30 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <ChineseFlashcardStack words={getDeckWords(focusedDeck)} />
            </motion.div>

            {/* Deck label at bottom */}
            <motion.div
              key="label"
              className="asg__label"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ delay: 0.05 }}
            >
              <span className="asg__label-name">{focusedDeck.name}</span>
              <span className="asg__label-hint">ESC or tap outside to close</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──── BOTTOM NAV (dots + hint) ──── */}
      {!isFocused && (
        <div className="asg__nav">
          <div className="asg__dots">
            {allDecks.map((deck, i) => (
              <button
                key={deck.id}
                className={`asg__dot ${i === activeDeckIndex ? 'asg__dot--active' : ''}`}
                onClick={() => onActiveIndexChange(i)}
                style={{ '--dot-color': deck.color || '#e11d48' }}
                title={deck.name}
              />
            ))}
          </div>
          <span className="asg__nav-hint">
            Drag, scroll, or ← → to browse • Tap center deck to practice
          </span>
        </div>
      )}
    </div>
  );
}

export default AntigravityStackGallery;
