"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/AuthForm";
import { VirtualIdCard } from "@/components/VirtualIdCard";
import { useAuth, type AuthModalMode } from "@/context/AuthContext";
import { exportIdCardAsPng } from "@/lib/export-id-card";
import { formatMemberRoleLabel, isClubLeadRole } from "@/types/portal";
import { ArrowRight, Camera, Check, Download, KeyRound } from "lucide-react";

export default function DashboardPage() {
  const { user, isHydrated, upgradeToClubLead, updateMemberAvatar } = useAuth();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [authMode, setAuthMode] = useState<AuthModalMode>("login");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [showLeadUnlock, setShowLeadUnlock] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const openPhotoPicker = () => {
    if (uploadingPhoto) return;
    photoInputRef.current?.click();
  };

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploadingPhoto) return;

    setUploadingPhoto(true);
    setPhotoError(null);
    setPhotoUpdated(false);
    try {
      await updateMemberAvatar(file);
      setPhotoUpdated(true);
      setTimeout(() => setPhotoUpdated(false), 2400);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Could not update profile photo."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDownload = async () => {
    if (!user || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await exportIdCardAsPng(user);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2200);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Failed to export PNG."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleLeadUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unlocking) return;
    setUnlockError(null);
    setUnlocking(true);
    try {
      await upgradeToClubLead(passcode);
      setShowLeadUnlock(false);
      setPasscode("");
    } catch (err) {
      setUnlockError(
        err instanceof Error ? err.message : "Could not verify passcode."
      );
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white selection:bg-[#FB923C]/25 selection:text-white">
      <Header />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {!isHydrated ? (
          <div className="max-w-[340px] sm:max-w-[380px] mx-auto space-y-6">
            <div className="h-8 w-56 rounded-md bg-[#0D0E14]/80 backdrop-blur-md animate-pulse" />
            <div className="h-[320px] w-full rounded-2xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 animate-pulse" />
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#FB923C] font-medium">
                Virtual Member Pass
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-2">
                Claim Your XOR ID Card
              </h1>
              <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                Register with your LAEC Bidar details or sign in to view and download your official{" "}
                <span className="font-mono text-[#38BDF8]">XOR-26</span> pass.
              </p>
            </div>

            <div className="rounded-xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 p-5 sm:p-8 shadow-2xl">
              <AuthForm mode={authMode} onModeChange={setAuthMode} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelected}
              aria-label="Upload or change profile photo"
              className="sr-only"
            />

            <div className="w-full max-w-[340px] sm:max-w-[380px] mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
              <div>
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#FB923C] font-medium">
                  My ID Card &middot; LAEC Bidar
                </p>
                <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
                  Welcome, {user.fullName.split(" ")[0]}
                </h1>
              </div>
              <span className="text-xs font-mono text-[#38BDF8] tabular-nums">
                {user.id} &middot;{" "}
                <span className="text-[#FB923C]">
                  {formatMemberRoleLabel(user.role)}
                </span>
              </span>
            </div>

            <VirtualIdCard
              member={user}
              onEmptyPortraitClick={openPhotoPicker}
            />

            {(photoError || downloadError) && (
              <div
                role="alert"
                className="mt-4 px-3.5 py-2 rounded-lg bg-white/10 border border-white/35 text-xs text-white max-w-[340px] sm:max-w-[380px] w-full text-center"
              >
                {photoError ?? downloadError}
              </div>
            )}

            {photoUpdated && (
              <div
                role="status"
                className="mt-4 px-3.5 py-2 rounded-lg bg-white/10 border border-white/35 text-xs text-white flex items-center justify-center gap-2 max-w-[340px] sm:max-w-[380px] w-full"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Profile photo updated successfully!</span>
              </div>
            )}

            {downloaded && (
              <div
                role="status"
                className="mt-4 px-3.5 py-2 rounded-lg bg-white/10 border border-white/35 text-xs text-white flex items-center justify-center gap-2 max-w-[340px] sm:max-w-[380px] w-full"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>XOR member pass exported successfully as 2x PNG!</span>
              </div>
            )}

            {/* Card Actions */}
            <div className="w-full max-w-[340px] sm:max-w-[380px] mt-6 sm:mt-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  disabled={uploadingPhoto}
                  className="min-h-[44px] bg-[#0D0E14]/80 backdrop-blur-md hover:border-[#38BDF8]/60 disabled:opacity-70 text-white border border-white/15 font-medium py-2.5 px-3.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {photoUpdated ? (
                    <>
                      <Check className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.75} />
                      <span>Photo Updated</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.75} />
                      <span>
                        {uploadingPhoto
                          ? "Uploading Photo..."
                          : user.avatarUrl
                            ? "Change Photo"
                            : "Upload Photo"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="min-h-[44px] bg-[#0D0E14]/80 backdrop-blur-md hover:border-[#38BDF8]/60 disabled:opacity-70 text-white border border-white/15 font-medium py-2.5 px-3.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.75} />
                      <span>Downloaded PNG</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#FB923C]" strokeWidth={1.75} />
                      <span>{downloading ? "Exporting..." : "Download ID Card"}</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href="/community"
                className="w-full min-h-[44px] bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] font-semibold py-2.5 px-5 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                <span>Enter Community</span>
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            {/* Optional Club Lead Passcode Activation */}
            {!isClubLeadRole(user.role) && (
              <div className="w-full max-w-[340px] sm:max-w-[380px] mt-8 pt-6 border-t border-white/15">
                {!showLeadUnlock ? (
                  <button
                    type="button"
                    onClick={() => setShowLeadUnlock(true)}
                    className="text-xs font-mono text-[#A1A1AA] hover:text-[#FB923C] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#FB923C]" strokeWidth={1.5} />
                    <span>Are you a Club Lead? Activate posting access</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleLeadUnlock}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter Lead Passcode"
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 text-xs font-mono uppercase text-white placeholder:text-[#A1A1AA]/60 focus:outline-none focus:border-[#FB923C]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={unlocking}
                        className="px-4 py-2 rounded-lg bg-[#FB923C] hover:bg-[#FDBA74] disabled:opacity-70 text-[#050507] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                      >
                        {unlocking ? "Activating..." : "Activate Lead"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLeadUnlock(false);
                          setUnlockError(null);
                        }}
                        className="px-3 py-2 rounded-lg text-xs text-[#A1A1AA] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {unlockError && (
                  <p className="text-xs text-white/90 mt-2">{unlockError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
