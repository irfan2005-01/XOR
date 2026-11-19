"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Preloader } from "@/components/Preloader";
import { Header } from "@/components/layout/Header";
import { HomeStage } from "@/components/HomeStage";

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getClientSnapshot = () => {
  try {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("autostart") === "1"
    ) {
      return true;
    }
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
    <div className="fixed inset-0 h-dvh w-full overflow-hidden overscroll-none select-none bg-[#050507] text-white selection:bg-[#FB923C]/25 selection:text-white">
      {/* Zoom-Through Letter-Fill Preloader */}
      <Preloader onExitStart={() => setPreloaderDismissed(true)} />

      {/* Floating Pitch-Black Header */}
      <div
        className={`fixed top-0 inset-x-0 z-40 transition-opacity duration-500 ease-out ${
          isPreloaderActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />
      </div>

      {/* Discrete 1-Scroll-Step 5-Scene 3D Cosmic Particle Stage */}
      <HomeStage />
    </div>
  );
}
