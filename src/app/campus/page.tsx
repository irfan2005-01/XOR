"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CampusHqSection } from "@/components/CampusHqSection";
import { BRAND_CONFIG } from "@/data/psyctech";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

export default function CampusPage() {
  return (
    <div className="relative min-h-screen flex flex-col text-white selection:bg-[#FB923C]/25 selection:text-white">
      <Header />

      <main className="relative z-10 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#A1A1AA] hover:text-[#FB923C] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        <CampusHqSection />

        {/* Campus Address & Broadcast Links */}
        <section className="border-t border-white/15 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 hover:border-[#38BDF8]/60 p-6 transition-colors">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FB923C]">
                Institution
              </p>
              <h3 className="font-heading text-lg font-semibold text-white mt-2">
                {BRAND_CONFIG.institution}
              </h3>
              <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed inline-flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FB923C] shrink-0 mt-0.5" />
                <span>
                  Gornalli, Bidar — 585403, Karnataka, India (
                  <span className="font-mono text-[#38BDF8]">
                    17.91° N, 77.52° E
                  </span>
                  )
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 hover:border-[#38BDF8]/60 p-6 transition-colors">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#38BDF8]">
                Lab &amp; Club Access
              </p>
              <h3 className="font-heading text-lg font-semibold text-white mt-2">
                Open to All Engineering Branches
              </h3>
              <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                CSE, AI &amp; ML, ECE, Mechanical, and Civil students collaborate
                across weekend build sprints, systems labs, and campus demos.
              </p>
            </div>

            <div className="rounded-xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 hover:border-[#38BDF8]/60 p-6 transition-colors">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FB923C]">
                Club Updates
              </p>
              <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                Orientation dates, lab room schedules, and build sprint drops are
                published directly in the XOR broadcast channel.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 text-xs font-mono">
                <Link
                  href="/community"
                  className="inline-flex items-center gap-1.5 uppercase tracking-[0.14em] text-[#FB923C] hover:text-[#FDBA74] transition-colors w-fit"
                >
                  <span>Open Broadcast Channel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1.5 uppercase tracking-[0.14em] text-[#38BDF8] hover:text-white transition-colors w-fit"
                >
                  <span>Institutional Leadership</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
