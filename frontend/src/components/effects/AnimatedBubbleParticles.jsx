"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export default function AnimatedBubbleParticles({
  className,
  backgroundColor = "#edf3f8",
  particleColor = "#3e82f7",
  particleSize = 28,
  spawnInterval = 180,
  height = "100vh",
  width = "100vw",
  enableGooEffect = true,
  blurStrength = 12,
  pauseOnBlur = true,
  zIndex = 0,
  friction = { min: 1, max: 2 },
  scaleRange = { min: 0.4, max: 2.0 },
  children,
}) {
  const containerRef = useRef(null);
  const particlesRef = useRef(null);
  const animationRef = useRef();
  const intervalRef = useRef();
  const particlesArrayRef = useRef([]);
  const isPausedRef = useRef(false);
  const gooIdRef = useRef("goo-" + Math.random().toString(36).slice(2));

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const createParticleElement = useCallback(() => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = `display:block;width:${particleSize}px;height:${particleSize}px;position:absolute;transform:translateZ(0)`;
    svg.setAttribute("viewBox", "0 0 67.4 67.4");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "33.7");
    circle.setAttribute("cy", "33.7");
    circle.setAttribute("r", "33.7");
    circle.setAttribute("fill", particleColor);
    svg.appendChild(circle);
    return svg;
  }, [particleSize, particleColor]);

  const createParticle = useCallback(() => {
    const element = createParticleElement();
    particlesRef.current && particlesRef.current.appendChild(element);

    const x = Math.random() * dimensions.width;
    const y = dimensions.height + 100;
    const steps = Math.max(100, dimensions.height / 2);
    const frictionValue = friction.min + Math.random() * (friction.max - friction.min);
    const scale = scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min);
    const siner = (dimensions.width / 2.5) * Math.random();
    const rotationDirection = Math.random() > 0.5 ? "+" : "-";

    element.style.transform = `translateX(${x}px) translateY(${y}px)`;

    return { x, y, vx: 0, vy: 0, scale, rotation: 0, rotationDirection, siner, steps, friction: frictionValue, element };
  }, [createParticleElement, dimensions, friction, scaleRange]);

  const updateParticle = (p) => {
    p.y -= p.friction;
    const left = p.x + Math.sin((p.y * Math.PI) / p.steps) * p.siner;
    const top = p.y;
    const rotation = p.rotationDirection + (p.y + particleSize);

    if (p.element) {
      p.element.style.transform = `translateX(${left}px) translateY(${top}px) scale(${p.scale}) rotate(${rotation}deg)`;
    }

    if (p.y < -particleSize) {
      if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element);
      }
      return false;
    }
    return true;
  };

  const animate = useCallback(() => {
    if (isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    particlesArrayRef.current = particlesArrayRef.current.filter(updateParticle);
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const spawnParticle = useCallback(() => {
    if (!isPausedRef.current && dimensions.width > 0 && dimensions.height > 0) {
      particlesArrayRef.current.push(createParticle());
    }
  }, [dimensions, createParticle]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!pauseOnBlur) return;
    const handleBlur = () => (isPausedRef.current = true);
    const handleFocus = () => (isPausedRef.current = false);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [pauseOnBlur]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      animationRef.current = requestAnimationFrame(animate);
      intervalRef.current = window.setInterval(spawnParticle, spawnInterval);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      particlesArrayRef.current.forEach((p) => {
        if (p.element && p.element.parentNode) p.element.parentNode.removeChild(p.element);
      });
      particlesArrayRef.current = [];
    };
  }, [dimensions, spawnInterval, animate, spawnParticle]);

  const backgroundClass = (() => {
    if (className && className.split(" ").some((cls) => cls.startsWith("bg-"))) return "";
    return `bg-[${backgroundColor}]`;
  })();

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden w-screen h-screen", backgroundClass, className)}
      style={{ zIndex, width, height }}
    >
      <div
        ref={particlesRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ filter: enableGooEffect ? `url(#${gooIdRef.current})` : undefined }}
      />

      <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full">{children}</div>

      {enableGooEffect && (
        <svg className="absolute w-0 h-0 z-0">
          <defs>
            <filter id={gooIdRef.current}>
              <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={blurStrength} />
              <feColorMatrix in="blur" result="colormatrix" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -9" />
              <feBlend in="SourceGraphic" in2="colormatrix" />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
}
