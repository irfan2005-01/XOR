import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4] selection:bg-[#BC806A]/25 selection:text-[#EFE7E4] overflow-x-hidden">
      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden">
        {/* Giant subtle 404 / X Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        >
          <span className="text-[14rem] sm:text-[22rem] md:text-[28rem] font-mono font-black text-[#484A43]/15 tracking-tighter leading-none select-none">
            404
          </span>
          <svg
            viewBox="0 0 400 400"
            className="absolute w-[28rem] sm:w-[38rem] md:w-[48rem] h-[28rem] sm:h-[38rem] md:h-[48rem] opacity-10 pointer-events-none"
          >
            <line
              x1="60"
              y1="60"
              x2="340"
              y2="340"
              stroke="#BC806A"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <line
              x1="340"
              y1="60"
              x2="60"
              y2="340"
              stroke="#EFE7E4"
              strokeWidth="28"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(188, 128, 106, 0.12) 0%, rgba(22, 35, 35, 0) 65%)",
          }}
        />

        <div className="relative z-10 max-w-lg w-full text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D2C2C] border border-[#BC806A]/40 text-xs font-mono text-[#BC806A] mb-6">
            <Compass className="w-3.5 h-3.5" />
            <span>ERROR 404 · ROUTE UNRESOLVED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#EFE7E4] leading-tight text-balance">
            Page not found in the XOR network
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#B59289] leading-relaxed max-w-md mx-auto">
            The requested endpoint does not exist or has been relocated. Explore our community broadcasts, campus workshops, or return home.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] font-semibold py-3 px-6 rounded-full text-sm font-mono tracking-wide transition-colors inline-flex items-center gap-2 shadow-lg group whitespace-nowrap"
            >
              <span>Return Home</span>
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>

            <Link
              href="/community"
              className="bg-[#1D2C2C] hover:bg-[#162323] text-[#EFE7E4] border border-[#484A43] hover:border-[#BC806A] py-3 px-6 rounded-full text-sm font-mono tracking-wide transition-colors inline-flex items-center gap-2 whitespace-nowrap"
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
