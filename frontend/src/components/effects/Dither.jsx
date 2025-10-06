import React, { useEffect, useRef } from "react";

// Minimal dithering-like wave effect on canvas for ambient backgrounds
export default function Dither({
  waveColor = [0.6, 0.6, 0.6],
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 0.25,
  colorNum = 4,
  waveAmplitude = 0.25,
  waveFrequency = 2.5,
  waveSpeed = 0.05,
  className = "",
  style,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const mouse = useRef({ x: 0, y: 0, inside: false });

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let w = 0, h = 0, t = 0;

    const setSize = () => {
      const pr = window.devicePixelRatio || 1;
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.max(1, Math.floor(w * pr));
      c.height = Math.max(1, Math.floor(h * pr));
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const onEnter = () => (mouse.current.inside = true);
    const onLeave = () => (mouse.current.inside = false);
    const onMove = (e) => {
      const rect = c.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
    };

    if (enableMouseInteraction) {
      c.addEventListener('mouseenter', onEnter);
      c.addEventListener('mouseleave', onLeave);
      c.addEventListener('mousemove', onMove);
    }

    const draw = () => {
      if (disableAnimation) return;
      t += waveSpeed;
      ctx.clearRect(0, 0, w, h);
      // Draw simple stripes with sinusoidal offset
      const rows = Math.max(8, Math.floor(24 * waveFrequency));
      for (let y = 0; y < rows; y++) {
        const ry = y / rows;
        const phase = t + ry * Math.PI * 2 * waveFrequency;
        const offset = Math.sin(phase) * waveAmplitude * w * 0.08;
        const bands = colorNum;
        for (let x = 0; x < bands; x++) {
          const rx = x / bands;
          const base = 220 * (0.6 + 0.4 * (x / (bands - 1)));
          const r = Math.floor(base * waveColor[0]);
          const g = Math.floor(base * waveColor[1]);
          const b = Math.floor(base * waveColor[2]);
          ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
          const mw = mouse.current.inside ? (1 - Math.hypot(mouse.current.x - rx, mouse.current.y - ry) / mouseRadius) : 0;
          const mx = isNaN(mw) ? 0 : mw * 24;
          ctx.fillRect((rx * w) + offset + mx, ry * h, w / bands + 4, h / rows + 2);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      if (enableMouseInteraction) {
        c.removeEventListener('mouseenter', onEnter);
        c.removeEventListener('mouseleave', onLeave);
        c.removeEventListener('mousemove', onMove);
      }
    };
  }, [waveColor, disableAnimation, enableMouseInteraction, mouseRadius, colorNum, waveAmplitude, waveFrequency, waveSpeed]);

  return <canvas ref={canvasRef} className={"absolute inset-0 w-full h-full " + className} style={style} />;
}
