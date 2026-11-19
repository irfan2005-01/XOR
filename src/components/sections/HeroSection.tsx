"use client";

import React from "react";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { XorParticleGraphic } from "@/components/XorParticleGraphic";
import { BRAND_CONFIG } from "@/data/psyctech";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const { user, isHydrated, openAuthModal } = useAuth();

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Subtle Organic Terracotta-Rose Ambient Glow Behind Particle X */}
      <div
        className="pointer-events-none absolute inset-0 z-0 select-none"
        style={{
          background:
            "radial-gradient(circle at 72% 48%, rgba(188, 128, 106, 0.11) 0%, rgba(72, 74, 67, 0.05) 45%, rgba(22, 35, 35, 0) 72%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center min-h-[calc(100vh-11rem)] py-14 lg:py-16">
          {/* Left Column: Club Portal Intro & Primary Action */}
          <div className="lg:col-span-6 flex flex-col items-start text-left order-1">
            <BlurFade delay={0.05}>
              <p className="text-xs font-mono tracking-[0.18em] uppercase text-[#BC806A]">
                {BRAND_CONFIG.institution}
              </p>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[1.08] text-[#EFE7E4] mt-4 text-balance">
                {BRAND_CONFIG.tagline}
              </h1>
            </BlurFade>

            <BlurFade delay={0.15}>
              <p className="max-w-lg text-base sm:text-lg text-[#B59289] leading-relaxed mt-5 font-normal">
                The student engineering club portal at LAEC Bidar. Create your member profile, claim your verified XOR ID pass, and join campus workshops and build sprints.
              </p>
            </BlurFade>

            <BlurFade delay={0.2} className="w-full">
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full">
                {isHydrated && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto bg-[#BC806A] text-[#162323] hover:bg-[#C9917D] font-semibold px-6 py-3.5 rounded-lg text-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2 group whitespace-nowrap min-h-[44px]"
                    >
                      <span>View My ID Card</span>
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={1.75}
                      />
                    </Link>

                    <Link
                      href="/community"
                      className="w-full sm:w-auto text-sm text-[#EFE7E4] hover:text-[#BC806A] inline-flex items-center justify-center gap-2 group transition-colors py-2 whitespace-nowrap min-h-[44px]"
                    >
                      <span>Enter Community</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={1.6}
                      />
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal("login", "/dashboard")}
                      className="w-full sm:w-auto bg-[#BC806A] text-[#162323] hover:bg-[#C9917D] font-semibold px-6 py-3.5 rounded-lg text-sm tracking-wide transition-colors cursor-pointer inline-flex items-center justify-center gap-2 group whitespace-nowrap min-h-[44px]"
                    >
                      <span>Club Lead &amp; Member Sign In</span>
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={1.75}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthModal("login", "/dashboard")}
                      className="w-full sm:w-auto text-sm text-[#B59289] hover:text-[#EFE7E4] inline-flex items-center justify-center gap-1.5 transition-colors py-2 cursor-pointer whitespace-nowrap min-h-[44px]"
                    >
                      <span>Already registered? Log in</span>
                    </button>
                  </>
                )}
              </div>
            </BlurFade>

            {/* Unboxed Key Info Strip */}
            <BlurFade delay={0.25} className="w-full">
              <div className="mt-12 pt-6 border-t border-[#484A43]/45 flex flex-wrap gap-8 w-full">
                <div>
                  <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-[#806B64]">
                    Digital Member Pass
                  </div>
                  <div className="text-xs text-[#EFE7E4] mt-1 font-mono tabular-nums">
                    Instant XOR-26-XXXX ID &amp; PNG Export
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-[#806B64]">
                    Campus Feed
                  </div>
                  <div className="text-xs text-[#EFE7E4] mt-1">
                    Build Sprints, Workshops &amp; Live RSVPs
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Right Column: Interactive Particle Letter "X" */}
          <div className="lg:col-span-6 flex items-center justify-center order-2 w-full">
            <BlurFade
              delay={0.1}
              className="w-full h-[240px] sm:h-[340px] lg:h-[420px] flex items-center justify-center"
            >
              <XorParticleGraphic />
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  );
}
