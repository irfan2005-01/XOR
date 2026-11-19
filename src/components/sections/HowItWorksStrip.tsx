"use client";

import React from "react";

const STEPS = [
  {
    number: "01",
    title: "Create Account & Upload Photo",
    description:
      "Sign up with your full name, LAEC USN, branch & semester, and your student portrait.",
  },
  {
    number: "02",
    title: "Claim XOR-26-XXXX Pass",
    description:
      "Receive an interactive front-and-back virtual ID card with QR verification and 2x PNG export.",
  },
  {
    number: "03",
    title: "Join Broadcast Channel",
    description:
      "Follow official Club Lead broadcasts and vote with interest reactions on upcoming event pitches.",
  },
];

export function HowItWorksStrip() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative overflow-hidden border-t border-[#484A43]/40 bg-[#162323] py-20 sm:py-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-10 pb-4 border-b border-[#484A43]/40">
          <h2
            id="how-it-works-heading"
            className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A] font-medium"
          >
            How It Works
          </h2>
          <p className="text-xs font-mono text-[#806B64]">
            Three steps to activate your campus pass
          </p>
        </div>

        {/* Clean 3-column horizontal grid separated by 1px hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#484A43]/40">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="py-8 md:py-6 md:px-8 first:md:pl-0 last:md:pr-0 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-semibold text-[#BC806A] tracking-[0.2em] tabular-nums uppercase">
                  {step.number}
                </span>
                <h3 className="text-xl font-medium text-[#EFE7E4] mt-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[#B59289] mt-3 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
