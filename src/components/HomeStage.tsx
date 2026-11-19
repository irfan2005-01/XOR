"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { XorParticleGraphic } from "@/components/XorParticleGraphic";
import { Marquee } from "@/components/ui/marquee";
import { useAuth } from "@/context/AuthContext";
import { BRAND_CONFIG, howItWorksSteps } from "@/data/psyctech";
import {
  SCENE_COUNT,
  SCENE_LOCK_MS,
  SCENE_META,
  canAcceptSceneTransition,
  clampSceneIndex,
  resolveKeyboardStep,
  resolveTouchSwipeStep,
  resolveWheelStep,
  stepSceneIndex,
} from "@/lib/stage-controller";

const FOCUS_COLUMNS = [
  {
    title: "Software",
    accent: "orange" as const,
    items: [
      "Web Architecture",
      "Full-Stack Systems",
      "Open Source CLI",
      "Cloud & DevOps",
    ],
  },
  {
    title: "AI & Systems",
    accent: "sky" as const,
    items: [
      "Applied ML",
      "Linux & Tooling",
      "API Engineering",
      "Distributed Apps",
    ],
  },
  {
    title: "Hardware & IoT",
    accent: "orange" as const,
    items: [
      "Embedded & ESP32",
      "Sensor Telemetry",
      "Robotics Builds",
      "PCB & Circuits",
    ],
  },
  {
    title: "Product & Design",
    accent: "sky" as const,
    items: [
      "UI Engineering",
      "3D & Motion Web",
      "Rapid Prototyping",
      "Demo Storytelling",
    ],
  },
];

const MISSION_TICKER_ITEMS = [
  "PEER ENGINEERING",
  "WORKSHOPS",
  "BUILD SPRINTS",
  "LAEC BIDAR",
];

const SCENE_TRANSITION = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as const },
  },
};

export function HomeStage() {
  const { user, isHydrated, openAuthModal, isAuthModalOpen } = useAuth();
  const [activeScene, setActiveScene] = useState(0);

  const activeSceneRef = useRef(0);
  const lastTransitionRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = isAuthModalOpen;
  }, [isAuthModalOpen]);

  const goToScene = useCallback((nextIndex: number, bypassLock = false) => {
    const clamped = clampSceneIndex(nextIndex);
    if (clamped === activeSceneRef.current) return;

    const now = performance.now();
    if (
      !bypassLock &&
      !canAcceptSceneTransition(now, lastTransitionRef.current, SCENE_LOCK_MS)
    ) {
      return;
    }

    lastTransitionRef.current = now;
    activeSceneRef.current = clamped;
    setActiveScene(clamped);
  }, []);

  const stepScene = useCallback(
    (delta: number) => {
      const next = stepSceneIndex(activeSceneRef.current, delta);
      goToScene(next, false);
    },
    [goToScene]
  );

  // Discrete 1-scroll-step wheel, touch swipe, and keyboard controller
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isModalOpenRef.current) return;
      e.preventDefault();
      const step = resolveWheelStep(e.deltaY);
      if (step !== 0) {
        stepScene(step);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isModalOpenRef.current || e.touches.length !== 1) return;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isModalOpenRef.current || touchStartYRef.current === null) return;
      const endY = e.changedTouches[0]?.clientY;
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (typeof endY !== "number") return;
      const step = resolveTouchSwipeStep(startY, endY);
      if (step !== 0) {
        stepScene(step);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpenRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const action = resolveKeyboardStep(e.key);
      if (!action) return;

      e.preventDefault();
      if (action.type === "delta") {
        stepScene(action.delta);
      } else {
        goToScene(action.index, true);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToScene, stepScene]);

  const handleJoinAction = () => {
    if (isHydrated && user) {
      openAuthModal("login", "/dashboard");
    } else {
      openAuthModal("signup", "/dashboard");
    }
  };

  return (
    <div
      data-testid="home-stage"
      data-active-scene={activeScene}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#050507] text-white"
    >
      {/* Cosmic 3D Morphing Particle Canvas (65% White / 20% Light Orange / 15% Electric Sky) */}
      <XorParticleGraphic activeScene={activeScene} />

      {/* Right-Edge Vertical Progress Dots & Scene Counter */}
      <nav
        aria-label="Homepage scene navigation"
        className="fixed right-2.5 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5 sm:gap-3"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#FB923C] font-semibold tabular-nums mb-0.5">
          0{activeScene + 1}
        </span>
        {SCENE_META.map((scene) => {
          const active = scene.index === activeScene;
          return (
            <button
              key={scene.id}
              type="button"
              data-testid={`stage-dot-${scene.index}`}
              onClick={() => goToScene(scene.index, true)}
              aria-label={`Scene ${scene.index + 1}: ${scene.label}`}
              aria-current={active ? "step" : undefined}
              className="group p-1.5 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FB923C] rounded-full"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active
                    ? "w-2 h-6 bg-[#FB923C] shadow-[0_0_12px_rgba(251,146,60,0.65)]"
                    : "w-1.5 h-1.5 bg-white/30 group-hover:bg-[#38BDF8]"
                }`}
              />
            </button>
          );
        })}
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/35 tabular-nums mt-0.5">
          0{SCENE_COUNT}
        </span>
      </nav>

      {/* Locked Full-Viewport Active Scene Stage */}
      <main className="relative z-10 h-full w-full">
        <AnimatePresence mode="wait">
          {/* ==================== SCENE 01: HERO + 3D ROCKET ==================== */}
          {activeScene === 0 && (
            <motion.section
              key="scene-0"
              data-testid="scene-layer-0"
              aria-label="Hero"
              {...SCENE_TRANSITION}
              className="h-full w-full pt-20 sm:pt-24 pb-6 sm:pb-10 flex flex-col justify-between max-w-6xl mx-auto px-5 sm:px-8 pr-11 sm:pr-16"
            >
              <div className="my-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8">
                <div className="lg:col-span-7 relative">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-8 -z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse 75% 70% at 30% 50%, rgba(5, 5, 7, 0.88) 0%, rgba(5, 5, 7, 0.5) 60%, rgba(5, 5, 7, 0) 100%)",
                    }}
                  />

                  <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#FB923C] font-medium mb-3 sm:mb-4">
                    XOR &bull; LINGARAJ APPA ENGINEERING COLLEGE, BIDAR
                  </p>

                  <h1 className="font-heading uppercase font-semibold tracking-[-0.04em] leading-[0.95] text-white text-4xl sm:text-6xl lg:text-[4.5rem]">
                    WE BUILD
                    <br />
                    PEOPLE WHO
                    <br />
                    BUILD THINGS.
                  </h1>

                  <p className="mt-4 sm:mt-6 max-w-lg text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                    The student engineering club at{" "}
                    <strong className="text-white font-semibold">
                      LAEC Bidar
                    </strong>
                    . Create your profile, claim your{" "}
                    <strong className="text-[#38BDF8] font-medium">
                      verified XOR-26 ID pass
                    </strong>
                    , and join campus{" "}
                    <strong className="text-white font-semibold">
                      workshops &amp; build sprints
                    </strong>
                    .
                  </p>

                  <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                    {isHydrated && user ? (
                      <Link
                        href="/community"
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[46px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] transition-colors whitespace-nowrap"
                      >
                        <span>Open Channel</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleJoinAction}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[46px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>Join XOR</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                      </button>
                    )}

                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[46px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-white/15 hover:border-[#38BDF8]/60 bg-[#0D0E14]/80 text-white hover:text-[#38BDF8] text-xs sm:text-sm font-mono uppercase tracking-[0.12em] transition-colors whitespace-nowrap"
                    >
                      <span>My ID Card</span>
                    </Link>
                  </div>
                </div>

                {/* Open stage for volumetric 3D Cosmic Particle Rocket */}
                <div
                  className="hidden lg:block lg:col-span-5"
                  aria-hidden="true"
                />
              </div>

              {/* Bottom Scroll Cue */}
              <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-3.5 sm:pt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA]">
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  <span>
                    <span className="text-[#FB923C]">01</span> / 05
                    <span className="hidden sm:inline"> &bull; Launch</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => goToScene(1, true)}
                  className="inline-flex items-center gap-2 text-white/85 hover:text-[#FB923C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Scroll to Explore</span>
                  <ArrowDown
                    className="w-3.5 h-3.5 text-[#FB923C]"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* ==================== SCENE 02: CLUB MISSION + 3D SATELLITE ==================== */}
          {activeScene === 1 && (
            <motion.section
              key="scene-1"
              data-testid="scene-layer-1"
              aria-label="Club Mission"
              {...SCENE_TRANSITION}
              className="h-full w-full pt-16 pb-6 sm:pb-10 flex flex-col justify-between"
            >
              {/* Sweeping Horizontal Kinetic Ticker Across Top */}
              <div className="w-full border-y border-white/15 py-2.5 sm:py-3 overflow-hidden bg-[#050507]/60">
                <Marquee
                  repeat={4}
                  className="[--duration:26s] [--gap:2.5rem] p-0"
                >
                  <div className="flex items-center gap-10 font-mono text-xs sm:text-sm uppercase tracking-[0.26em] text-white/90 whitespace-nowrap">
                    {MISSION_TICKER_ITEMS.map((item) => (
                      <React.Fragment key={item}>
                        <span>{item}</span>
                        <span className="text-[#FB923C]" aria-hidden="true">
                          &bull;
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </Marquee>
              </div>

              {/* Split Layout: Left Open for 3D Satellite, Right Bold Mission Copy */}
              <div className="my-auto max-w-6xl w-full mx-auto px-5 sm:px-8 pr-11 sm:pr-16 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8">
                <div
                  className="hidden lg:block lg:col-span-6"
                  aria-hidden="true"
                />

                <div className="lg:col-span-6 relative lg:text-right flex flex-col lg:items-end">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-8 -z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 75% at 65% 50%, rgba(5, 5, 7, 0.88) 0%, rgba(5, 5, 7, 0.52) 60%, rgba(5, 5, 7, 0) 100%)",
                    }}
                  />

                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#FB923C] font-medium mb-3 sm:mb-4">
                    02 &bull; Club Mission
                  </p>

                  <h2 className="font-heading uppercase font-semibold tracking-[-0.04em] leading-[0.96] text-white text-3xl sm:text-5xl lg:text-[4rem]">
                    BUILT FOR
                    <br />
                    CAMPUS BUILDERS
                  </h2>

                  <p className="mt-4 sm:mt-6 max-w-lg text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                    We believe in{" "}
                    <strong className="text-white font-semibold">
                      learning by shipping
                    </strong>
                    . XOR gives students across every engineering branch at LAEC
                    Bidar an open technical stage for{" "}
                    <strong className="text-white font-semibold">
                      peer mentorship
                    </strong>
                    , weekly{" "}
                    <strong className="text-[#38BDF8] font-medium">
                      build sprints
                    </strong>
                    , and real-world software &amp; hardware demos.
                  </p>

                  <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-4 lg:justify-end">
                    <Link
                      href="/campus"
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#38BDF8] border-b border-[#38BDF8]/50 hover:border-[#FB923C] hover:text-[#FB923C] pb-1 transition-colors"
                    >
                      <span>Explore LAEC Campus HQ</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 pr-11 sm:pr-16 flex items-center justify-between gap-4 border-t border-white/15 pt-3.5 sm:pt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA]">
                <span className="whitespace-nowrap">
                  <span className="text-[#FB923C]">02</span> / 05
                  <span className="hidden sm:inline"> &bull; Orbital Relay</span>
                </span>
                <button
                  type="button"
                  onClick={() => goToScene(2, true)}
                  className="inline-flex items-center gap-2 text-white/85 hover:text-[#FB923C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Area of Focus</span>
                  <ArrowDown
                    className="w-3.5 h-3.5 text-[#FB923C]"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* ==================== SCENE 03: AREA OF FOCUS + 3D GLOBE ==================== */}
          {activeScene === 2 && (
            <motion.section
              key="scene-2"
              data-testid="scene-layer-2"
              aria-label="Area of Focus"
              {...SCENE_TRANSITION}
              className="h-full w-full pt-16 sm:pt-24 pb-6 sm:pb-10 flex flex-col justify-between"
            >
              {/* Giant Horizontal Kinetic Marquee with Electric Sky Blue Outline Glow */}
              <div className="w-full pt-1 sm:pt-2 overflow-hidden shrink-0">
                <p className="max-w-6xl mx-auto px-5 sm:px-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#FB923C] font-medium mb-1.5 sm:mb-2">
                  03 &bull; Club Pillars
                </p>
                <Marquee
                  repeat={4}
                  className="[--duration:28s] [--gap:2rem] sm:[--gap:2.5rem] p-0"
                >
                  <div className="flex items-center gap-6 sm:gap-8 font-heading font-semibold tracking-[-0.03em] leading-none text-3xl sm:text-6xl lg:text-[5.25rem] whitespace-nowrap">
                    <span className="text-white">
                      <span className="text-[#FB923C]">&bull;</span> Software{" "}
                      <span className="text-[#FB923C]">&bull;</span>
                    </span>
                    <span className="text-stroke-white">Area of Focus</span>
                    <span className="text-white">
                      <span className="text-[#38BDF8]">&bull;</span> Hardware
                      &amp; AI <span className="text-[#38BDF8]">&bull;</span>
                    </span>
                  </div>
                </Marquee>
              </div>

              {/* 4 Unboxed Columns Over Rotating Geodesic Globe (2x2 compact on mobile, 4-col on desktop) */}
              <div className="my-auto max-w-6xl w-full mx-auto px-5 sm:px-8 pr-11 sm:pr-16">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-6 -z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse 85% 80% at 40% 55%, rgba(5, 5, 7, 0.86) 0%, rgba(5, 5, 7, 0.48) 65%, rgba(5, 5, 7, 0) 100%)",
                    }}
                  />

                  <div
                    data-testid="focus-pillars-grid"
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-6"
                  >
                    {FOCUS_COLUMNS.map((col, idx) => (
                      <div
                        key={col.title}
                        className="border-t border-white/15 hover:border-[#38BDF8]/60 pt-2.5 sm:pt-4 transition-colors"
                      >
                        <span
                          className={`font-mono text-[10px] sm:text-[11px] tracking-[0.2em] font-medium tabular-nums ${
                            col.accent === "orange"
                              ? "text-[#FB923C]"
                              : "text-[#38BDF8]"
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <h3 className="font-heading text-sm sm:text-xl font-semibold text-white mt-1 sm:mt-1.5 tracking-tight">
                          {col.title}
                        </h3>
                        <ul className="mt-1.5 sm:mt-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-sm leading-snug text-[#A1A1AA]">
                          {col.items.map((item) => (
                            <li
                              key={item}
                              className="hover:text-white transition-colors"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 pr-11 sm:pr-16 flex items-center justify-between gap-4 border-t border-white/15 pt-3 sm:pt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA] shrink-0">
                <span className="whitespace-nowrap">
                  <span className="text-[#FB923C]">03</span> / 05
                  <span className="hidden sm:inline">
                    {" "}
                    &bull; Geodesic Network
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => goToScene(3, true)}
                  className="inline-flex items-center gap-2 text-white/85 hover:text-[#FB923C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>How XOR Works</span>
                  <ArrowDown
                    className="w-3.5 h-3.5 text-[#FB923C]"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* ==================== SCENE 04: HOW XOR WORKS + 3D GYROSCOPE ==================== */}
          {activeScene === 3 && (
            <motion.section
              key="scene-3"
              data-testid="scene-layer-3"
              aria-label="How XOR Works"
              {...SCENE_TRANSITION}
              className="h-full w-full pt-16 pb-14 sm:pt-24 sm:pb-10 flex flex-col justify-between max-w-6xl mx-auto px-5 sm:px-8 pr-11 sm:pr-16"
            >
              {/* Top Heading Row (compact on mobile so Steps 01-03 never clip) */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4 border-b border-white/15 pb-3 sm:pb-5 mb-4 sm:mb-0 shrink-0">
                <div>
                  <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#FB923C] font-medium">
                    04 &bull; HOW XOR WORKS
                  </p>
                  <h2 className="font-heading uppercase font-semibold tracking-[-0.04em] leading-[1.02] text-white text-2xl sm:text-5xl lg:text-[3.75rem] mt-1 sm:mt-2">
                    FROM IDEA TO CAMPUS DEMO
                  </h2>
                </div>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-2 text-[11px] sm:text-sm font-mono uppercase tracking-[0.14em] text-white border border-white/15 hover:border-[#38BDF8]/60 hover:text-[#38BDF8] px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg bg-[#0D0E14]/80 transition-colors whitespace-nowrap shrink-0 self-start sm:self-end"
                >
                  <span>Institutional Leadership &rarr;</span>
                </Link>
              </div>

              {/* Clean 3-Column Unboxed Club Workflow Over 3D Gyroscope */}
              <div className="my-auto py-1 sm:py-4 relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 -z-10"
                  style={{
                    background:
                      "radial-gradient(ellipse 85% 75% at 45% 50%, rgba(5, 5, 7, 0.86) 0%, rgba(5, 5, 7, 0.45) 65%, rgba(5, 5, 7, 0) 100%)",
                  }}
                />

                <div
                  data-testid="how-xor-works-grid"
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 lg:gap-10"
                >
                  {howItWorksSteps.map((step, idx) => {
                    const isSky = idx === 1;
                    return (
                      <div
                        key={step.stepNumber}
                        data-testid={`workflow-step-${step.stepNumber}`}
                        className="group border-t border-white/15 hover:border-[#38BDF8]/60 py-2.5 md:pt-5 md:pb-0 flex flex-col gap-1 md:gap-0 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-lg sm:text-3xl font-semibold tracking-tight tabular-nums leading-none ${
                              isSky ? "text-[#38BDF8]" : "text-[#FB923C]"
                            }`}
                          >
                            {step.stepNumber}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                            Step {step.stepNumber}
                          </span>
                        </div>

                        <h3 className="font-heading text-base sm:text-2xl font-semibold text-white tracking-tight md:mt-4 leading-tight">
                          {step.title}
                        </h3>

                        <p className="text-xs sm:text-base text-[#A1A1AA] leading-snug sm:leading-relaxed md:mt-3">
                          {idx === 0 ? (
                            <>
                              Register with your LAEC details and generate your{" "}
                              <span className="font-mono text-[#38BDF8]">
                                XOR-26-XXXX
                              </span>{" "}
                              member pass.
                            </>
                          ) : (
                            step.description
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-3 sm:pt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA] shrink-0">
                <span className="whitespace-nowrap">
                  <span className="text-[#FB923C]">04</span> / 05
                  <span className="hidden sm:inline">
                    {" "}
                    &bull; Orbital Gyroscope
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => goToScene(4, true)}
                  className="inline-flex items-center gap-2 text-white/85 hover:text-[#FB923C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Upcoming Drop</span>
                  <ArrowDown
                    className="w-3.5 h-3.5 text-[#FB923C]"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* ==================== SCENE 05: YET TO ANNOUNCE + WAVING ASTRONAUT ==================== */}
          {activeScene === 4 && (
            <motion.section
              key="scene-4"
              data-testid="scene-layer-4"
              aria-label="Upcoming Drop"
              {...SCENE_TRANSITION}
              className="h-full w-full pt-20 sm:pt-24 pb-6 sm:pb-10 flex flex-col justify-between max-w-6xl mx-auto px-5 sm:px-8 pr-11 sm:pr-16"
            >
              {/* Top Eyebrow */}
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.24em]">
                <span className="text-[#FB923C] font-medium">
                  05 &bull; COHORT 2026
                </span>
                <span className="hidden sm:inline-flex items-center gap-2 text-[#38BDF8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  <span>UPCOMING DROP</span>
                </span>
              </div>

              {/* Center Oversized Typography Over Waving 3D Astronaut */}
              <div className="my-auto flex flex-col items-center text-center relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-10 -z-10"
                  style={{
                    background:
                      "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(5, 5, 7, 0.78) 0%, rgba(5, 5, 7, 0.34) 60%, rgba(5, 5, 7, 0) 100%)",
                  }}
                />

                <p className="font-mono text-xs uppercase tracking-[0.26em] mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-[#FB923C] font-semibold">
                    COHORT 2026
                  </span>
                  <span className="text-white/30" aria-hidden="true">
                    &bull;
                  </span>
                  <span className="text-[#38BDF8]">UPCOMING DROP</span>
                </p>

                <h2 className="font-heading uppercase font-semibold tracking-[-0.04em] leading-none text-white text-4xl sm:text-6xl lg:text-[5.5rem]">
                  YET TO ANNOUNCE
                </h2>

                <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                  First campus orientation and build sprint schedule dropping
                  soon in the broadcast channel.
                </p>

                <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px] px-6 sm:px-7 py-3 rounded-lg bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
                  >
                    <span>VIEW MY XOR PASS &rarr;</span>
                  </Link>

                  <Link
                    href="/community"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 py-3 rounded-lg border border-white/15 hover:border-[#38BDF8]/60 bg-[#0D0E14]/80 text-white hover:text-[#38BDF8] text-xs sm:text-sm font-mono uppercase tracking-[0.12em] transition-colors whitespace-nowrap"
                  >
                    <span>BROADCAST CHANNEL</span>
                  </Link>
                </div>
              </div>

              {/* Bottom Metadata Row: ONLY LAEC Bidar, Karnataka & EST. 2026 */}
              <div className="border-t border-white/15 pt-4 sm:pt-5 flex items-center justify-between gap-4 text-xs font-mono text-[#A1A1AA]">
                <div className="inline-flex items-center gap-2 text-white/90 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
                  <span>{BRAND_CONFIG.location}</span>
                </div>

                <div className="text-[#38BDF8] tracking-[0.2em] uppercase tabular-nums whitespace-nowrap">
                  EST. {BRAND_CONFIG.estYear}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
