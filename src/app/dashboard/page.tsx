"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthForm } from "@/components/AuthForm";
import { VirtualIdCard } from "@/components/VirtualIdCard";
import { useAuth, type AuthModalMode } from "@/context/AuthContext";
import { exportIdCardAsPng } from "@/lib/export-id-card";
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
    <div className="min-h-screen flex flex-col bg-[#162323] text-[#EFE7E4]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 sm:py-16">
        {!isHydrated ? (
          <div className="max-w-[540px] mx-auto space-y-6">
            <div className="h-8 w-56 rounded-md bg-[#1D2C2C] animate-pulse" />
            <div className="h-[320px] w-full rounded-2xl bg-[#1D2C2C] border border-[#484A43]/45 animate-pulse" />
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A]">
                Virtual Member Pass
              </p>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#EFE7E4] mt-2">
                Claim Your XOR ID Card
              </h1>
              <p className="text-sm text-[#B59289] mt-2 leading-relaxed">
                Register with your LAEC Bidar details or sign in to view and download your official XOR-26 pass.
              </p>
            </div>

            <div className="rounded-xl bg-[#1D2C2C] border border-[#484A43]/60 p-6 sm:p-8">
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

            <div className="w-full max-w-[540px] mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#BC806A]">
                  My ID Card · LAEC Bidar
                </p>
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#EFE7E4] mt-1.5">
                  Welcome, {user.fullName.split(" ")[0]}
                </h1>
              </div>
              <span className="text-xs font-mono text-[#806B64] tabular-nums">
                {user.id} · {user.role}
              </span>
            </div>

            <VirtualIdCard
              member={user}
              onEmptyPortraitClick={openPhotoPicker}
            />

            {(photoError || downloadError) && (
              <div role="alert" className="mt-4 px-3.5 py-2 rounded-lg bg-[#BC806A]/15 border border-[#BC806A]/50 text-xs text-[#EFE7E4]">
                {photoError ?? downloadError}
              </div>
            )}

            {photoUpdated && (
              <div role="status" className="mt-4 px-3.5 py-2 rounded-lg bg-[#BC806A]/20 border border-[#BC806A]/60 text-xs text-[#EFE7E4] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#BC806A]" />
                <span>Profile photo updated successfully!</span>
              </div>
            )}

            {downloaded && (
              <div role="status" className="mt-4 px-3.5 py-2 rounded-lg bg-[#BC806A]/20 border border-[#BC806A]/60 text-xs text-[#EFE7E4] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#BC806A]" />
                <span>XOR member pass exported successfully as 2x PNG!</span>
              </div>
            )}

            {/* Card Actions */}
            <div className="w-full max-w-[540px] mt-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  disabled={uploadingPhoto}
                  className="bg-[#1D2C2C] hover:bg-[#243737] disabled:opacity-70 text-[#EFE7E4] border border-[#484A43] hover:border-[#BC806A]/70 font-medium py-3 px-4 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {photoUpdated ? (
                    <>
                      <Check className="w-4 h-4 text-[#BC806A]" strokeWidth={1.75} />
                      <span>Photo Updated</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-[#BC806A]" strokeWidth={1.75} />
                      <span>
                        {uploadingPhoto
                          ? "Uploading Photo..."
                          : "Upload / Change Photo"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-[#1D2C2C] hover:bg-[#243737] disabled:opacity-70 text-[#EFE7E4] border border-[#484A43] hover:border-[#BC806A]/70 font-medium py-3 px-4 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4 text-[#BC806A]" strokeWidth={1.75} />
                      <span>Downloaded PNG</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#BC806A]" strokeWidth={1.75} />
                      <span>{downloading ? "Exporting PNG..." : "Download ID Card"}</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href="/community"
                className="w-full bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] font-semibold py-3 px-5 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                <span>Enter Community</span>
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={1.75}
                />
              </Link>
            </div>

            {/* Subtle Optional Club Lead Passcode Activation */}
            {user.role === "MEMBER" && (
              <div className="w-full max-w-[540px] mt-8 pt-6 border-t border-[#484A43]/40">
                {!showLeadUnlock ? (
                  <button
                    type="button"
                    onClick={() => setShowLeadUnlock(true)}
                    className="text-xs font-mono text-[#806B64] hover:text-[#B59289] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.5} />
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
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1D2C2C] border border-[#484A43]/70 text-xs font-mono text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={unlocking}
                        className="px-4 py-2 rounded-lg bg-[#BC806A] disabled:opacity-70 text-[#162323] text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        {unlocking ? "Activating..." : "Activate Lead"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLeadUnlock(false);
                          setUnlockError(null);
                        }}
                        className="px-3 py-2 rounded-lg text-xs text-[#B59289] hover:text-[#EFE7E4] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {unlockError && (
                  <p className="text-xs text-[#BC806A] mt-2">{unlockError}</p>
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
