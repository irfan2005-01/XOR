"use client";

import React, { useEffect, useRef } from "react";
import {
  CENTER,
  LOGICAL_SIZE,
  PARTICLE_COUNT,
  PARTICLE_PALETTE,
  X_HALF_HEIGHT,
  X_SLOPE,
  X_STROKE_HALF_WIDTH,
  createParticles,
  stepParticleField,
  type PointerState,
} from "@/lib/particle-physics";

export function XorParticleGraphic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<PointerState>({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    active: false,
  });
  const prevPointerPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = createParticles(PARTICLE_COUNT);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animFrame = 0;
    let currentScale = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const displaySize = Math.max(240, Math.min(rect.width || LOGICAL_SIZE, LOGICAL_SIZE));

      canvas.width = Math.round(displaySize * dpr);
      canvas.height = Math.round(displaySize * dpr);
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;

      currentScale = displaySize / LOGICAL_SIZE;
      ctx.setTransform(dpr * currentScale, 0, 0, dpr * currentScale, 0, 0);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) {
        drawFrame(0, 0.016, true);
      }
    });
    resizeObserver.observe(container);

    const drawArchitecturalGuides = () => {
      const outerSpanX = X_SLOPE * X_HALF_HEIGHT + X_STROKE_HALF_WIDTH + 18;
      const outerSpanY = X_HALF_HEIGHT + 18;

      // Subtle architectural bounding frame hairlines (#484A43 at 35% opacity)
      ctx.strokeStyle = "rgba(72, 74, 67, 0.32)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        CENTER - outerSpanX,
        CENTER - outerSpanY,
        outerSpanX * 2,
        outerSpanY * 2
      );

      // Subtle intersecting diagonal guide hairlines behind the X
      ctx.beginPath();
      ctx.moveTo(CENTER - outerSpanX, CENTER - outerSpanY);
      ctx.lineTo(CENTER + outerSpanX, CENTER + outerSpanY);
      ctx.moveTo(CENTER + outerSpanX, CENTER - outerSpanY);
      ctx.lineTo(CENTER - outerSpanX, CENTER + outerSpanY);
      ctx.strokeStyle = "rgba(72, 74, 67, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Corner Brick Rose calibration ticks
      const tick = 10;
      const left = CENTER - outerSpanX;
      const right = CENTER + outerSpanX;
      const top = CENTER - outerSpanY;
      const bottom = CENTER + outerSpanY;

      ctx.beginPath();
      // Top-left
      ctx.moveTo(left, top + tick);
      ctx.lineTo(left, top);
      ctx.lineTo(left + tick, top);
      // Top-right
      ctx.moveTo(right - tick, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, top + tick);
      // Bottom-left
      ctx.moveTo(left, bottom - tick);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + tick, bottom);
      // Bottom-right
      ctx.moveTo(right - tick, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, bottom - tick);
      ctx.strokeStyle = "rgba(188, 128, 106, 0.48)";
      ctx.lineWidth = 1.25;
      ctx.stroke();
    };

    const drawFrame = (timeSec: number, dt: number, isStatic: boolean) => {
      ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
      drawArchitecturalGuides();

      const pointer = pointerRef.current;

      if (!isStatic) {
        stepParticleField(particles, pointer, timeSec, dt);

        // Smoothly decay pointer wake velocity when cursor pauses
        const wakeDecay = Math.exp(-8 * Math.min(dt, 0.04));
        pointer.vx *= wakeDecay;
        pointer.vy *= wakeDecay;
      }

      // Batch ~2,600 particles by (colorIndex x alphaBucket) — max 15 draw calls per frame
      const ALPHA_BUCKETS = 5;
      const buckets: number[][][] = PARTICLE_PALETTE.map(() =>
        Array.from({ length: ALPHA_BUCKETS }, () => [])
      );

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const alpha = Math.min(1, p.baseAlpha + p.heat * 0.42);
        const aIdx = Math.min(
          ALPHA_BUCKETS - 1,
          Math.max(0, Math.floor(((alpha - 0.5) / 0.5) * ALPHA_BUCKETS))
        );
        buckets[p.colorIndex][aIdx].push(i);
      }

      for (let c = 0; c < PARTICLE_PALETTE.length; c++) {
        const [r, g, b] = PARTICLE_PALETTE[c];
        for (let a = 0; a < ALPHA_BUCKETS; a++) {
          const list = buckets[c][a];
          if (list.length === 0) continue;

          const bucketAlpha = Math.min(1, 0.54 + (a / (ALPHA_BUCKETS - 1)) * 0.46);
          ctx.beginPath();
          for (let j = 0; j < list.length; j++) {
            const p = particles[list[j]];
            const drawRadius = p.radius + p.heat * 0.28;
            ctx.moveTo(p.x + drawRadius, p.y);
            ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bucketAlpha.toFixed(2)})`;
          ctx.fill();
        }
      }
    };

    if (reducedMotion) {
      drawFrame(0, 0.016, true);
    } else {
      const startTime = performance.now();
      let lastTime = startTime;
      const loop = (now: number) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        drawFrame((now - startTime) / 1000, dt, false);
        animFrame = requestAnimationFrame(loop);
      };
      animFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  const updatePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const scaleX = LOGICAL_SIZE / rect.width;
    const scaleY = LOGICAL_SIZE / rect.height;
    const nextX = (e.clientX - rect.left) * scaleX;
    const nextY = (e.clientY - rect.top) * scaleY;
    const now = performance.now();

    const prev = prevPointerPosRef.current;
    if (prev) {
      const dt = Math.max(0.008, (now - prev.time) / 1000);
      const rawVx = Math.max(-500, Math.min(500, (nextX - prev.x) / dt));
      const rawVy = Math.max(-500, Math.min(500, (nextY - prev.y) / dt));
      pointerRef.current.vx = pointerRef.current.vx * 0.5 + rawVx * 0.5;
      pointerRef.current.vy = pointerRef.current.vy * 0.5 + rawVy * 0.5;
    }

    prevPointerPosRef.current = { x: nextX, y: nextY, time: now };
    pointerRef.current.x = nextX;
    pointerRef.current.y = nextY;
    pointerRef.current.active = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.x = -9999;
    pointerRef.current.y = -9999;
    pointerRef.current.vx = 0;
    pointerRef.current.vy = 0;
    prevPointerPosRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[240px] sm:h-[340px] lg:h-[420px] max-w-[420px] aspect-square mx-auto flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        data-testid="xor-particle-graphic"
        onPointerEnter={updatePointer}
        onPointerMove={updatePointer}
        onPointerDown={updatePointer}
        onPointerLeave={handlePointerLeave}
        className="block cursor-crosshair touch-none"
        aria-label="Interactive XOR particle letter X graphic"
        role="img"
      />
    </div>
  );
}
