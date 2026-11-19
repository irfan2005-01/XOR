"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Preloader } from "@/components/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CampusHqSection } from "@/components/CampusHqSection";
import { PrincipalPatronSection } from "@/components/sections/PrincipalPatronSection";
import { HowItWorksStrip } from "@/components/sections/HowItWorksStrip";
import { ClubPillarsSection } from "@/components/sections/ClubPillarsSection";

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getClientSnapshot = () => {
  try {
    return sessionStorage.getItem("xor_preloaded") === "true";
  } catch {
    return false;
  }
};

const getServerSnapshot = () => false;

export default function HomePage() {
  const alreadyPreloaded = useSyncExternalStore(
    subscribeStorage,
    getClientSnapshot,
    getServerSnapshot
  );
  const [preloaderDismissed, setPreloaderDismissed] = useState(false);

  const isPreloaderActive = !alreadyPreloaded && !preloaderDismissed;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4] overflow-x-clip selection:bg-[#BC806A]/25 selection:text-[#EFE7E4]">
      {/* Pure-GPU Zoom-Through Letter-Fill Preloader */}
      <Preloader onExitStart={() => setPreloaderDismissed(true)} />

      {/* Sticky Petroleum Header */}
      <div
        className={`sticky top-0 z-40 transition-opacity duration-500 ease-out ${
          isPreloaderActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />
      </div>

      {/* Homepage Flow: Split Hero -> Campus HQ Showcase -> How It Works -> Club Pillars & CTA */}
      <main
        className={`relative flex-1 flex flex-col transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isPreloaderActive ? "scale-[0.97] opacity-90" : "scale-100 opacity-100"
        }`}
      >
        <HeroSection />
        <CampusHqSection />
        <PrincipalPatronSection />
        <HowItWorksStrip />
        <ClubPillarsSection />
      </main>

      <Footer />
    </div>
  );
}
