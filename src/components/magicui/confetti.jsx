import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import confetti from 'canvas-confetti';

export const ConfettiContext = createContext({});

export const Confetti = forwardRef((props, ref) => {
  const {
    options = {},
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    className = '',
    style = {},
    ...rest
  } = props;
  const instanceRef = useRef(null);

  const canvasRef = useCallback(
    (node) => {
      if (node !== null) {
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );

  const fire = useCallback(
    (opts = {}) => {
      const defaultSparkle = {
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'],
        ticks: 200,
        gravity: 1.1,
        scalar: 0.9
      };

      if (instanceRef.current) {
        instanceRef.current({
          ...defaultSparkle,
          ...options,
          ...opts
        });
      } else {
        confetti({
          ...defaultSparkle,
          ...options,
          ...opts
        });
      }
    },
    [options]
  );

  // Single instantaneous pop burst (ยิงจึ๊กเดียว ไม่แช่)
  const fireCannons = useCallback(() => {
    const colors = ['#e11d48', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6'];

    // Left side pop
    fire({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.75 },
      colors
    });

    // Right side pop
    fire({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.75 },
      colors
    });
  }, [fire]);

  const api = {
    fire,
    fireCannons
  };

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      fireCannons();
    }
  }, [manualstart, fireCannons]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ pointerEvents: 'none', ...style }}
        {...rest}
      />
      {children}
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = 'Confetti';

export default Confetti;
