"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import campusBuildingImg from "../../public/laec-campus-real.jpg";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const buildingRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function CampusHqSection() {
  const shouldReduceMotion = useReducedMotion();

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
      id="campus"
      aria-labelledby="campus-hq-heading"
      className="relative z-10 overflow-hidden py-12 sm:py-16 lg:py-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="relative max-w-full"
        >
          {/* Section Header */}
          <div className="relative z-20 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/15">
            <div>
              <motion.div
                variants={slideUpVariants}
                className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-[0.18em] uppercase"
              >
                <span className="text-[#FB923C] font-medium tabular-nums">
                  01. The Campus HQ
                </span>
                <span className="text-white/25" aria-hidden="true">
                  &middot;
                </span>
                <span className="text-[#A1A1AA]">Bidar, Karnataka</span>
              </motion.div>

              <motion.h1
                id="campus-hq-heading"
                variants={slideUpVariants}
                className="font-heading text-3xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.04] text-white mt-3 text-balance"
              >
                The Heart of XOR
              </motion.h1>

              <motion.p
                variants={slideUpVariants}
                className="text-sm sm:text-base text-[#A1A1AA] mt-3 max-w-xl leading-relaxed"
              >
                Based at{" "}
                <strong className="text-white font-medium">
                  Lingaraj Appa Engineering College (LAEC), Bidar
                </strong>
                —where student engineers run weekly labs, build sprints, and
                open hardware demos.
              </motion.p>
            </div>

            <motion.div
              variants={slideUpVariants}
              className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A1A1AA] tabular-nums self-start lg:self-end"
            >
              <span className="text-white">Central Lab</span>
              <span className="text-white/25" aria-hidden="true">
                &middot;
              </span>
              <span className="text-[#38BDF8]">17.91° N, 77.52° E</span>
            </motion.div>
          </div>

          {/* Full-Width Panoramic Campus Building Showcase */}
          <motion.div
            variants={buildingRevealVariants}
            onMouseMove={handleBuildingMouseMove}
            onMouseLeave={handleBuildingMouseLeave}
            style={{ perspective: 1200 }}
            className="relative mt-10 sm:mt-14"
          >
            {/* Subtle Light Orange (#FB923C/15) Ambient Shadow Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -inset-y-6 rounded-3xl opacity-90"
              style={{
                background:
                  "radial-gradient(ellipse 72% 65% at 50% 55%, rgba(251, 146, 60, 0.15) 0%, rgba(56, 189, 248, 0.05) 48%, rgba(5, 5, 7, 0) 78%)",
              }}
            />

            <motion.div
              className="relative z-20 w-full will-change-transform"
              style={{
                rotateX: shouldReduceMotion ? 0 : rotateX,
                rotateY: shouldReduceMotion ? 0 : rotateY,
                transformStyle: "preserve-3d",
              }}
              whileHover={
                shouldReduceMotion ? undefined : { scale: 1.008, y: -2 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="relative w-full aspect-[16/6] sm:aspect-[21/7] overflow-hidden rounded-xl border border-white/15 bg-[#0D0E14]/80 backdrop-blur-md shadow-[0_24px_64px_rgba(251,146,60,0.15)]">
                <Image
                  src={campusBuildingImg}
                  alt="Panoramic view of Lingaraj Appa Engineering College (LAEC), Bidar campus building"
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1152px"
                  referrerPolicy="no-referrer"
                  className="object-cover object-[center_92%] select-none"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#050507]/70 to-transparent"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Architectural Metadata Row */}
          <motion.div
            variants={slideUpVariants}
            className="relative z-20 mt-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA]"
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span>
                Base: <span className="text-white">LAEC Bidar</span>
              </span>
              <span className="text-white/25" aria-hidden="true">
                &middot;
              </span>
              <span>
                Pass Series:{" "}
                <span className="text-[#38BDF8] tabular-nums">XOR-26-XXXX</span>
              </span>
            </div>

            <div className="flex items-center gap-4 tabular-nums">
              <span className="hidden sm:inline text-[#38BDF8]/80">
                17.91°N 77.52°E
              </span>
              <span className="text-[#FB923C]">Open to All Branches</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
