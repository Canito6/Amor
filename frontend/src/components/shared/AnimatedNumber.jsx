import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, isFirstLoad = true }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseInt(value, 10);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (isNaN(targetValue)) {
      setDisplayValue(value);
      return;
    }

    // Acessibilidade: verificar prefers-reduced-motion no browser
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (!isFirstLoad || hasAnimatedRef.current || prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    hasAnimatedRef.current = true;
    const duration = 1200; // 1.2s para suavidade
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing outQuad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * targetValue);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, targetValue, isFirstLoad]);

  const isFinished = displayValue === targetValue;
  const paddingLength = String(value).length;
  
  return (
    <span>
      {isFinished ? value : String(displayValue).padStart(paddingLength, '0')}
    </span>
  );
}
