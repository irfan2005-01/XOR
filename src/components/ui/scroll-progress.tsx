"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { calculateScrollDepth } from "@/lib/scroll-progress";

interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && "current" in ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  useEffect(() => {
    let rafId = 0;

    const applyDepth = () => {
      const el = innerRef.current;
      if (!el) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const depth = calculateScrollDepth(scrollY, scrollHeight, viewportHeight);
      el.style.transform = `scaleX(${depth.toFixed(4)})`;
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        applyDepth();
      });
    };

    applyDepth();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.documentElement);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[45] h-[2px] pointer-events-none bg-white/10"
    >
      <div
        ref={setRefs}
        data-testid="scroll-progress"
        className={cn(
          "h-full w-full origin-left bg-gradient-to-r from-[#FB923C] via-white to-[#38BDF8] will-change-transform",
          className
        )}
        style={{ transform: "scaleX(0)" }}
        {...props}
      />
    </div>
  );
}
