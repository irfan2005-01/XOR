"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  COSMIC_PALETTE_RGB,
  createSeededRandom,
  pickCosmicColorIndex,
  type ParticleColorIndex,
} from "@/lib/particle-physics";

const DESKTOP_STARDUST_COUNT = 260;
const MOBILE_STARDUST_COUNT = 130;

interface StardustParticle {
  nx: number;
  ny: number;
  depth: number;
  radius: number;
  minAlpha: number;
  maxAlpha: number;
  phase: number;
  twinkleSpeed: number;
  driftVx: number;
  driftVy: number;
  colorIdx: ParticleColorIndex;
}

function buildStardustField(count: number, seed = 42026): StardustParticle[] {
  const rand = createSeededRandom(seed);
  const particles: StardustParticle[] = [];

  for (let i = 0; i < count; i++) {
    const colorIdx = pickCosmicColorIndex(rand());
    const depth = 0.25 + rand() * 0.75;
    const minAlpha = 0.15 + rand() * 0.12;
    const maxAlpha = Math.min(0.65, minAlpha + 0.18 + rand() * 0.24);

    particles.push({
      nx: rand(),
      ny: rand(),
      depth,
      radius: 0.6 + rand() * 1.15,
      minAlpha,
      maxAlpha,
      phase: rand() * Math.PI * 2,
      twinkleSpeed: 0.65 + rand() * 1.35,
      // Subtle upward & gentle diagonal drift across the deep-space canvas
      driftVx: (0.002 + rand() * 0.0045) * (rand() < 0.72 ? 1 : -0.6),
      driftVy: -(0.004 + rand() * 0.009) * (0.6 + depth * 0.6),
      colorIdx,
    });
  }

  return particles;
}

function AmbientSpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particleCount, setParticleCount] = useState<number>(DESKTOP_STARDUST_COUNT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;
    let targetCount = isMobile ? MOBILE_STARDUST_COUNT : DESKTOP_STARDUST_COUNT;
    let particles = buildStardustField(targetCount);
    setParticleCount(targetCount);

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nextIsMobile = width < 768;
      if (nextIsMobile !== isMobile) {
        isMobile = nextIsMobile;
        targetCount = isMobile ? MOBILE_STARDUST_COUNT : DESKTOP_STARDUST_COUNT;
        particles = buildStardustField(targetCount);
        setParticleCount(targetCount);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion || width <= 0 || height <= 0) return;
      pointerTargetX = e.clientX / width - 0.5;
      pointerTargetY = e.clientY / height - 0.5;
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    const drawFrame = (timeSec: number, dt: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      if (animate) {
        const smooth = 1 - Math.exp(-dt * 4.5);
        pointerX += (pointerTargetX - pointerX) * smooth;
        pointerY += (pointerTargetY - pointerY) * smooth;
      }

      const parallaxScaleX = isMobile ? 10 : 22;
      const parallaxScaleY = isMobile ? 8 : 16;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (animate) {
          p.nx = (p.nx + p.driftVx * dt + 1) % 1;
          p.ny = (p.ny + p.driftVy * dt + 1) % 1;
        }

        const px = p.nx * width + pointerX * p.depth * parallaxScaleX;
        const py = p.ny * height + pointerY * p.depth * parallaxScaleY;

        const twinkle = animate
          ? 0.5 + 0.5 * Math.sin(timeSec * p.twinkleSpeed + p.phase)
          : 0.55;
        const alpha = p.minAlpha + twinkle * (p.maxAlpha - p.minAlpha);

        const [r, g, b] = COSMIC_PALETTE_RGB[p.colorIdx];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft halo on brighter foreground orange/sky sparks
        if (p.colorIdx !== 0 && p.radius > 1.2) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    resizeCanvas();

    let rafId = 0;
    let lastTimestamp = performance.now();

    if (prefersReducedMotion) {
      drawFrame(0, 0, false);
    } else {
      const tick = (now: number) => {
        const dt = Math.min(Math.max((now - lastTimestamp) / 1000, 0.001), 0.05);
        lastTimestamp = now;
        drawFrame(now / 1000, dt, true);
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);
    }

    const handleResize = () => {
      resizeCanvas();
      if (prefersReducedMotion) {
        drawFrame(0, 0, false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="ambient-space-canvas"
      data-particle-count={particleCount}
      className="absolute inset-0 h-full w-full"
    />
  );
}

export function AmbientSpaceBackdrop() {
  const pathname = usePathname();

  // Keep Homepage (/) 100% untouched — only render on inner routes
  if (pathname === "/") {
    return null;
  }

  return (
    <div
      data-testid="ambient-space-backdrop"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Soft Dual-Tone Nebula Glows (Light Orange upper-left + Electric Sky lower-right) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 62% 52% at 18% 12%, rgba(251, 146, 60, 0.07) 0%, rgba(251, 146, 60, 0) 70%)",
            "radial-gradient(ellipse 58% 50% at 84% 86%, rgba(56, 189, 248, 0.06) 0%, rgba(56, 189, 248, 0) 72%)",
          ].join(", "),
        }}
      />

      {/* Subtle Radial-Masked Architectural Star-Grid Texture */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 75% at 50% 45%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 75% at 50% 45%, black 35%, transparent 100%)",
        }}
      />

      {/* Lightweight Drifting Cosmic Stardust Canvas */}
      <AmbientSpaceCanvas />
    </div>
  );
}
