import React, { useMemo } from "react";

// Lightweight fallback Particles component
// Props: particleColors (string[]), particleCount, particleSpread, speed, particleBaseSize,
//        moveParticlesOnHover, alphaParticles, disableRotation, className
// Renders simple absolutely positioned circles for visual flair (non-canvas for simplicity)
export default function Particles({
  particleColors = ["#ffffff"],
  particleCount = 80,
  particleSpread = 12,
  speed = 0.15,
  particleBaseSize = 24,
  moveParticlesOnHover = true,
  alphaParticles = true,
  disableRotation = false,
  className = "",
  style,
}) {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      const size = Math.max(4, Math.round(particleBaseSize * (0.25 + Math.random())));
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const color = particleColors[i % particleColors.length] || "#ffffff";
      const opacity = alphaParticles ? (0.25 + Math.random() * 0.5) : 1;
      const duration = 10 + Math.random() * 20;
      arr.push({ i, size, top, left, color, opacity, duration });
    }
    return arr;
  }, [particleCount, particleColors, particleBaseSize, alphaParticles]);

  return (
    <div
      className={"pointer-events-none absolute inset-0 overflow-hidden " + className}
      style={style}
      aria-hidden
    >
      <style>{`
        @keyframes fin-float {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-6px) }
          100% { transform: translateY(0px) }
        }
      `}</style>
      {particles.map(p => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "9999px",
            background: p.color,
            opacity: p.opacity,
            animation: `fin-float ${p.duration / (speed || 0.1)}s ease-in-out infinite`,
            filter: disableRotation ? undefined : "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}
