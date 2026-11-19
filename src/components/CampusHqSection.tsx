"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import campusBuildingImg from "../../public/assets/aistudio/front_side_255b0ed1.png";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const buildingRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function CampusHqSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });
  const indicatorColor = useTransform(
    smoothProgress,
    [0, 0.45, 0.85],
    ["#484A43", "#B59289", "#BC806A"]
  );

  // Subtle 3D tilt motion values for the building image container
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltSpringConfig = { stiffness: 220, damping: 24, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [4.5, -4.5]),
    tiltSpringConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-6, 6]),
    tiltSpringConfig
  );
  const glowShiftX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-18, 18]),
    tiltSpringConfig
  );
  const glowShiftY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-10, 10]),
    tiltSpringConfig
  );

  const handleBuildingMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleBuildingMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="campus"
      aria-labelledby="campus-hq-heading"
      className="relative overflow-hidden border-y border-[#484A43]/40 bg-[#162323] py-20 sm:py-28"
    >
      <span id="campus-hq" className="sr-only" aria-hidden="true" />

      {/* Textured Petroleum Canvas Gradient + Soft Ambient Brick Rose Backlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(188, 128, 106, 0.12) 0%, rgba(29, 44, 44, 0.45) 45%, rgba(22, 35, 35, 0.98) 85%)",
        }}
      />

      {/* Subtle Technical Blueprint Grid (#484A43) Masked Smoothly Into Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(72, 74, 67, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(72, 74, 67, 0.22) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 100%)",
        }}
      />

      {/* Main Architectural Stage Container - Unboxed & Full-Bleed on #162323 */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative max-w-full"
        >
          {/* Top Branding Title Overlay & Telemetry HUD */}
          <div className="relative z-20 flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#484A43]/40">
            <div>
              <motion.div
                variants={slideUpVariants}
                className="flex flex-wrap items-center gap-3"
              >
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A] font-medium">
                  02 / THE CAMPUS HQ
                </span>
                <span className="px-2.5 py-0.5 rounded border border-[#484A43]/80 bg-[#1D2C2C]/60 text-[10px] font-mono tracking-[0.16em] uppercase text-[#B59289]">
                  LOCATION: BIDAR, KA
                </span>
              </motion.div>

              <motion.h2
                id="campus-hq-heading"
                variants={slideUpVariants}
                className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.025em] leading-[1.06] text-[#EFE7E4] mt-3 uppercase"
              >
                THE HEART OF XOR
              </motion.h2>

              <motion.p
                variants={slideUpVariants}
                className="text-sm sm:text-base text-[#B59289] mt-2.5 max-w-xl leading-relaxed"
              >
                Based at Lingaraj Appa Engineering College (LAEC), Bidar.
              </motion.p>
            </div>

            {/* Architecture Telemetry Capsule */}
            <motion.div
              variants={slideUpVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono text-[#806B64] self-start lg:self-auto"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#BC806A] animate-pulse" />
                <span className="text-[#EFE7E4]">CENTRAL LAB</span>
              </div>
              <span className="hidden sm:inline text-[#484A43]">|</span>
              <span>17.91° N, 77.52° E</span>
            </motion.div>
          </div>

          {/* Interactive Central Campus Building Reveal */}
          <motion.div
            variants={buildingRevealVariants}
            onMouseMove={handleBuildingMouseMove}
            onMouseLeave={handleBuildingMouseLeave}
            style={{ perspective: 1200 }}
            className="relative mt-8 sm:mt-12 pt-4"
          >
            {/* Soft Edge Backlight Halo Behind Building Silhouette */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-[90%] h-[80%] rounded-full blur-3xl opacity-80"
              style={{
                x: shouldReduceMotion ? 0 : glowShiftX,
                y: shouldReduceMotion ? 0 : glowShiftY,
                background:
                  "radial-gradient(ellipse at center, rgba(188, 128, 106, 0.22) 0%, rgba(181, 146, 137, 0.08) 45%, rgba(22, 35, 35, 0) 75%)",
              }}
            />

            {/* Centered Building Cutout directly on open #162323 canvas */}
            <div className="relative z-20 max-w-5xl mx-auto px-2 sm:px-4">
              <motion.div
                className="relative will-change-transform"
                style={{
                  rotateX: shouldReduceMotion ? 0 : rotateX,
                  rotateY: shouldReduceMotion ? 0 : rotateY,
                  transformStyle: "preserve-3d",
                }}
                whileHover={
                  shouldReduceMotion ? undefined : { scale: 1.015, y: -3 }
                }
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <Image
                  src={campusBuildingImg}
                  alt="Lingaraj Appa Engineering College (LAEC), Bidar campus building"
                  loading="lazy"
                  className="w-full h-auto select-none brightness-[0.88] contrast-[1.06] saturate-[0.9] drop-shadow-[0_24px_32px_rgba(0,0,0,0.85)]"
                />

                {/* Subtle Atmospheric Rim-Tint Integrating Cutout Into Petroleum Canvas */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#162323] to-transparent"
                />
              </motion.div>
            </div>

            {/* Architectural Ground Platform Under Building */}
            <div
              aria-hidden="true"
              className="relative z-10 -mt-2 sm:-mt-3 max-w-5xl mx-auto"
            >
              <div className="relative h-12 sm:h-16 rounded-t-xl border-t border-x border-[#484A43]/50 bg-gradient-to-b from-[#1D2C2C] via-[#162323] to-[#162323] overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.55)]">
                {/* Entrance Warm Edge-Light Accent */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-44 sm:w-64 h-10 opacity-85"
                  style={{
                    background:
                      "radial-gradient(ellipse at top, rgba(188, 128, 106, 0.35) 0%, rgba(188, 128, 106, 0) 75%)",
                  }}
                />
                {/* Subtle Deck Grid Lines */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(72, 74, 67, 0.35) 1px, transparent 1px)",
                    backgroundSize: "64px 100%",
                  }}
                />
              </div>

              {/* Lower Plinth Fascia with Blueprint Circuit Hairline */}
              <div className="h-3 sm:h-4 border-t border-[#BC806A]/35 bg-[#162323] rounded-b-lg flex items-center justify-between px-4 sm:px-6">
                <span className="h-[1px] w-16 sm:w-28 bg-[#BC806A]/45" />
                <span className="h-[1px] w-16 sm:w-28 bg-[#BC806A]/45" />
              </div>
            </div>
          </motion.div>

          {/* Bottom Blueprint Telemetry Footer Bar */}
          <motion.div
            variants={slideUpVariants}
            className="relative z-20 mt-10 pt-4 border-t border-[#484A43]/40 flex flex-wrap items-center justify-between gap-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-[#806B64]"
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span>
                BASE: <span className="text-[#EFE7E4]">LAEC BIDAR</span>
              </span>
              <span>
                PASS SERIES: <span className="text-[#BC806A]">XOR-26-XXXX</span>
              </span>
            </div>

            <div className="flex items-center gap-4 tabular-nums">
              <span className="hidden sm:inline">COORDS: 17.91°N 77.52°E</span>
              <span className="text-[#B59289]">SYS // READY</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle Vertical Scroll Progress Indicator (Right Edge) */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden sm:flex flex-col items-center gap-2 absolute right-2.5 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30"
      >
        <span className="text-[9px] font-mono tracking-[0.18em] text-[#806B64]">
          02
        </span>
        <div className="w-[2px] h-28 md:h-36 rounded-full bg-[#484A43]/35 overflow-hidden relative">
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              scaleY: smoothProgress,
              backgroundColor: indicatorColor,
              transformOrigin: "top",
            }}
          />
        </div>
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: indicatorColor }}
        />
      </div>
    </section>
  );
}
