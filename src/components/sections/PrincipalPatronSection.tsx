"use client";

import React from "react";
import Image from "next/image";
import { BlurFade } from "@/components/ui/blur-fade";
import { Quote, Award, Sparkles } from "lucide-react";

export function PrincipalPatronSection() {
  return (
    <section
      id="patron"
      aria-labelledby="patron-heading"
      className="relative overflow-hidden border-y border-[#484A43]/40 bg-[#162323] py-20 sm:py-28"
    >
      {/* Subtle Petroleum Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 75% 50%, rgba(188, 128, 106, 0.08) 0%, rgba(22, 35, 35, 0) 70%)",
        }}
      />

      {/* Open, unboxed layout directly on #162323 */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Principal & Patron Portrait Card */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <BlurFade delay={0.1} className="w-full max-w-sm">
              <div className="relative rounded-2xl overflow-hidden border-[1.5px] border-[#BC806A]/70 bg-[#162323] p-3 shadow-xl">
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#1D2C2C]">
                  <Image
                    src="/principal.jpg"
                    alt="Dr. Vinita Patil, Principal and Chief Patron at Lingaraj Appa Engineering College, Bidar"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 380px, 420px"
                    loading="lazy"
                    className="object-cover object-top filter brightness-[0.95] contrast-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#162323] via-transparent to-transparent opacity-80" />
                </div>

                {/* Caption underneath portrait */}
                <div className="pt-4 pb-2 px-2 text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-[#EFE7E4] tracking-tight">
                    Dr. Vinita Patil
                  </h3>
                  <p className="text-xs font-mono text-[#BC806A] mt-0.5 uppercase tracking-wider">
                    Principal &amp; Chief Patron
                  </p>
                  <p className="text-[11px] font-mono text-[#806B64] mt-1">
                    Lingaraj Appa Engineering College, Bidar
                  </p>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Right: Patron Message & Institutional Commitment */}
          <div className="lg:col-span-7 flex flex-col items-start text-left order-1 lg:order-2">
            <BlurFade delay={0.15}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BC806A]/15 border border-[#BC806A]/45 text-[11px] font-mono uppercase tracking-[0.16em] text-[#BC806A]">
                <Award className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Patron &amp; Institutional Leadership</span>
              </div>
            </BlurFade>

            <BlurFade delay={0.2}>
              <h2
                id="patron-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#EFE7E4] mt-4 leading-tight text-balance"
              >
                Fostering a Culture of Hands-On Engineering &amp; Innovation
              </h2>
            </BlurFade>

            <BlurFade delay={0.25}>
              <div className="relative mt-6 pl-5 border-l-2 border-[#BC806A]">
                <Quote className="w-5 h-5 text-[#BC806A]/40 mb-2" />
                <p className="text-sm sm:text-base text-[#EFE7E4] italic leading-relaxed">
                  &ldquo;Engineering education reaches its fullest potential when students bridge classroom theory with real-world prototypes. XOR represents the proactive spirit of our student builders at LAEC Bidar—collaborating, innovating, and developing real solutions.&rdquo;
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.3}>
              <p className="text-sm text-[#B59289] mt-5 leading-relaxed">
                Under the guidance of LAEC administration, XOR provides an autonomous incubator space where curious students across all branches and semesters learn systems design, build open-source utilities and embedded prototypes, and conduct community workshops.
              </p>
            </BlurFade>

            <BlurFade delay={0.35}>
              <div className="mt-8 flex flex-wrap items-center gap-4 pt-5 border-t border-[#484A43]/40 w-full">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[#EFE7E4]">
                  <Sparkles className="w-3.5 h-3.5 text-[#BC806A]" />
                  <span>Free &amp; Open to All LAEC Students</span>
                </div>
                <span className="text-[#484A43] hidden sm:inline">·</span>
                <div className="text-xs font-mono text-[#806B64]">
                  Department of Technical Education, Karnataka
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  );
}
