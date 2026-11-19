"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_CONFIG } from "@/data/psyctech";
import { useAuth } from "@/context/AuthContext";
import { portalService } from "@/services/portalService";
import {
  BROADCAST_SEEN_EVENT,
  LAST_SEEN_BROADCAST_KEY,
  countUnreadBroadcasts,
  getLastSeenBroadcast,
} from "@/lib/broadcast-unread";
import { AnimatePresence, motion } from "motion/react";
import { LogIn, LogOut, Menu, Radio, X } from "lucide-react";

const PORTAL_NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Campus HQ", href: "/#campus" },
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

  // Auto-close drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Outside click handler to close mobile menu
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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const target = document.querySelector(href.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (pathname === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#162323]/90 backdrop-blur-md border-b border-[#484A43]/45">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Navbar Wordmark */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="uppercase tracking-[0.22em] text-base font-semibold text-[#EFE7E4] hover:text-[#BC806A] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          aria-label={`${BRAND_CONFIG.name} Home - Scroll to top`}
        >
          <span className="w-2 h-2 rounded-full bg-[#BC806A]" />
          <span>{BRAND_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7"
        >
          {PORTAL_NAV_LINKS.map((item) => {
            const isActive =
              !item.href.startsWith("/#") && pathname === item.href;
            const showBadge = item.href === "/community" && unreadCount > 0;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`inline-flex items-center gap-1.5 text-sm transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-[#EFE7E4] font-medium"
                    : "text-[#B59289] hover:text-[#EFE7E4]"
                }`}
              >
                <span>{item.label}</span>
                {showBadge && (
                  <span
                    aria-label={`${unreadCount} unread broadcasts`}
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#BC806A] text-[#162323] text-[10px] font-mono font-bold tabular-nums leading-none"
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          {isHydrated && user ? (
            <div className="flex items-center gap-3">
              {user.role === "CLUB LEAD" && (
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full bg-[#BC806A] text-[#162323] text-[10px] font-mono font-bold uppercase tracking-[0.12em]">
                  CLUB LEAD
                </span>
              )}
              <button
                type="button"
                onClick={logOut}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-[#EFE7E4] border border-[#484A43] hover:border-[#BC806A] bg-[#1D2C2C] px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Log Out</span>
                <LogOut className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.6} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login", "/dashboard")}
              className="text-xs font-mono uppercase tracking-[0.14em] text-[#162323] bg-[#BC806A] hover:bg-[#C9917D] px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Join / Login
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-[#EFE7E4] bg-[#1D2C2C] border border-[#484A43]/70 hover:border-[#BC806A] transition-colors cursor-pointer relative"
            aria-label="Toggle navigation drawer"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#BC806A]" strokeWidth={1.8} />
            ) : (
              <Menu className="w-5 h-5 text-[#EFE7E4]" strokeWidth={1.8} />
            )}
            {!mobileMenuOpen && unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#BC806A] border-2 border-[#162323]"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Drawer (#1D2C2C) with Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop for outside-tap closing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 z-30 bg-[#162323]/80 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            {/* Slide-Down Drawer Container */}
            <motion.div
              ref={drawerRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-40 md:hidden border-b border-[#484A43]/70 bg-[#1D2C2C] shadow-2xl px-6 py-5 max-w-full overflow-x-hidden"
            >
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#BC806A] pb-1 border-b border-[#484A43]/40 flex items-center justify-between">
                  <span>Navigation</span>
                  {user && (
                    <span className="text-[#806B64] font-normal truncate max-w-[180px]">
                      {user.fullName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {PORTAL_NAV_LINKS.map((item) => {
                    const isActive =
                      !item.href.startsWith("/#") && pathname === item.href;
                    const showBadge = item.href === "/community" && unreadCount > 0;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#162323] text-[#EFE7E4] font-medium border border-[#BC806A]/40"
                            : "text-[#B59289] hover:bg-[#162323]/60 hover:text-[#EFE7E4]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.href === "/community" && (
                            <Radio className="w-3.5 h-3.5 text-[#BC806A]" />
                          )}
                          <span>{item.label}</span>
                        </span>
                        {showBadge && (
                          <span
                            aria-label={`${unreadCount} unread broadcasts`}
                            className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#BC806A] text-[#162323] text-[10px] font-mono font-bold tabular-nums"
                          >
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Drawer Auth Action */}
                <div className="pt-3 mt-2 border-t border-[#484A43]/40">
                  {isHydrated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#162323] border border-[#484A43]/50 text-xs font-mono">
                        <span className="text-[#806B64]">ID: {user.id}</span>
                        <span className="text-[#BC806A] font-semibold">{user.role}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          void logOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#162323] border border-[#484A43] hover:border-[#BC806A] text-xs font-mono uppercase tracking-[0.12em] text-[#EFE7E4] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-[#BC806A]" />
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
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#BC806A] hover:bg-[#C9917D] text-xs font-mono uppercase tracking-[0.14em] text-[#162323] font-semibold transition-colors cursor-pointer shadow-md"
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
