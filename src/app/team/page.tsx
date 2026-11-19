"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlurFade } from "@/components/ui/blur-fade";
import { institutionalLeaders } from "@/data/team";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";

export default function TeamPage() {
  const [failedInstitutional, setFailedInstitutional] = useState<
    Record<string, boolean>
  >({});

  return (
    <div className="relative min-h-screen flex flex-col text-white selection:bg-[#FB923C]/25 selection:text-white">
      <Header />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Return Link */}
        <BlurFade delay={0.04}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#A1A1AA] hover:text-[#FB923C] transition-colors mb-10 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </BlurFade>

        {/* Page Header */}
        <div className="max-w-2xl mb-14 sm:mb-16">
          <BlurFade delay={0.08}>
            <p className="text-xs font-mono tracking-[0.22em] uppercase text-[#FB923C] font-medium">
              Institutional Patronage &amp; Academic Guidance
            </p>
          </BlurFade>
          <BlurFade delay={0.12}>
            <h1 className="font-heading text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mt-3">
              Institutional Leadership
            </h1>
          </BlurFade>
          <BlurFade delay={0.16}>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-4 leading-relaxed">
              XOR operates under the institutional patronage and department
              mentorship of Lingaraj Appa Engineering College, Bidar—empowering
              student engineers to collaborate, experiment, and ship real-world
              technical builds.
            </p>
          </BlurFade>
        </div>

        {/* Institutional Leadership Only: Dr. Vinita Patil & Dr. Vivek Jalade */}
        <section
          aria-labelledby="institutional-leadership-heading"
          data-testid="institutional-leadership-section"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-6 border-b border-white/15">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FB923C]">
                01 &bull; Academic Leadership
              </p>
              <h2
                id="institutional-leadership-heading"
                className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1.5"
              >
                Principal &amp; Department Head
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38BDF8]">
              <Building2 className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>LAEC Bidar</span>
            </div>
          </div>

          <div className="divide-y divide-white/15 border-b border-white/15">
            {institutionalLeaders.map((leader, idx) => {
              const failed = Boolean(failedInstitutional[leader.name]);
              return (
                <BlurFade key={leader.name} delay={0.1 + idx * 0.08}>
                  <article className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center py-10 sm:py-12">
                    {/* Frosted Space-Glass Portrait Frame */}
                    <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
                      <div className="w-full max-w-[230px] md:max-w-none mx-auto md:mx-0 relative rounded-xl overflow-hidden border border-white/15 hover:border-[#38BDF8]/60 bg-[#0D0E14]/80 backdrop-blur-md p-2 transition-colors shadow-xl">
                        <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-[#050507] flex items-center justify-center">
                          {leader.image && !failed ? (
                            <>
                              <Image
                                src={leader.image}
                                alt={`${leader.name}, ${leader.designation}`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 260px, 300px"
                                priority={idx === 0}
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setFailedInstitutional((prev) => ({
                                    ...prev,
                                    [leader.name]: true,
                                  }))
                                }
                                className="object-cover object-top filter brightness-[0.95] contrast-[1.04]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/75 via-transparent to-transparent" />
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                              <span className="text-4xl font-mono font-bold tracking-wider text-white">
                                {leader.initials}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Narrative Column */}
                    <div className="md:col-span-8 lg:col-span-9 flex flex-col items-start text-left">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FB923C] font-medium">
                        {leader.eyebrow}
                      </span>

                      <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-2">
                        {leader.name}
                      </h3>

                      <p className="text-sm font-mono text-[#38BDF8] mt-1">
                        {leader.designation}
                      </p>

                      <p className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mt-1">
                        {leader.institution}
                      </p>

                      {leader.quote && (
                        <blockquote className="mt-5 pl-4 border-l-2 border-[#FB923C]/70 text-base sm:text-lg font-heading text-white/95 leading-relaxed max-w-2xl">
                          &ldquo;{leader.quote}&rdquo;
                        </blockquote>
                      )}

                      <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl mt-4 leading-relaxed">
                        {leader.note}
                      </p>
                    </div>
                  </article>
                </BlurFade>
              );
            })}
          </div>
        </section>

        {/* Clean Portal Next Step */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-[#0D0E14]/80 backdrop-blur-md p-6 sm:p-7 shadow-xl">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FB923C]">
              Cohort 2026 Announcements
            </p>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Follow official orientation updates and build sprint schedules in
              the broadcast channel.
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] text-xs font-mono font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
          >
            <span>Open Broadcast Channel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
