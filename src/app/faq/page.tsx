"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaqSection } from "@/components/sections/FaqSection";

export default function FaqPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4] overflow-x-clip selection:bg-[#BC806A]/25 selection:text-[#EFE7E4]">
      <Header />
      <main className="flex-1">
        <FaqSection standalone />
      </main>
      <Footer />
    </div>
  );
}
