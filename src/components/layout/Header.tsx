"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_CONFIG } from "@/data/psyctech";
import { useAuth } from "@/context/AuthContext";
import { portalService } from "@/services/portalService";
import { formatMemberRoleLabel, isClubLeadRole } from "@/types/portal";
import {
  BROADCAST_SEEN_EVENT,
  LAST_SEEN_BROADCAST_KEY,
  countUnreadBroadcasts,
  getLastSeenBroadcast,
} from "@/lib/broadcast-unread";
import { AnimatePresence, motion } from "motion/react";
import { LogIn, LogOut, Menu, Radio, X } from "lucide-react";

const PORTAL_NAV_LINKS = [
  { label: "Campus HQ", href: "/campus" },
  { label: "Team", href: "/team" },
  { label: "Community", href: "/community" },
  { label: "My ID Card", href: "/dashboard" },
  { label: "FAQ", href: "/faq" },
];

interface UnreadState {
  userId: string;
  timestamps: string[];
  lastSeenIso: string | null;
}

export function Header() {
  const pathname = usePathname();
  const { user, isHydrated, openAuthModal, logOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadState, setUnreadState] = useState<UnreadState | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const activeUserId = isHydrated && user ? user.userId : null;

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!activeUserId) return;

    let cancelled = false;

    portalService
      .getAnnouncements()
      .then((list) => {
        if (!cancelled) {
          setUnreadState({
            userId: activeUserId,
            timestamps: list.map((item) => item.createdAt),
            lastSeenIso: getLastSeenBroadcast(),
          });
        }
      })
      .catch(() => {
        // Ignore network/auth check errors in badge polling
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserId, pathname]);

  useEffect(() => {
    if (!activeUserId) return;

    const syncLastSeen = () => {
      const nextSeen = getLastSeenBroadcast();
      setUnreadState((prev) =>
        prev && prev.userId === activeUserId
          ? { ...prev, lastSeenIso: nextSeen }
          : prev
      );
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_SEEN_BROADCAST_KEY || event.key === null) {
        syncLastSeen();
      }
    };

    window.addEventListener(BROADCAST_SEEN_EVENT, syncLastSeen);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(BROADCAST_SEEN_EVENT, syncLastSeen);
      window.removeEventListener("storage", handleStorage);
    };
  }, [activeUserId]);

  const unreadCount =
    activeUserId && unreadState?.userId === activeUserId
      ? countUnreadBroadcasts(unreadState.timestamps, unreadState.lastSeenIso)
      : 0;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (pathname === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isLead = user ? isClubLeadRole(user.role) : false;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050507]/90 backdrop-blur-md border-b border-white/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Pure White Wordmark */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="font-heading uppercase tracking-[0.28em] text-base font-bold text-white hover:text-[#FB923C] transition-colors whitespace-nowrap shrink-0"
          aria-label={`${BRAND_CONFIG.name} Home`}
        >
          {BRAND_CONFIG.name}
        </Link>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7"
        >
          {PORTAL_NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            const showBadge = item.href === "/community" && unreadCount > 0;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleNavClick}
                className={`inline-flex items-center gap-1.5 text-sm transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-[#FB923C] font-medium"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {showBadge && (
                  <span
                    aria-label={`${unreadCount} unread broadcasts`}
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#FB923C] text-[#050507] text-[10px] font-mono font-bold tabular-nums leading-none"
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isHydrated && user ? (
            <>
              {isLead && (
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded border border-[#FB923C]/50 bg-[#FB923C]/10 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#FB923C] whitespace-nowrap shrink-0">
                  Club Lead
                </span>
              )}
              <button
                type="button"
                onClick={logOut}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-white border border-white/15 hover:border-[#38BDF8]/60 hover:text-[#38BDF8] bg-[#0D0E14]/80 backdrop-blur-md px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Log Out</span>
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login", "/dashboard")}
              className="text-xs font-mono uppercase tracking-[0.14em] bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Join / Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-white bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 hover:border-[#38BDF8]/60 transition-colors cursor-pointer relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle navigation drawer"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" strokeWidth={1.8} />
            ) : (
              <Menu className="w-5 h-5 text-white" strokeWidth={1.8} />
            )}
            {!mobileMenuOpen && unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FB923C] border-2 border-[#050507]"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Drawer (#0D0E14) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 z-30 bg-black/85 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            <motion.div
              ref={drawerRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-40 md:hidden border-b border-white/15 bg-[#0D0E14]/80 backdrop-blur-md shadow-2xl px-6 py-5 max-w-full overflow-x-hidden"
            >
              <div className="flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FB923C] pb-2 border-b border-white/15 flex items-center justify-between">
                  <span>Navigation</span>
                  {user && (
                    <span className="text-[#A1A1AA] font-normal truncate max-w-[180px]">
                      {user.fullName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {PORTAL_NAV_LINKS.map((item) => {
                    const isActive = pathname === item.href;
                    const showBadge = item.href === "/community" && unreadCount > 0;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavClick}
                        className={`flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-colors min-h-[44px] ${
                          isActive
                            ? "bg-[#050507] text-[#FB923C] font-medium border border-[#FB923C]/50"
                            : "text-[#A1A1AA] hover:bg-[#050507]/70 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.href === "/community" && (
                            <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
                          )}
                          <span>{item.label}</span>
                        </span>
                        {showBadge && (
                          <span
                            aria-label={`${unreadCount} unread broadcasts`}
                            className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#FB923C] text-[#050507] text-[10px] font-mono font-bold tabular-nums"
                          >
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Drawer Auth Action */}
                <div className="pt-3 mt-2 border-t border-white/15">
                  {isHydrated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#050507] border border-white/15 text-xs font-mono">
                        <span className="text-[#38BDF8] tabular-nums">
                          {user.id}
                        </span>
                        <span className="text-[#FB923C] font-semibold">
                          {formatMemberRoleLabel(user.role)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          void logOut();
                        }}
                        className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#050507] border border-white/15 hover:border-[#38BDF8]/60 text-xs font-mono uppercase tracking-[0.12em] text-white hover:text-[#38BDF8] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("login", "/dashboard");
                      }}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] text-xs font-mono uppercase tracking-[0.14em] font-semibold transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Join / Login</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
