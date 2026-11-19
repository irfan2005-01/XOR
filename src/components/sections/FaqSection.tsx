"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { BRAND_CONFIG } from "@/data/psyctech";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "eligibility",
    question: "Who can join the XOR student engineering club?",
    answer:
      "Any student enrolled at Lingaraj Appa Engineering College (LAEC), Bidar—across all branches and semesters—can join. Whether you are writing your first lines of code or shipping full-stack and embedded systems, XOR is built for curious student builders.",
  },
  {
    id: "id-pass",
    question: "How do I claim my verified XOR-26-XXXX virtual ID pass?",
    answer:
      "Select Create Member Account, enter your full name, LAEC USN, branch, semester, and upload a student portrait photo. Your interactive front-and-back XOR-26-XXXX pass—including a scannable QR verification code and 2x PNG download—is issued immediately on your dashboard.",
  },
  {
    id: "broadcast-channel",
    question: "How does the Official Broadcast Channel work?",
    answer:
      "Club Leads publish verified announcements, sprint schedules, and new event pitches directly inside the /community broadcast feed. Students can follow updates in real time and tap Interested on event pitches to help leads validate campus demand before locking in dates and venues.",
  },
  {
    id: "experience-level",
    question: "Do I need prior coding experience for build sprints or workshops?",
    answer:
      "No prior experience is required. Workshops start with practical fundamentals and live code walkthroughs, while weekend build sprints pair newcomers with senior student mentors so everyone contributes to a working demo.",
  },
  {
    id: "membership-fee",
    question: "Is there any fee to join XOR or attend campus sessions?",
    answer:
      "No. Membership, your digital XOR pass, technical workshops, and open campus demos at LAEC Bidar are completely free for students.",
  },
  {
    id: "propose-session",
    question: "Can members pitch a workshop topic or become a Club Lead?",
    answer:
      "Yes. Active members who share demos, mentor peers during sprints, or organize technical tracks can propose workshop themes to Club Leads and qualify for Club Lead access within the chapter.",
  },
];

interface FaqSectionProps {
  standalone?: boolean;
}

export function FaqSection({ standalone = false }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const HeadingTag = standalone ? "h1" : "h2";

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={
        standalone
          ? "bg-[#162323] py-12 sm:py-20"
          : "border-t border-[#484A43]/45 bg-[#1D2C2C]/25 py-16 sm:py-24"
      }
    >
      <div className="max-w-6xl mx-auto px-6">
        {standalone && (
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#B59289] hover:text-[#BC806A] transition-colors group"
            >
              <ArrowLeft
                className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                strokeWidth={1.75}
              />
              <span>Back to Home</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Editorial Intro */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A]">
              {standalone
                ? "XOR • Frequently Asked Questions"
                : "Frequently Asked Questions"}
            </p>
            <HeadingTag
              id="faq-heading"
              className="text-3xl sm:text-4xl font-medium tracking-tight text-[#EFE7E4] mt-2"
            >
              Everything About XOR
            </HeadingTag>
            <p className="text-sm text-[#B59289] leading-relaxed mt-3">
              Clear answers on membership eligibility, claiming your XOR pass, and participating in campus workshops and build sprints at LAEC Bidar.
            </p>

            <div className="mt-6 pt-5 border-t border-[#484A43]/45 flex flex-col gap-3 text-xs font-mono">
              <Link
                href="/community"
                className="inline-flex items-center gap-2 text-[#EFE7E4] hover:text-[#BC806A] transition-colors group w-fit"
              >
                <span>Open Broadcast Channel</span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-[#BC806A] group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={1.75}
                />
              </Link>
              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className="text-[#806B64] hover:text-[#B59289] transition-colors w-fit"
              >
                {BRAND_CONFIG.email}
              </a>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-8 space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const triggerId = `faq-trigger-${item.id}`;
              const panelId = `faq-panel-${item.id}`;
              const indexLabel = String(index + 1).padStart(2, "0");

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-colors ${
                    isOpen
                      ? "bg-[#1D2C2C] border-[#BC806A]/60"
                      : "bg-[#1D2C2C]/65 border-[#484A43]/55 hover:border-[#806B64]/80"
                  }`}
                >
                  <h2>
                    <button
                      type="button"
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(index)}
                      className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC806A] rounded-xl"
                    >
                      <div className="flex items-baseline gap-3.5 sm:gap-4 min-w-0">
                        <span
                          className={`text-xs font-mono tabular-nums shrink-0 transition-colors ${
                            isOpen ? "text-[#BC806A]" : "text-[#806B64]"
                          }`}
                        >
                          {indexLabel}
                        </span>
                        <span className="text-sm sm:text-base font-medium text-[#EFE7E4] leading-snug">
                          {item.question}
                        </span>
                      </div>

                      <span
                        aria-hidden="true"
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? "border-[#BC806A]/60 bg-[#BC806A]/15 text-[#BC806A]"
                            : "border-[#484A43]/70 bg-[#162323]/70 text-[#806B64]"
                        }`}
                      >
                        <Plus
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isOpen ? "rotate-45" : "rotate-0"
                          }`}
                          strokeWidth={1.8}
                        />
                      </span>
                    </button>
                  </h2>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        initial={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        animate={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { height: "auto", opacity: 1 }
                        }
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.24,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pl-12 sm:pl-[3.25rem] pr-12">
                          <p className="text-sm text-[#B59289] leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
