"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { BRAND_CONFIG } from "@/data/psyctech";

interface PreloaderProps {
  onExitStart?: () => void;
}

const PRELOADED_KEY = "xor_preloaded";

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getClientSnapshot = () => {
  try {
    return sessionStorage.getItem(PRELOADED_KEY) === "true";
  } catch {
    return false;
  }
};

const getServerSnapshot = () => false;

export function Preloader({ onExitStart }: PreloaderProps) {
  const alreadyPreloaded = useSyncExternalStore(
    subscribeStorage,
    getClientSnapshot,
    getServerSnapshot
  );
  const [isDismissed, setIsDismissed] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const fillTextRef = useRef<HTMLSpanElement | null>(null);

  const onExitStartRef = useRef(onExitStart);
  useEffect(() => {
    onExitStartRef.current = onExitStart;
  }, [onExitStart]);

  const brandText = BRAND_CONFIG.name.toUpperCase();

  useEffect(() => {
    if (alreadyPreloaded || isDismissed) return;

    let animFrame: number;
    let exitTriggered = false;

    const fillDuration = 1250; // 1.25s smooth letter fill
    const holdDuration = 160; // 160ms lock beat at 100%
    const zoomDuration = 760; // 760ms exponential zoom-through centered on the O in XOR

    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;

      // PHASE 1: Smooth Letter-Fill (0% -> 100%)
      if (elapsed < fillDuration) {
        const t = elapsed / fillDuration;
        const eased =
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const pct = eased * 100;

        if (fillTextRef.current) {
          fillTextRef.current.style.clipPath = `inset(0 ${Math.max(
            0,
            100 - pct
          ).toFixed(2)}% 0 0)`;
        }
        if (counterRef.current) {
          counterRef.current.textContent = `${Math.round(pct)}%`;
        }

        animFrame = requestAnimationFrame(frame);
        return;
      }

      // PHASE 2: Crisp 160ms Lock Beat
      const postFill = elapsed - fillDuration;
      if (postFill < holdDuration) {
        if (fillTextRef.current) fillTextRef.current.style.clipPath = "none";
        if (counterRef.current) counterRef.current.textContent = "100%";

        const chromeOpacity = Math.max(0, 1 - postFill / holdDuration).toFixed(3);
        if (topBarRef.current) topBarRef.current.style.opacity = chromeOpacity;
        if (statusRef.current) statusRef.current.style.opacity = chromeOpacity;

        animFrame = requestAnimationFrame(frame);
        return;
      }

      // PHASE 3: Exponential Zoom-Through Center of XOR ("O" Aperture)
      if (!exitTriggered) {
        exitTriggered = true;
        if (topBarRef.current) topBarRef.current.style.opacity = "0";
        if (statusRef.current) statusRef.current.style.opacity = "0";
        if (overlayRef.current) overlayRef.current.style.pointerEvents = "none";
        if (onExitStartRef.current) onExitStartRef.current();
      }

      const zoomElapsed = postFill - holdDuration;
      const zt = Math.min(1, zoomElapsed / zoomDuration);

      const easeRush = Math.pow(zt, 1.55);
      const scale = Math.pow(34, easeRush);

      const wordFade =
        zt < 0.5 ? 1 : Math.max(0, 1 - Math.pow((zt - 0.5) / 0.5, 1.5));
      const bgFade =
        zt < 0.32 ? 1 : Math.max(0, 1 - Math.pow((zt - 0.32) / 0.68, 1.6));

      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform = `translate3d(0, 0, 0) scale3d(${scale.toFixed(
          3
        )}, ${scale.toFixed(3)}, 1)`;
        wordmarkRef.current.style.opacity = wordFade.toFixed(3);
      }
      if (overlayRef.current) {
        overlayRef.current.style.opacity = bgFade.toFixed(3);
      }

      if (zt < 1) {
        animFrame = requestAnimationFrame(frame);
      } else {
        try {
          sessionStorage.setItem(PRELOADED_KEY, "true");
        } catch {
          // ignore
        }
        setIsDismissed(true);
      }
    };

    animFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [alreadyPreloaded, isDismissed]);

  if (alreadyPreloaded || isDismissed) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[#162323] flex flex-col justify-between p-8 sm:p-12 select-none overflow-hidden"
      style={{ willChange: "opacity" }}
    >
      {/* Subtle Ambient Brick Rose Backlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(188, 128, 106, 0.12) 0%, rgba(22, 35, 35, 0) 52%)",
        }}
        aria-hidden="true"
      />

      {/* 1. Top Bar: Quiet Corner Metadata */}
      <div
        ref={topBarRef}
        className="relative z-10 w-full flex justify-between items-center"
      >
        <span className="text-[11px] font-mono tracking-[0.25em] text-[#806B64] uppercase">
          LAEC • BIDAR
        </span>
        <span className="text-[11px] font-mono tracking-[0.25em] text-[#806B64]">
          EST. {BRAND_CONFIG.estYear}
        </span>
      </div>

      {/* 2. Center: Unified XOR Wordmark Zooming Through the Central O Aperture */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-visible">
        <div
          ref={wordmarkRef}
          className="relative inline-block select-none text-center text-6xl sm:text-7xl md:text-8xl font-semibold tracking-[0.24em] pl-[0.24em] uppercase leading-none"
          style={{
            transformOrigin: "50% 50%",
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
          }}
        >
          {/* Base Layer: Ghost Unfilled Text (#B59289 at 14%) */}
          <span className="block text-[#B59289]/[0.14]" aria-hidden="true">
            {brandText}
          </span>

          {/* Foreground Layer: Luminous Sand-White Fill */}
          <span
            ref={fillTextRef}
            className="absolute inset-0 block pl-[0.24em] text-[#EFE7E4]"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            {brandText}
          </span>
        </div>

        {/* Minimal Status & Counter */}
        <div
          ref={statusRef}
          className="mt-6 flex items-center justify-center gap-3 font-mono text-xs tracking-[0.22em] text-[#BC806A]"
        >
          <span className="lowercase">loading...</span>
          <span ref={counterRef} className="tabular-nums font-medium">
            0%
          </span>
        </div>
      </div>

      {/* 3. Bottom Spacer: Balances Top Bar */}
      <div
        className="w-full h-[17px] opacity-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
