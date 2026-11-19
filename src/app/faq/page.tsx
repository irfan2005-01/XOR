"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaqSection } from "@/components/sections/FaqSection";

export default function FaqPage() {
  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-x-clip selection:bg-[#FB923C]/25 selection:text-white">
      <Header />
      <main className="relative z-10 flex-1">
        <FaqSection standalone />
      </main>
      <Footer />
    </div>
  );
}
