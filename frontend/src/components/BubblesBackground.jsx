import { useEffect, useRef } from "react";
import clsx from "clsx";

/**
 * BubblesBackground - lightweight animated bubbles canvas
 * Props:
 * - color: CSS color string (default: 'rgba(0,0,0,0.15)')
 * - count: number of bubbles (default: 40)
 * - speed: multiplier for animation speed (default: 1)
 * - className: extra classes for wrapper (position: absolute recommended)
 * - blur: tailwind blur amount class, e.g., 'backdrop-blur-sm'
 */
export default function BubblesBackground({
  color = "rgba(0,0,0,0.15)",
  count = 40,
  speed = 1,
  className,
  blur,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let width = 0;
    let height = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initBubbles();
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const initBubbles = () => {
      const next = [];
      const bubbleCount = Math.max(8, Math.min(200, count));
      for (let i = 0; i < bubbleCount; i++) {
        next.push({
          x: rand(0, width),
          y: rand(0, height),
          r: rand(6, 28),
          vx: rand(-0.3, 0.3) * speed,
          vy: rand(-0.25, 0.25) * speed,
          alpha: rand(0.08, 0.22),
        });
      }
      bubblesRef.current = next;
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      const bubbles = bubblesRef.current;
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = color.includes("rgba(") || color.includes("hsla(")
          ? color
          : `${color}`;
        ctx.globalAlpha = b.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    step();

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [color, count, speed]);

  return (
    <div className={clsx("absolute inset-0", blur, className)} aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
