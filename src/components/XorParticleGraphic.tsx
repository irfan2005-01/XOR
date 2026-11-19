"use client";

import React, { useEffect, useRef } from "react";
import {
  AMBIENT_STAR_COUNT,
  COSMIC_PALETTE_RGB,
  createAmbientStars,
  createSpaceParticles,
  getParticleBudget,
  getSceneAnchorConfig,
  projectPoint3D,
  stepMorphParticles,
  type AmbientStar,
  type SpaceParticle,
} from "@/lib/particle-physics";
import {
  PARTICLE_MORPH_DURATION_MS,
  PARTICLE_MORPH_LERP_60FPS,
  SCENE_META,
  clampSceneIndex,
  getMorphLerpFactor,
  getMorphTransitionProgress,
} from "@/lib/stage-controller";

interface XorParticleGraphicProps {
  activeScene: number;
}

export function XorParticleGraphic({ activeScene }: XorParticleGraphicProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetSceneRef = useRef<number>(clampSceneIndex(activeScene));
  const transitionStartRef = useRef<number>(0);
  const hasMountedSceneRef = useRef<boolean>(false);

  // Trigger a fresh ~900ms scatter-and-glide morph whenever the locked scene steps
  useEffect(() => {
    const nextScene = clampSceneIndex(activeScene);
    if (!hasMountedSceneRef.current) {
      hasMountedSceneRef.current = true;
      targetSceneRef.current = nextScene;
      transitionStartRef.current = 0;
      return;
    }
    if (nextScene !== targetSceneRef.current) {
      targetSceneRef.current = nextScene;
      transitionStartRef.current = performance.now();
    }
  }, [activeScene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let budget = getParticleBudget(width);
    let particles: SpaceParticle[] = createSpaceParticles(budget);
    const stars: AmbientStar[] = createAmbientStars(AMBIENT_STAR_COUNT);

    // Smoothly interpolated viewport anchor & scale for discrete scene gliding
    const initialAnchor = getSceneAnchorConfig(
      targetSceneRef.current,
      width < 768
    );
    let currentAnchorX = initialAnchor.anchorX;
    let currentAnchorY = initialAnchor.anchorY;
    let currentScale = initialAnchor.scale;
    let currentSceneSpin = targetSceneRef.current * 0.55;

    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    let animFrame = 0;
    let lastSceneAttr = -1;

    // 3 cosmic colors (65% White, 20% Light Orange #FB923C, 15% Electric Sky Blue #38BDF8)
    const COLOR_COUNT = 3;

    // Precomputed 0-100 alpha RGBA strings to eliminate per-frame string allocations
    const rgbaLookup: string[][] = [[], [], []];
    const haloLookup: string[][] = [[], [], []];
    for (let c = 0; c < COLOR_COUNT; c++) {
      const [r, g, b] = COSMIC_PALETTE_RGB[c];
      for (let a = 0; a <= 100; a++) {
        const normA = a / 100;
        rgbaLookup[c][a] = `rgba(${r}, ${g}, ${b}, ${normA.toFixed(2)})`;
        haloLookup[c][a] = `rgba(${r}, ${g}, ${b}, ${(normA * (c === 0 ? 0.22 : 0.3)).toFixed(3)})`;
      }
    }

    const starFillStyles: string[] = [];
    const STAR_ALPHAS = [0.18, 0.34, 0.54];
    for (let c = 0; c < COLOR_COUNT; c++) {
      const [r, g, b] = COSMIC_PALETTE_RGB[c];
      for (let t = 0; t < 3; t++) {
        starFillStyles.push(`rgba(${r}, ${g}, ${b}, ${STAR_ALPHAS[t]})`);
      }
    }

    const maxParticles = 3200;
    const projX = new Float32Array(maxParticles);
    const projY = new Float32Array(maxParticles);
    const projR = new Float32Array(maxParticles);
    const projDepth = new Float32Array(maxParticles);
    const projColor = new Uint8Array(maxParticles);
    const projAlphaIdx = new Uint8Array(maxParticles);
    const sortIndices = new Int32Array(maxParticles);

    const syncCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nextBudget = getParticleBudget(width);
      if (nextBudget !== budget) {
        budget = nextBudget;
        particles = createSpaceParticles(budget);
      }
      canvas.dataset.particleCount = String(particles.length);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (width <= 0 || height <= 0) return;
      const nx = (e.clientX / width - 0.5) * 2;
      const ny = (e.clientY / height - 0.5) * 2;
      targetTiltY = nx * 0.3;
      targetTiltX = -ny * 0.2;
    };

    const handlePointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const renderFrame = (
      nowMs: number,
      timeSec: number,
      dt: number,
      isStatic: boolean
    ) => {
      ctx.clearRect(0, 0, width, height);

      const sceneIdx = targetSceneRef.current;
      const isMobile = width < 768;

      if (sceneIdx !== lastSceneAttr) {
        lastSceneAttr = sceneIdx;
        canvas.dataset.scene = String(sceneIdx);
        canvas.dataset.morphStage = SCENE_META[sceneIdx]?.stage ?? "rocket";
      }

      const elapsedMorphMs =
        transitionStartRef.current > 0 ? nowMs - transitionStartRef.current : PARTICLE_MORPH_DURATION_MS;
      const transitionProgress = isStatic
        ? 1
        : getMorphTransitionProgress(elapsedMorphMs, PARTICLE_MORPH_DURATION_MS);

      const smoothLerp = isStatic
        ? 1
        : getMorphLerpFactor(dt, PARTICLE_MORPH_LERP_60FPS);

      if (!isStatic) {
        const tiltLerp = 1 - Math.exp(-6.0 * Math.min(dt, 0.04));
        currentTiltX += (targetTiltX - currentTiltX) * tiltLerp;
        currentTiltY += (targetTiltY - currentTiltY) * tiltLerp;
      }

      // Smoothly glide viewport anchor & scale at the same balanced medium pace
      const targetAnchor = getSceneAnchorConfig(sceneIdx, isMobile);
      currentAnchorX += (targetAnchor.anchorX - currentAnchorX) * smoothLerp;
      currentAnchorY += (targetAnchor.anchorY - currentAnchorY) * smoothLerp;
      currentScale += (targetAnchor.scale - currentScale) * smoothLerp;
      currentSceneSpin += (sceneIdx * 0.55 - currentSceneSpin) * smoothLerp;

      // 1. Render 280 multi-tint drifting ambient background stars
      const parallaxOffsetX = currentTiltY * 26;
      const parallaxOffsetY = currentTiltX * 20;
      const sceneDriftY = currentSceneSpin * 64;

      for (let c = 0; c < COLOR_COUNT; c++) {
        for (let tier = 0; tier < 3; tier++) {
          ctx.fillStyle = starFillStyles[c * 3 + tier];
          for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            if (s.colorIdx !== c) continue;
            const starTier = s.alpha < 0.28 ? 0 : s.alpha < 0.44 ? 1 : 2;
            if (starTier !== tier) continue;
            if (!isStatic) {
              s.nx = (s.nx + s.driftVx * dt + 1) % 1;
              s.ny = (s.ny + s.driftVy * dt + 1) % 1;
            }
            const sx =
              ((s.nx * width + parallaxOffsetX * s.depth) % width + width) %
              width;
            const sy =
              ((s.ny * height -
                sceneDriftY * s.depth +
                parallaxOffsetY * s.depth) %
                height +
                height) %
              height;
            const size = Math.max(0.6, s.radius * 1.4);
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Step balanced spring 3D particle morphing (~850ms settling)
      stepMorphParticles(
        particles,
        sceneIdx,
        transitionProgress,
        timeSec,
        dt,
        isStatic
      );

      // Gentle ambient 3D orbital spin + cursor parallax
      const idleSpin = isStatic
        ? 0.14
        : sceneIdx === 0
          ? Math.sin(timeSec * 0.5) * 0.22
          : sceneIdx === 4
            ? Math.sin(timeSec * 0.65) * 0.22
            : timeSec * 0.26;
      const rotY = idleSpin + currentSceneSpin + currentTiltY;
      const rotX =
        (isStatic ? 0.05 : Math.sin(timeSec * 0.35) * 0.07) + currentTiltX;

      const originX = currentAnchorX * width;
      const originY = currentAnchorY * height;
      const viewportScale =
        (Math.min(width, height) / 760) *
        currentScale *
        (isMobile ? 1.0 : 1.06);

      // 3. Project 3D points
      let visibleCount = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const proj = projectPoint3D(
          p.x,
          p.y,
          p.z,
          rotY,
          rotX,
          originX,
          originY,
          viewportScale
        );

        if (
          proj.screenX < -32 ||
          proj.screenX > width + 32 ||
          proj.screenY < -32 ||
          proj.screenY > height + 32
        ) {
          continue;
        }

        const twinkle = isStatic
          ? 1
          : 0.84 + 0.16 * Math.sin(timeSec * p.twinkleSpeed + p.phase);
        
        // Depth-scaled opacity: 0.22 far -> 0.95 near
        const depthOpacity =
          (0.22 + 0.73 * proj.depthNorm) * p.baseAlpha * twinkle;
        const alphaIdx = Math.min(
          100,
          Math.max(0, Math.round(depthOpacity * 100))
        );

        // Depth-scaled radius
        const drawRadius = Math.max(
          0.72,
          p.radius * proj.perspective * (0.65 + 0.55 * proj.depthNorm)
        );

        projX[visibleCount] = proj.screenX;
        projY[visibleCount] = proj.screenY;
        projR[visibleCount] = drawRadius;
        projDepth[visibleCount] = proj.depthNorm;
        projColor[visibleCount] = p.colorIdx;
        projAlphaIdx[visibleCount] = alphaIdx;
        sortIndices[visibleCount] = visibleCount;
        visibleCount++;
      }

      // 4. Depth-sort particles back-to-front (ascending depthNorm: 0.0 far -> 1.0 near)
      const visibleIndices = sortIndices.subarray(0, visibleCount);
      visibleIndices.sort((a, b) => projDepth[a] - projDepth[b]);

      // 5. Draw smooth anti-aliased glowing 3D spheres with subtle additive luminosity
      ctx.globalCompositeOperation = "lighter";

      for (let s = 0; s < visibleCount; s++) {
        const idx = visibleIndices[s];
        const x = projX[idx];
        const y = projY[idx];
        const r = projR[idx];
        const c = projColor[idx];
        const a = projAlphaIdx[idx];
        const depthNorm = projDepth[idx];

        // Luminous halo for front-depth particles
        if (depthNorm > 0.52 && a > 22) {
          ctx.fillStyle = haloLookup[c][a];
          ctx.beginPath();
          ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crisp anti-aliased glowing sphere
        ctx.fillStyle = rgbaLookup[c][a];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    if (reducedMotion) {
      const renderStatic = () => renderFrame(performance.now(), 0, 0.016, true);
      renderStatic();
      const onResizeStatic = () => {
        syncCanvasSize();
        renderStatic();
      };
      window.addEventListener("resize", onResizeStatic, { passive: true });
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        window.removeEventListener("resize", syncCanvasSize);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      };
    }

    const startTime = performance.now();
    let lastTime = startTime;
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      renderFrame(now, (now - startTime) / 1000, dt, false);
      animFrame = requestAnimationFrame(loop);
    };
    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", syncCanvasSize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="xor-particle-graphic"
      data-scene={activeScene}
      data-morph-stage={SCENE_META[activeScene]?.stage ?? "rocket"}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 block"
    />
  );
}
