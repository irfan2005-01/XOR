import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col text-white selection:bg-[#FB923C]/25 selection:text-white overflow-x-hidden">
      <Header />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden">
        {/* Ambient Light Orange & Electric Sky Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.1) 0%, rgba(56, 189, 248, 0.04) 38%, rgba(5, 5, 7, 0) 68%)",
          }}
        />

        <div className="relative z-10 max-w-lg w-full text-center px-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FB923C] mb-6 uppercase tracking-[0.18em]">
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Error 404 &middot; Route Unresolved</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight text-balance">
            Page not found in the XOR network
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-md mx-auto">
            The requested endpoint does not exist or has been relocated. Explore our community broadcasts, campus HQ, or return home.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] font-semibold py-3 px-6 rounded-lg text-sm tracking-wide transition-colors inline-flex items-center gap-2 group whitespace-nowrap min-h-[44px]"
            >
              <span>Return Home</span>
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>

            <Link
              href="/community"
              className="bg-[#0D0E14]/80 backdrop-blur-md text-white border border-white/15 hover:border-[#38BDF8]/60 hover:text-[#38BDF8] py-3 px-6 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap min-h-[44px]"
            >
              <span>Browse Community</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
