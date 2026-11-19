"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlurFade } from "@/components/ui/blur-fade";
import { cseHod } from "@/data/team";
import { GraduationCap, Sparkles, ArrowLeft, Building2 } from "lucide-react";

export default function TeamPage() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4] selection:bg-[#BC806A]/25 selection:text-[#EFE7E4]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Breadcrumb / Return Link */}
        <BlurFade delay={0.05}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#B59289] hover:text-[#BC806A] transition-colors mb-10 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </BlurFade>

        {/* Page Header */}
        <div className="max-w-2xl mb-14 sm:mb-16">
          <BlurFade delay={0.1}>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A]">
              ACADEMIC GUIDANCE &bull; CSE DEPARTMENT
            </p>
          </BlurFade>
          <BlurFade delay={0.15}>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#EFE7E4] mt-3">
              Department Leadership
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="text-sm sm:text-base text-[#B59289] mt-4 leading-relaxed">
              XOR operates under the institutional patronage of Lingaraj Appa Engineering College and the academic mentorship of the Department of Computer Science &amp; Engineering.
            </p>
          </BlurFade>
        </div>

        {/* Unboxed HOD Spotlight */}
        <BlurFade delay={0.25}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center py-10 border-y border-[#484A43]/40">
            {/* Left: HOD Portrait */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
              <div className="w-full max-w-[260px] md:max-w-none relative rounded-2xl overflow-hidden border-[1.5px] border-[#BC806A] bg-[#162323] p-2.5 shadow-xl">
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#1D2C2C] flex items-center justify-center">
                  {cseHod.image && !imgError ? (
                    <>
                      <Image
                        src={cseHod.image}
                        alt={`${cseHod.name}, ${cseHod.designation}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 260px, 300px"
                        priority
                        onError={() => setImgError(true)}
                        className="object-cover object-top filter brightness-[0.96] contrast-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#162323]/80 via-transparent to-transparent opacity-50" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl font-mono font-bold tracking-wider text-[#BC806A]">
                        {cseHod.initials}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#806B64] mt-2">
                        HOD &bull; CSE
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: HOD Narrative Block */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BC806A]/15 border border-[#BC806A]/45 text-[11px] font-mono uppercase tracking-[0.16em] text-[#BC806A]">
                <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>DEPARTMENT HEAD &bull; CSE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#EFE7E4] mt-3">
                {cseHod.name}
              </h2>
              <p className="text-sm font-mono text-[#BC806A] mt-1">
                {cseHod.designation}
              </p>
              <p className="text-xs font-mono uppercase tracking-wider text-[#806B64] mt-1">
                {cseHod.institution}
              </p>

              <p className="text-base text-[#B59289] max-w-2xl mt-4 leading-relaxed">
                {cseHod.note}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-[#484A43]/40 w-full text-xs font-mono text-[#806B64]">
                <div className="inline-flex items-center gap-2 text-[#EFE7E4]">
                  <Sparkles className="w-3.5 h-3.5 text-[#BC806A]" />
                  <span>Academic Mentorship &bull; Technical Initiatives</span>
                </div>
                <span className="text-[#484A43] hidden sm:inline">&bull;</span>
                <div className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#BC806A]" />
                  <span>LAEC Bidar Campus</span>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Future Core Team Status Note */}
        <BlurFade delay={0.35}>
          <div className="pt-12 text-center max-w-xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#806B64]">
              Student Technical Leadership
            </p>
            <p className="text-sm text-[#B59289] mt-2 leading-relaxed">
              Student core lead appointments and domain cohorts are being updated and will be announced here shortly.
            </p>
          </div>
        </BlurFade>
      </main>

      <Footer />
    </div>
  );
}
