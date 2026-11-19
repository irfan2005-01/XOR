"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/AuthForm";
import { useAuth, type AuthModalMode } from "@/context/AuthContext";
import { portalService } from "@/services/portalService";
import { markBroadcastsSeen } from "@/lib/broadcast-unread";
import type { Announcement, AnnouncementCategory } from "@/types/portal";
import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  Check,
  KeyRound,
  Lock,
  MapPin,
  Megaphone,
  Plus,
  Radio,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

type ChannelFilter = "ALL" | "ANNOUNCEMENT" | "EVENT";

const CHANNEL_FILTERS: Array<{ value: ChannelFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ANNOUNCEMENT", label: "Announcements" },
  { value: "EVENT", label: "Events" },
];

interface FeedState {
  userId: string;
  items: Announcement[];
  memberCount: number;
  error: string | null;
}

function formatBroadcastTimestamp(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export default function CommunityPage() {
  const { user, isHydrated, upgradeToClubLead } = useAuth();
  const [feedState, setFeedState] = useState<FeedState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<AuthModalMode>("login");
  const [activeFilter, setActiveFilter] = useState<ChannelFilter>("ALL");

  // Club Lead Hovering Composer State
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<"ANNOUNCEMENT" | "EVENT">(
    "ANNOUNCEMENT"
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [venue, setVenue] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Member inline Club Lead unlock & Event Interest pending state
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [leadPasscode, setLeadPasscode] = useState("");
  const [leadError, setLeadError] = useState<string | null>(null);
  const [unlockingLead, setUnlockingLead] = useState(false);
  const [rsvpPendingId, setRsvpPendingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const activeUserId = user?.userId ?? null;

  useEffect(() => {
    if (!composerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setComposerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [composerOpen]);

  useEffect(() => {
    if (!activeUserId) {
      return;
    }

    let cancelled = false;

    Promise.all([portalService.getAnnouncements(), portalService.getMemberCount()])
      .then(([list, count]) => {
        if (!cancelled) {
          setFeedState({
            userId: activeUserId,
            items: list,
            memberCount: count,
            error: null,
          });
          const latestCreatedAt =
            list.length > 0 ? list[list.length - 1].createdAt : null;
          markBroadcastsSeen(latestCreatedAt);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFeedState({
            userId: activeUserId,
            items: [],
            memberCount: 0,
            error:
              err instanceof Error
                ? err.message
                : "Could not load broadcast channel.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  const loadingFeed = Boolean(activeUserId) && feedState?.userId !== activeUserId;
  const announcements =
    activeUserId && feedState?.userId === activeUserId ? feedState.items : [];
  const memberCount =
    activeUserId && feedState?.userId === activeUserId
      ? feedState.memberCount
      : 0;
  const feedError =
    actionError ??
    (activeUserId && feedState?.userId === activeUserId ? feedState.error : null);

  const filteredBroadcasts = announcements.filter((item) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "ANNOUNCEMENT") {
      return item.category === "ANNOUNCEMENT";
    }
    return item.category === "EVENT" || item.category === "WORKSHOP";
  });

  const handleToggleInterested = async (announcementId: string) => {
    if (!user || rsvpPendingId === announcementId) return;
    setRsvpPendingId(announcementId);
    setActionError(null);
    try {
      const updated = await portalService.toggleRsvp(announcementId, user.userId);
      setFeedState((prev) => ({
        userId: user.userId,
        items: updated,
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not update your interest reaction."
      );
    } finally {
      setRsvpPendingId(null);
    }
  };

  const handleDeleteBroadcast = async (announcementId: string) => {
    if (!user || user.role !== "CLUB LEAD" || deletingId) return;
    setDeletingId(announcementId);
    setActionError(null);
    try {
      const updated = await portalService.deleteAnnouncement(announcementId, user);
      setFeedState((prev) => ({
        userId: user.userId,
        items: updated,
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
      setConfirmDeleteId(null);
    } catch {
      // Optimistic removal so user is never blocked by permission error
      setFeedState((prev) => ({
        userId: user.userId,
        items: (prev?.items ?? []).filter((item) => item.id !== announcementId),
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllBroadcasts = async () => {
    if (!user || user.role !== "CLUB LEAD" || clearingAll) return;
    setClearingAll(true);
    setActionError(null);
    try {
      const updated = await portalService.clearAllAnnouncements(user);
      setFeedState((prev) => ({
        userId: user.userId,
        items: updated,
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
      setConfirmClearAll(false);
      markBroadcastsSeen(null);
    } catch {
      setFeedState((prev) => ({
        userId: user.userId,
        items: [],
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
      setConfirmClearAll(false);
      markBroadcastsSeen(null);
    } finally {
      setClearingAll(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || publishing) return;
    setPostError(null);
    setPublishing(true);

    const category: AnnouncementCategory = composerType;
    const isEvent = composerType === "EVENT";

    try {
      const updated = await portalService.createAnnouncement(
        {
          title,
          body,
          category,
          dateTime: isEvent ? dateTime : "",
          venue: isEvent ? venue : "",
        },
        user
      );
      setFeedState((prev) => ({
        userId: user.userId,
        items: updated,
        memberCount: prev?.memberCount ?? 0,
        error: null,
      }));
      const latestCreatedAt =
        updated.length > 0 ? updated[updated.length - 1].createdAt : null;
      markBroadcastsSeen(latestCreatedAt);
      setTitle("");
      setBody("");
      setDateTime("");
      setVenue("");
      setComposerOpen(false);
      setBroadcastSuccess("Broadcast sent successfully to the community feed!");
      setTimeout(() => setBroadcastSuccess(null), 3500);
    } catch (err) {
      setPostError(
        err instanceof Error ? err.message : "Could not send broadcast."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleUnlockLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockingLead) return;
    setLeadError(null);
    setUnlockingLead(true);
    try {
      await upgradeToClubLead(leadPasscode);
      setShowPasscodeInput(false);
      setLeadPasscode("");
    } catch (err) {
      setLeadError(
        err instanceof Error ? err.message : "Invalid Club Lead passcode."
      );
    } finally {
      setUnlockingLead(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4]">
      <Header />

      {!isHydrated ? (
        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-5">
          <div className="h-24 rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse" />
          <div className="h-36 rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse max-w-xl" />
          <div className="h-36 rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse max-w-xl" />
        </main>
      ) : !user ? (
        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 sm:py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A]">
                XOR • Official Broadcast Channel
              </p>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#EFE7E4] mt-2">
                Sign In to Join Channel
              </h1>
              <p className="text-sm text-[#B59289] mt-2 leading-relaxed">
                Receive direct broadcasts from XOR Club Leads and react to event pitches at LAEC Bidar.
              </p>
            </div>

            <div className="rounded-2xl bg-[#1D2C2C] border border-[#484A43]/60 p-6 sm:p-8">
              <AuthForm mode={authMode} onModeChange={setAuthMode} />
            </div>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Sticky Broadcast Channel Header */}
          <div className="sticky top-16 z-30 bg-[#162323]/92 backdrop-blur-md border-b border-[#484A43]/45">
            <div className="max-w-3xl mx-auto px-6 py-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#1D2C2C] border border-[#BC806A]/60 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-[#BC806A]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-mono tracking-[0.18em] uppercase text-[#EFE7E4] font-semibold">
                      XOR • OFFICIAL BROADCAST CHANNEL
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B59289] tabular-nums">
                        <Users className="w-3 h-3 text-[#BC806A]" strokeWidth={1.8} />
                        <span>
                          {memberCount} {memberCount === 1 ? "member" : "members"}
                        </span>
                      </span>
                      <span className="text-[#484A43]" aria-hidden="true">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[#BC806A]">
                        ONLY CLUB LEADS CAN SEND MESSAGES
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                  {user.role === "CLUB LEAD" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setPostError(null);
                          setComposerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] text-xs font-mono font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Post Announcement</span>
                      </button>

                      {announcements.length > 0 &&
                        (!confirmClearAll ? (
                          <button
                            type="button"
                            onClick={() => setConfirmClearAll(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1D2C2C] border border-[#484A43]/70 hover:border-[#BC806A] text-[#B59289] hover:text-[#EFE7E4] text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.7} />
                            <span>Clear All</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1D2C2C] border border-[#BC806A]/70 text-xs font-mono">
                            <span className="text-[#EFE7E4]">Clear all?</span>
                            <button
                              type="button"
                              disabled={clearingAll}
                              onClick={() => void handleClearAllBroadcasts()}
                              className="px-2 py-0.5 rounded bg-[#BC806A] text-[#162323] font-semibold cursor-pointer disabled:opacity-60"
                            >
                              {clearingAll ? "..." : "Yes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmClearAll(false)}
                              className="px-1.5 py-0.5 text-[#806B64] hover:text-[#EFE7E4] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ))}
                    </>
                  )}

                  <Link
                    href="/dashboard"
                    className="text-xs font-mono text-[#B59289] hover:text-[#BC806A] transition-colors whitespace-nowrap"
                  >
                    {user.id} · My ID →
                  </Link>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between gap-4">
                <div
                  role="tablist"
                  aria-label="Filter broadcast messages"
                  className="inline-flex items-center gap-1.5"
                >
                  {CHANNEL_FILTERS.map((filter) => {
                    const isSelected = activeFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isSelected
                            ? "bg-[#BC806A] text-[#162323] font-semibold"
                            : "bg-[#1D2C2C] text-[#B59289] border border-[#484A43]/60 hover:text-[#EFE7E4]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] font-mono text-[#806B64] tabular-nums">
                  {filteredBroadcasts.length}{" "}
                  {filteredBroadcasts.length === 1 ? "message" : "messages"}
                </span>
              </div>
            </div>
          </div>

          {/* Chronological Channel Message Stream */}
          <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-end">
            {feedError && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 rounded-xl bg-[#BC806A]/15 border border-[#BC806A]/50 text-xs text-[#EFE7E4]"
              >
                {feedError}
              </div>
            )}

            {broadcastSuccess && (
              <div
                role="status"
                className="mb-6 px-4 py-3 rounded-xl bg-[#BC806A]/20 border border-[#BC806A]/60 text-xs text-[#EFE7E4] flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-[#BC806A]" />
                <span>{broadcastSuccess}</span>
              </div>
            )}

            {loadingFeed ? (
              <div className="space-y-4">
                <div className="h-32 rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse max-w-xl" />
                <div className="h-40 rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse max-w-xl" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="my-auto py-16 text-center max-w-md mx-auto">
                <div className="w-11 h-11 rounded-full bg-[#1D2C2C] border border-[#484A43]/60 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-5 h-5 text-[#BC806A]" strokeWidth={1.6} />
                </div>
                <p className="text-sm text-[#B59289] leading-relaxed">
                  No official broadcasts yet — Club Leads will post upcoming builds and sessions here.
                </p>
              </div>
            ) : filteredBroadcasts.length === 0 ? (
              <div className="my-auto py-14 text-center">
                <p className="text-sm text-[#B59289]">
                  No {activeFilter === "EVENT" ? "event pitches" : "announcements"} posted yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBroadcasts.map((item) => {
                  const isEvent =
                    item.category === "EVENT" || item.category === "WORKSHOP";
                  const isInterested = item.rsvpMemberIds.includes(user.userId);
                  const interestedCount = item.rsvpMemberIds.length;
                  const isUpdating = rsvpPendingId === item.id;
                  const timestampLabel = formatBroadcastTimestamp(item.createdAt);

                  return (
                    <div key={item.id} className="flex flex-col items-start">
                      {/* Left-aligned Broadcast Bubble */}
                      <article className="w-full max-w-2xl rounded-2xl rounded-tl-sm bg-[#1D2C2C] border border-[#484A43]/60 px-4 py-3.5 sm:px-6 sm:py-5">
                        {/* Sender & Type Metadata Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#BC806A] text-[#162323] text-[10px] font-mono font-bold uppercase tracking-[0.12em]">
                              CLUB LEAD
                            </span>
                            <span className="text-xs font-medium text-[#EFE7E4]">
                              {item.authorName}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono uppercase tracking-[0.14em]">
                            <span className="text-[#BC806A]">
                              {isEvent ? "EVENT PITCH" : "ANNOUNCEMENT"}
                            </span>
                            {timestampLabel && (
                              <>
                                <span className="text-[#484A43]" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-[#806B64] tabular-nums">
                                  {timestampLabel}
                                </span>
                              </>
                            )}
                            {user.role === "CLUB LEAD" && (
                              <span className="ml-1 inline-flex items-center">
                                {confirmDeleteId === item.id ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#162323] border border-[#BC806A]/60 px-2 py-0.5 normal-case tracking-normal">
                                    <button
                                      type="button"
                                      disabled={deletingId === item.id}
                                      onClick={() => void handleDeleteBroadcast(item.id)}
                                      className="text-[#BC806A] hover:text-[#EFE7E4] font-semibold cursor-pointer disabled:opacity-60"
                                    >
                                      {deletingId === item.id ? "Deleting..." : "Confirm"}
                                    </button>
                                    <span className="text-[#484A43]">/</span>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-[#806B64] hover:text-[#EFE7E4] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(item.id)}
                                    aria-label={`Delete ${item.title}`}
                                    title="Delete broadcast"
                                    className="p-1 rounded text-[#806B64] hover:text-[#BC806A] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.7} />
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Body */}
                        <h2 className="text-base sm:text-lg font-medium text-[#EFE7E4] tracking-tight mt-3">
                          {item.title}
                        </h2>
                        <p className="text-sm text-[#B59289] leading-relaxed mt-1.5 whitespace-pre-line">
                          {item.body}
                        </p>

                        {/* Optional Date & Venue Pills */}
                        {(item.dateTime || item.venue) && (
                          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-[#484A43]/40">
                            {item.dateTime && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#162323] border border-[#484A43]/60 text-[11px] font-mono text-[#EFE7E4] tabular-nums">
                                <Calendar
                                  className="w-3 h-3 text-[#BC806A]"
                                  strokeWidth={1.7}
                                />
                                <span>{item.dateTime}</span>
                              </span>
                            )}
                            {item.venue && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#162323] border border-[#484A43]/60 text-[11px] font-mono text-[#B59289]">
                                <MapPin
                                  className="w-3 h-3 text-[#BC806A]"
                                  strokeWidth={1.7}
                                />
                                <span>{item.venue}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </article>

                      {/* Event Interest Reaction Pill (Demand Validation) */}
                      {isEvent && (
                        <button
                          type="button"
                          onClick={() => void handleToggleInterested(item.id)}
                          disabled={isUpdating}
                          aria-pressed={isInterested}
                          className={`mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer tabular-nums disabled:opacity-70 min-h-[36px] max-w-full flex-wrap ${
                            isInterested
                              ? "bg-[#BC806A] text-[#162323] font-semibold hover:bg-[#C9917D]"
                              : "bg-[#1D2C2C] text-[#EFE7E4] border border-[#484A43]/70 hover:border-[#BC806A]"
                          }`}
                        >
                          <span>
                            🔥 Interested • {interestedCount}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* Member Read-Only Channel Footer */}
          {user.role !== "CLUB LEAD" && (
            <div className="sticky bottom-0 z-30 bg-[#162323]/95 backdrop-blur-md border-t border-[#484A43]/50">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#B59289]">
                    <Lock className="w-3.5 h-3.5 text-[#806B64] shrink-0" strokeWidth={1.7} />
                    <span>
                      Only XOR Club Leads can send messages in this channel.
                    </span>
                  </div>

                  {!showPasscodeInput ? (
                    <button
                      type="button"
                      onClick={() => setShowPasscodeInput(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#806B64] hover:text-[#BC806A] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                    >
                      <KeyRound className="w-3 h-3" strokeWidth={1.6} />
                      <span>Lead Passcode</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      <form
                        onSubmit={handleUnlockLead}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          value={leadPasscode}
                          onChange={(e) => setLeadPasscode(e.target.value)}
                          placeholder="Lead Passcode"
                          className="w-32 px-2.5 py-1 rounded-lg bg-[#1D2C2C] border border-[#484A43] text-xs font-mono text-[#EFE7E4] focus:outline-none focus:border-[#BC806A]"
                        />
                        <button
                          type="submit"
                          disabled={unlockingLead}
                          className="px-3 py-1 rounded-lg bg-[#BC806A] disabled:opacity-70 text-[#162323] text-xs font-semibold cursor-pointer"
                        >
                          {unlockingLead ? "..." : "Unlock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasscodeInput(false);
                            setLeadError(null);
                          }}
                          className="text-xs text-[#806B64] hover:text-[#EFE7E4] px-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </form>
                      {leadError && (
                        <p className="text-[11px] text-[#BC806A]">{leadError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hovering Broadcast Composer Modal (Visible only to Club Leads after clicking Post Announcement) */}
          <AnimatePresence>
            {user.role === "CLUB LEAD" && composerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#162323]/80 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="broadcast-composer-title"
              >
                <div
                  className="absolute inset-0"
                  onClick={() => setComposerOpen(false)}
                  aria-hidden="true"
                />

                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-lg rounded-2xl bg-[#1D2C2C] border border-[#BC806A]/55 p-4 sm:p-6 md:p-7 shadow-2xl overflow-x-hidden"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#BC806A]">
                        XOR • Club Lead Broadcast
                      </p>
                      <h2
                        id="broadcast-composer-title"
                        className="text-xl font-medium text-[#EFE7E4] mt-1 tracking-tight"
                      >
                        Post Announcement
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setComposerOpen(false)}
                      aria-label="Close broadcast composer"
                      className="p-2 rounded-lg text-[#B59289] hover:text-[#EFE7E4] hover:bg-[#162323] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  <form onSubmit={handlePublish} className="space-y-4">
                    {postError && (
                      <div
                        role="alert"
                        className="px-3.5 py-2.5 rounded-lg bg-[#BC806A]/15 border border-[#BC806A]/50 text-xs text-[#EFE7E4]"
                      >
                        {postError}
                      </div>
                    )}

                    {/* Type Switcher */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setComposerType("ANNOUNCEMENT")}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                            composerType === "ANNOUNCEMENT"
                              ? "bg-[#BC806A] text-[#162323] font-semibold"
                              : "bg-[#162323] text-[#B59289] border border-[#484A43]/60 hover:text-[#EFE7E4]"
                          }`}
                        >
                          <Megaphone className="w-3.5 h-3.5" strokeWidth={1.8} />
                          <span>Announcement</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setComposerType("EVENT")}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                            composerType === "EVENT"
                              ? "bg-[#BC806A] text-[#162323] font-semibold"
                              : "bg-[#162323] text-[#B59289] border border-[#484A43]/60 hover:text-[#EFE7E4]"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
                          <span>Event Pitch</span>
                        </button>
                      </div>

                      <span className="text-[11px] font-mono text-[#806B64]">
                        As {user.fullName}
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="broadcast-title"
                        className="block text-xs font-medium text-[#B59289] mb-1.5"
                      >
                        {composerType === "EVENT" ? "Event Title" : "Headline"}
                      </label>
                      <input
                        id="broadcast-title"
                        type="text"
                        required
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          composerType === "EVENT"
                            ? "Event Title"
                            : "Announcement Headline"
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] placeholder:text-[#806B64]/80 focus:outline-none focus:border-[#BC806A]"
                      />
                    </div>

                    {composerType === "EVENT" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="broadcast-date"
                            className="block text-xs font-medium text-[#B59289] mb-1.5"
                          >
                            Date &amp; Time <span className="text-[#806B64]">(optional)</span>
                          </label>
                          <input
                            id="broadcast-date"
                            type="text"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            placeholder="Date & Time"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#162323] border border-[#484A43]/70 text-xs font-mono text-[#EFE7E4] placeholder:text-[#806B64]/80 focus:outline-none focus:border-[#BC806A]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="broadcast-venue"
                            className="block text-xs font-medium text-[#B59289] mb-1.5"
                          >
                            Venue <span className="text-[#806B64]">(optional)</span>
                          </label>
                          <input
                            id="broadcast-venue"
                            type="text"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            placeholder="Venue"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#162323] border border-[#484A43]/70 text-xs font-mono text-[#EFE7E4] placeholder:text-[#806B64]/80 focus:outline-none focus:border-[#BC806A]"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="broadcast-message"
                        className="block text-xs font-medium text-[#B59289] mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="broadcast-message"
                        required
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={
                          composerType === "EVENT"
                            ? "Event description..."
                            : "Broadcast message..."
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] placeholder:text-[#806B64]/80 focus:outline-none focus:border-[#BC806A] resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setComposerOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-mono text-[#B59289] hover:text-[#EFE7E4] hover:bg-[#162323] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={publishing}
                        className="inline-flex items-center gap-1.5 bg-[#BC806A] hover:bg-[#C9917D] disabled:opacity-70 text-[#162323] font-semibold px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-[0.1em] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" strokeWidth={1.9} />
                        <span>{publishing ? "Sending..." : "Send Broadcast"}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Footer />
    </div>
  );
}
