"use client";

import React from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/data/psyctech";
import { ArrowRight, MapPin } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/15 bg-[#050507]/75 backdrop-blur-md py-12 text-xs font-mono text-[#A1A1AA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
          {/* Brand Wordmark & Location */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
            <Link
              href="/"
              onClick={scrollToTop}
              className="font-heading text-white uppercase tracking-[0.26em] text-base font-bold hover:text-[#FB923C] transition-colors shrink-0"
              aria-label="XOR Home"
            >
              {BRAND_CONFIG.name}
            </Link>
            <span className="text-[#A1A1AA]">{BRAND_CONFIG.institution}</span>
            <span className="text-white/25 hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <span className="inline-flex items-center gap-1 text-[#A1A1AA] whitespace-nowrap shrink-0">
              <MapPin className="w-3 h-3 text-[#FB923C]" />
              {BRAND_CONFIG.location}
            </span>
          </div>

          {/* Broadcast Channel CTA (replaces personal email/phone) */}
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 hover:border-[#38BDF8]/60 bg-[#0D0E14]/80 backdrop-blur-md text-white hover:text-[#38BDF8] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            <span>Open Broadcast Channel</span>
            <ArrowRight
              className="w-3.5 h-3.5 text-[#FB923C] group-hover:translate-x-0.5 transition-transform"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        {/* Navigation Links & Copyright Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#A1A1AA]"
          >
            <Link
              href="/"
              onClick={scrollToTop}
              className="hover:text-[#FB923C] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/campus"
              className="hover:text-[#FB923C] transition-colors"
            >
              Campus HQ
            </Link>
            <Link
              href="/team"
              className="hover:text-[#FB923C] transition-colors"
            >
              Team
            </Link>
            <Link
              href="/community"
              className="hover:text-[#FB923C] transition-colors"
            >
              Community
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-[#FB923C] transition-colors"
            >
              My ID Card
            </Link>
            <Link
              href="/faq"
              className="hover:text-[#FB923C] transition-colors"
            >
              FAQ
            </Link>
          </nav>

          <div className="text-[11px] text-[#A1A1AA]/80">
            &copy; {BRAND_CONFIG.estYear} XOR &bull; Lingaraj Appa Engineering
            College, Bidar.
          </div>
        </div>
      </div>
    </footer>
  );
}
