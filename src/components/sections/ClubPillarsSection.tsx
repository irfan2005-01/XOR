"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Code2, Presentation, Terminal } from "lucide-react";

const CLUB_PILLARS = [
  {
    icon: Code2,
    tag: "PILLAR 01",
    title: "Weekend Build Sprints",
    description:
      "Fast-paced peer sprints where teams across branches design, build, and deploy real software utilities and embedded prototypes.",
  },
  {
    icon: Terminal,
    tag: "PILLAR 02",
    title: "Technical Workshops",
    description:
      "Hands-on, code-first deep dives into systems engineering, Linux tooling, web architecture, and applied AI proposed by members.",
  },
  {
    icon: Presentation,
    tag: "PILLAR 03",
    title: "Open Campus Demos",
    description:
      "Live showcases at LAEC Bidar where student builders demo working projects, share postmortems, and recruit collaborators.",
  },
];

export function ClubPillarsSection() {
  const { user, isHydrated, openAuthModal } = useAuth();

  return (
    <section
      id="about"
      aria-labelledby="club-pillars-heading"
      className="border-t border-[#484A43]/40 bg-[#162323] py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 sm:space-y-24">
        {/* Club Pillars & Focus Areas - Open Editorial Columns */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#484A43]/40">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A] font-medium">
                Club Pillars &amp; Focus Areas
              </p>
              <h2
                id="club-pillars-heading"
                className="text-3xl sm:text-4xl font-medium tracking-tight text-[#EFE7E4] mt-2.5"
              >
                Built for Builders at LAEC Bidar
              </h2>
            </div>
            <p className="text-sm text-[#B59289] max-w-md leading-relaxed">
              Practical engineering culture driven by peer mentorship, open demos, and member-validated event pitches.
            </p>
          </div>

          {/* Unboxed editorial columns with thin top border highlighting on hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {CLUB_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="border-t border-[#484A43]/50 hover:border-[#BC806A] pt-6 sm:pt-8 flex flex-col justify-between transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono tracking-[0.2em] text-[#BC806A] uppercase font-medium">
                        {pillar.tag}
                      </span>
                      <Icon
                        className="w-4 h-4 text-[#806B64] group-hover:text-[#BC806A] transition-colors"
                        strokeWidth={1.75}
                      />
                    </div>

                    <h3 className="text-xl font-medium text-[#EFE7E4] mt-5 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#B59289] leading-relaxed mt-3">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unboxed Open Final CTA Section directly on #162323 canvas */}
        <div className="border-t border-[#484A43]/40 pt-16 sm:pt-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A] font-medium">
                XOR &bull; LAEC BIDAR
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium tracking-tight text-[#EFE7E4] mt-2.5 leading-tight text-balance">
                Ready to Claim Your XOR Pass?
              </h2>
              <p className="text-sm sm:text-base text-[#B59289] leading-relaxed mt-3.5">
                Activate your XOR-26-XXXX virtual ID card, connect with campus engineers, and get real-time updates in the official broadcast channel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {isHydrated && user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] font-semibold px-6 py-3.5 rounded-lg text-sm tracking-wide transition-colors inline-flex items-center gap-2 group whitespace-nowrap shadow-md"
                >
                  <span>View My ID Card</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={1.75}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("login", "/dashboard")}
                  className="bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] font-semibold px-6 py-3.5 rounded-lg text-sm tracking-wide transition-colors cursor-pointer inline-flex items-center gap-2 group whitespace-nowrap shadow-md"
                >
                  <span>Sign In / Enter Portal</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={1.75}
                  />
                </button>
              )}

              <Link
                href="/community"
                className="bg-[#1D2C2C] hover:bg-[#233535] text-[#EFE7E4] border border-[#484A43] hover:border-[#BC806A] font-medium px-6 py-3.5 rounded-lg text-sm tracking-wide transition-colors inline-flex items-center gap-2 group whitespace-nowrap"
              >
                <span>Open Broadcast Channel</span>
                <ArrowRight
                  className="w-4 h-4 text-[#BC806A] group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={1.75}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
