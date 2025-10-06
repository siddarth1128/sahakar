import React, { useEffect, useRef } from "react";

// Simple IntersectionObserver-based reveal wrapper with optional blur/rotation
export default function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = false,
  baseRotation = 0,
  blurStrength = 6,
  className = "",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  duration = 500,
  delay = 0,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const initial = `opacity: ${baseOpacity}; transform: translateY(12px) rotate(${baseRotation}deg); ${enableBlur ? `filter: blur(${blurStrength}px);` : ''}`;
    node.setAttribute('style', `${node.getAttribute('style') || ''}; ${initial}`);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            node.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease, filter ${duration}ms ease`;
            node.style.opacity = 1;
            node.style.transform = 'translateY(0px) rotate(0deg)';
            if (enableBlur) node.style.filter = 'blur(0px)';
          }, delay);
          obs.unobserve(node);
        }
      });
    }, { threshold, rootMargin });

    obs.observe(node);
    return () => obs.disconnect();
  }, [baseOpacity, enableBlur, baseRotation, blurStrength, threshold, rootMargin, duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
