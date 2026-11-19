"use client";

import React from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/data/psyctech";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-[#484A43]/45 bg-[#162323] py-12 text-xs font-mono text-[#806B64]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#484A43]/35">
          {/* Brand Wordmark & Location */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-1">
            <Link
              href="/"
              onClick={scrollToTop}
              className="text-[#EFE7E4] uppercase tracking-[0.22em] text-base font-semibold hover:text-[#BC806A] transition-colors"
              aria-label="XOR Home - Scroll to top"
            >
              {BRAND_CONFIG.name}
            </Link>
            <span className="text-[#B59289]">{BRAND_CONFIG.institution}</span>
            <span className="text-[#806B64] hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1 text-[#806B64]">
              <MapPin className="w-3 h-3 text-[#BC806A]" />
              {BRAND_CONFIG.location}
            </span>
          </div>

          {/* Contact Actions: Email & Phone */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {BRAND_CONFIG.email && BRAND_CONFIG.email.includes("@") ? (
              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className="inline-flex items-center gap-1.5 text-[#B59289] hover:text-[#BC806A] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.8} />
                <span>{BRAND_CONFIG.email}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#B59289]">
                <Mail className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.8} />
                <span>Email: Updating soon (wait for update)</span>
              </span>
            )}
            <span className="text-[#484A43] hidden sm:inline">&bull;</span>
            {BRAND_CONFIG.phone && /\d{5,}/.test(BRAND_CONFIG.phone) ? (
              <a
                href={`tel:${BRAND_CONFIG.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 text-[#B59289] hover:text-[#BC806A] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.8} />
                <span>{BRAND_CONFIG.phone}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#B59289]">
                <Phone className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.8} />
                <span>Phone: Updating soon (wait for update)</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links & Copyright Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#B59289]"
          >
            <Link
              href="/"
              onClick={scrollToTop}
              className="hover:text-[#BC806A] transition-colors"
            >
              Home
            </Link>
            <Link href="/#about" className="hover:text-[#BC806A] transition-colors">
              About
            </Link>
            <Link href="/#campus" className="hover:text-[#BC806A] transition-colors">
              Campus HQ
            </Link>
            <Link href="/team" className="hover:text-[#BC806A] transition-colors">
              Team
            </Link>
            <Link href="/community" className="hover:text-[#BC806A] transition-colors">
              Community
            </Link>
            <Link href="/dashboard" className="hover:text-[#BC806A] transition-colors">
              My ID Card
            </Link>
            <Link href="/faq" className="hover:text-[#BC806A] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Official Copyright notice */}
          <div className="text-[11px] text-[#806B64]">
            &copy; 2026 XOR &bull; Lingaraj Appa Engineering College, Bidar. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
