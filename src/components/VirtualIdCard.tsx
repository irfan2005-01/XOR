"use client";

import React, { useMemo, useRef, useState } from "react";
import { getMemberInitials } from "@/lib/avatar-upload";
import { computePassBarcodeBars, formatIssueDate } from "@/lib/member-id";
import { buildQrMatrix } from "@/lib/qr-matrix";
import { formatMemberRoleLabel, type PublicMember } from "@/types/portal";
import { Camera, RotateCw, ShieldCheck } from "lucide-react";

interface VirtualIdCardProps {
  member: PublicMember;
  onEmptyPortraitClick?: () => void;
}

export function VirtualIdCard({
  member,
  onEmptyPortraitClick,
}: VirtualIdCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 80,
    glareY: 20,
  });

  const barcodeBars = useMemo(() => computePassBarcodeBars(member.id), [member.id]);
  const issueDate = useMemo(() => formatIssueDate(member.joinedAt), [member.joinedAt]);
  const initials = useMemo(() => getMemberInitials(member.fullName), [member.fullName]);
  const qrMatrix = useMemo(() => buildQrMatrix(member.id), [member.id]);
  const roleLabel = useMemo(() => formatMemberRoleLabel(member.role), [member.role]);

  const barcodeGeometry = useMemo(() => {
    const rects: Array<{ x: number; width: number }> = [];
    let x = 0;
    for (const width of barcodeBars) {
      rects.push({ x, width: width * 2 });
      x += width * 2 + 2;
    }
    return { rects, totalWidth: Math.max(1, x - 2) };
  }, [barcodeBars]);

  const qrRects = useMemo(() => {
    const cells: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < qrMatrix.size; r++) {
      for (let c = 0; c < qrMatrix.size; c++) {
        if (qrMatrix.isDark(r, c)) {
          cells.push({ x: c, y: r });
        }
      }
    }
    return cells;
  }, [qrMatrix]);

  const showPhoto =
    Boolean(member.avatarUrl) && failedAvatarUrl !== member.avatarUrl;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;
    setTilt({
      rotateX,
      rotateY,
      glareX: Math.round(px * 100),
      glareY: Math.round(py * 100),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 80, glareY: 20 });
  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto">
      {/* Interactive Flip Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#A1A1AA] truncate">
          {isFlipped ? "Back · QR Verification" : "Front · Member Pass"}
        </span>
        <button
          type="button"
          onClick={toggleFlip}
          aria-pressed={isFlipped}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 hover:border-[#38BDF8]/60 hover:text-[#38BDF8] text-xs font-mono text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCw
            className={`w-3.5 h-3.5 text-[#38BDF8] transition-transform duration-300 ${
              isFlipped ? "rotate-180" : ""
            }`}
            strokeWidth={1.75}
          />
          <span>Flip Pass ↻</span>
        </button>
      </div>

      {/* 3D Perspective + Tilt Stage */}
      <div style={{ perspective: "1200px" }}>
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={
            isFlipped
              ? "Virtual ID card back view. Click or press Enter to flip to front."
              : "Virtual ID card front view. Click or press Enter to flip to back."
          }
          onClick={toggleFlip}
          onKeyDown={handleCardKeyDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="cursor-pointer transition-transform duration-200 ease-out will-change-transform select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FB923C] rounded-2xl"
          style={{
            transform: `rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg)`,
          }}
        >
          {/* Flip Container */}
          <div
            className="relative w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* ==================== FRONT FACE ==================== */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 p-4 sm:p-6 shadow-2xl max-w-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Specular pointer-reactive cosmic sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(251, 146, 60, 0.14) 0%, rgba(56, 189, 248, 0.06) 36%, rgba(13, 14, 20, 0) 66%)`,
                }}
              />

              {/* Subtle Geometric "X" Architectural Watermark */}
              <svg
                aria-hidden="true"
                viewBox="0 0 220 220"
                className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56"
              >
                <rect
                  x="24"
                  y="18"
                  width="172"
                  height="184"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.06"
                  strokeWidth="1.25"
                />
                <line
                  x1="44"
                  y1="30"
                  x2="176"
                  y2="190"
                  stroke="#FFFFFF"
                  strokeOpacity="0.06"
                  strokeWidth="20"
                  strokeLinecap="butt"
                />
                <line
                  x1="176"
                  y1="30"
                  x2="44"
                  y2="190"
                  stroke="#FFFFFF"
                  strokeOpacity="0.04"
                  strokeWidth="20"
                  strokeLinecap="butt"
                />
              </svg>

              {/* Header: XOR • LAEC BIDAR + Role Tag */}
              <div className="relative z-10 flex items-center justify-between gap-2.5 pb-4 border-b border-white/15">
                <div className="font-heading text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white whitespace-nowrap">
                  XOR &bull; LAEC BIDAR
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FB923C]/12 border border-[#FB923C]/45 text-[10px] sm:text-[11px] font-mono tracking-[0.14em] uppercase text-[#FB923C] whitespace-nowrap shrink-0">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.75} />
                  <span>{roleLabel}</span>
                </div>
              </div>

              {/* Member Portrait + Core Identity */}
              <div className="relative z-10 py-5 flex items-center gap-3.5 sm:gap-5">
                <div
                  onClick={
                    !showPhoto && onEmptyPortraitClick
                      ? (e) => {
                          e.stopPropagation();
                          onEmptyPortraitClick();
                        }
                      : undefined
                  }
                  title={
                    !showPhoto && onEmptyPortraitClick
                      ? "Click to upload profile photo"
                      : undefined
                  }
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#050507] border border-white/15 overflow-hidden flex items-center justify-center shrink-0 ${
                    !showPhoto && onEmptyPortraitClick
                      ? "hover:border-[#38BDF8]/60 transition-colors cursor-pointer group/portrait"
                      : ""
                  }`}
                >
                  {showPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      onError={() =>
                        setFailedAvatarUrl(member.avatarUrl ?? null)
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <span
                        aria-label={`${member.fullName} monogram`}
                        className="text-lg sm:text-xl font-mono font-bold tracking-wider text-white"
                      >
                        {initials}
                      </span>
                      {onEmptyPortraitClick && (
                        <span className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#0D0E14]/90 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] group-hover/portrait:text-white">
                          <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={1.8} />
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#FB923C]">
                    Student Member
                  </div>
                  <h2 className="font-heading text-base sm:text-xl font-semibold tracking-tight text-white mt-0.5 truncate">
                    {member.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5 truncate">
                    {member.branchSemester}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#A1A1AA] mr-1.5">
                        USN
                      </span>
                      <span className="text-xs font-mono font-medium text-white tabular-nums">
                        {member.usn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Monospace XOR-26-XXXX Badge + Tap Hint */}
              <div className="relative z-10 pt-4 border-t border-white/15 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#A1A1AA]">
                    Unique Member ID
                  </div>
                  <div
                    data-testid="virtual-id-code"
                    className="inline-block mt-1 px-2.5 py-1 rounded-md bg-[#050507] border border-[#38BDF8]/45 text-base sm:text-lg font-mono font-bold tracking-[0.1em] text-[#38BDF8] tabular-nums whitespace-nowrap"
                  >
                    {member.id}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#FB923C]">
                    Tap for QR
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-[#A1A1AA] mt-0.5 tabular-nums">
                    {issueDate}
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== BACK FACE ==================== */}
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 p-4 sm:p-6 shadow-2xl flex flex-col justify-between max-w-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${100 - tilt.glareX}% ${tilt.glareY}%, rgba(56, 189, 248, 0.14) 0%, rgba(251, 146, 60, 0.05) 38%, rgba(13, 14, 20, 0) 64%)`,
                }}
              />

              {/* Back Header */}
              <div className="relative z-10 flex items-center justify-between gap-2.5 pb-3 border-b border-white/15">
                <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase text-[#FB923C] font-semibold">
                  PASS VERIFICATION
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#38BDF8] tabular-nums">
                  {member.id}
                </div>
              </div>

              {/* Center: Scannable Vector QR Code + Verification Details */}
              <div className="relative z-10 my-auto py-2 flex items-center gap-3 sm:gap-5">
                <div className="p-1.5 sm:p-2 rounded-xl bg-black border border-white/20 shrink-0">
                  <svg
                    role="img"
                    aria-label={`Scannable QR code for ${member.id}`}
                    viewBox={`-2 -2 ${qrMatrix.size + 4} ${qrMatrix.size + 4}`}
                    className="w-14 h-14 sm:w-16 sm:h-16"
                    shapeRendering="crispEdges"
                  >
                    <rect
                      x={-2}
                      y={-2}
                      width={qrMatrix.size + 4}
                      height={qrMatrix.size + 4}
                      fill="#000000"
                    />
                    {qrRects.map((cell, idx) => (
                      <rect
                        key={idx}
                        x={cell.x}
                        y={cell.y}
                        width={1}
                        height={1}
                        fill="#FFFFFF"
                      />
                    ))}
                  </svg>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#A1A1AA]">
                      ISSUED
                    </div>
                    <div className="text-xs font-mono font-medium text-white mt-0.5 tabular-nums">
                      {issueDate}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#A1A1AA] mb-0.5">
                      Verification Barcode
                    </div>
                    <svg
                      aria-label={`Verification barcode for ${member.id}`}
                      viewBox={`0 0 ${barcodeGeometry.totalWidth} 32`}
                      className="h-6 w-full max-w-[150px]"
                    >
                      {barcodeGeometry.rects.map((rect, idx) => (
                        <rect
                          key={idx}
                          x={rect.x}
                          y={0}
                          width={rect.width}
                          height={32}
                          fill="#FFFFFF"
                          opacity={0.92}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* College Seal Footer */}
              <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between gap-2 text-[10px]">
                <p className="font-mono tracking-[0.12em] uppercase text-[#A1A1AA] truncate">
                  LAEC BIDAR &bull; VERIFIED PASS
                </p>
                <span className="font-mono text-[#FB923C] font-semibold whitespace-nowrap shrink-0">
                  XOR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
