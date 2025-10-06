import React, { useEffect, useRef } from "react";

// Minimal SplitText: reveals characters with a staggered fade/slide using CSS only
export default function SplitText({
  text = "",
  className = "",
  delay = 80,
  duration = 0.5,
  from = { opacity: 0, y: 20 },
  to = { opacity: 1, y: 0 },
  textAlign = "left",
  onLetterAnimationComplete,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const letters = containerRef.current?.querySelectorAll('[data-letter]') || [];
    let finished = 0;
    letters.forEach((el, i) => {
      el.style.transition = `opacity ${duration}s ease, transform ${duration}s ease`;
      el.style.opacity = String(from.opacity ?? 0);
      el.style.transform = `translateY(${from.y ?? 0}px)`;
      setTimeout(() => {
        el.style.opacity = String(to.opacity ?? 1);
        el.style.transform = `translateY(${to.y ?? 0}px)`;
        setTimeout(() => {
          finished += 1;
          if (finished === letters.length && onLetterAnimationComplete) onLetterAnimationComplete();
        }, duration * 1000);
      }, i * delay);
    });
  }, [text, delay, duration, from, to, onLetterAnimationComplete]);

  return (
    <span ref={containerRef} className={className} style={{ display: 'inline-block', textAlign }}>
      {String(text).split('').map((ch, i) => (
        <span key={i} data-letter style={{ display: 'inline-block', willChange: 'transform,opacity' }}>{ch}</span>
      ))}
    </span>
  );
}
