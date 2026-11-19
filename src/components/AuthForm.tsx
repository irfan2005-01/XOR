"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth, type AuthModalMode } from "@/context/AuthContext";
import { processAvatarImage } from "@/lib/avatar-upload";
import { ArrowRight, Camera, KeyRound, ShieldCheck, Upload, X } from "lucide-react";

const BRANCH_OPTIONS = [
  "Computer Science & Engineering (CSE)",
  "Artificial Intelligence & Machine Learning (AI & ML)",
  "Electronics & Communication Engineering (ECE)",
  "Mechanical Engineering",
  "Civil Engineering",
];

interface AuthFormProps {
  mode: AuthModalMode;
  onModeChange: (mode: AuthModalMode) => void;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const { signUp, logIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [usn, setUsn] = useState("");
  const [branchSemester, setBranchSemester] = useState(BRANCH_OPTIONS[0]);
  const [wantsLeadRole, setWantsLeadRole] = useState(false);
  const [leadPasscode, setLeadPasscode] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarSizeBytes, setAvatarSizeBytes] = useState<number | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setError(null);
    setProcessingPhoto(true);
    try {
      const processed = await processAvatarImage(rawFile);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarFile(processed.file);
      setAvatarPreviewUrl(processed.previewUrl);
      setAvatarSizeBytes(processed.sizeBytes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not process profile photo. Please try another image."
      );
    } finally {
      setProcessingPhoto(false);
      e.target.value = "";
    }
  };

  const clearPhoto = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setAvatarSizeBytes(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || processingPhoto) return;
    setError(null);

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signUp({
          fullName,
          usn,
          branchSemester,
          email,
          password,
          avatarFile: avatarFile ?? undefined,
          wantsLeadRole,
          leadPasscode,
        });
      } else {
        await logIn({ email, password });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid grid-cols-2 p-1 rounded-lg bg-[#050507] border border-white/15 mb-6"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => {
            setError(null);
            onModeChange("login");
          }}
          className={`py-2 px-3 rounded-md text-xs font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            mode === "login"
              ? "bg-[#FB923C] text-[#050507] font-semibold"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => {
            setError(null);
            onModeChange("signup");
          }}
          className={`py-2 px-3 rounded-md text-xs font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            mode === "signup"
              ? "bg-[#FB923C] text-[#050507] font-semibold"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          Member Sign Up
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 px-3.5 py-2.5 rounded-lg bg-[#FB923C]/10 border border-[#FB923C]/50 text-xs text-white leading-relaxed"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            {/* Optional Profile Photo Uploader */}
            <div>
              <span className="block text-xs font-medium text-[#A1A1AA] mb-2">
                Profile Photo{" "}
                <span className="font-mono text-[11px] text-[#38BDF8]">
                  (Optional)
                </span>
              </span>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#050507] border border-white/15">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Select optional profile photo"
                  className="relative w-16 h-16 rounded-xl bg-[#0D0E14] border border-white/15 hover:border-[#38BDF8]/60 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group transition-colors"
                >
                  {avatarPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreviewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera
                      className="w-5 h-5 text-[#38BDF8] group-hover:scale-110 transition-transform"
                      strokeWidth={1.6}
                    />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <input
                    ref={fileInputRef}
                    id="auth-avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processingPhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D0E14] border border-white/15 hover:border-[#38BDF8]/60 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-70"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#38BDF8]" strokeWidth={1.7} />
                      <span>
                        {processingPhoto
                          ? "Resizing 400×400..."
                          : avatarFile
                            ? "Change Photo"
                            : "Upload Photo"}
                      </span>
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={clearPhoto}
                        aria-label="Remove selected photo"
                        className="p-1.5 rounded-lg bg-[#0D0E14] border border-white/15 hover:border-[#FB923C]/60 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.7} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[#A1A1AA] mt-1.5 tabular-nums">
                    {avatarSizeBytes !== null
                      ? `Ready · 400×400 · ${Math.max(1, Math.round(avatarSizeBytes / 1024))} KB`
                      : "Optional · Add later on My ID Card"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-medium text-[#A1A1AA] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="auth-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#FB923C] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="auth-usn"
                  className="block text-xs font-medium text-[#A1A1AA] mb-1.5"
                >
                  College USN / Roll No.
                </label>
                <input
                  id="auth-usn"
                  type="text"
                  required
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="USN / Roll Number"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-sm font-mono uppercase text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#FB923C] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-branch"
                  className="block text-xs font-medium text-[#A1A1AA] mb-1.5"
                >
                  Branch
                </label>
                <select
                  id="auth-branch"
                  value={branchSemester}
                  onChange={(e) => setBranchSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FB923C] transition-colors"
                >
                  {BRANCH_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="bg-[#0D0E14] text-white"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-medium text-[#A1A1AA] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#FB923C] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-medium text-[#A1A1AA] mb-1.5"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#FB923C] transition-colors"
          />
        </div>

        {mode === "signup" && (
          <div className="pt-2 border-t border-white/15">
            <label
              htmlFor="auth-register-lead"
              className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer select-none"
            >
              <input
                id="auth-register-lead"
                type="checkbox"
                checked={wantsLeadRole}
                onChange={(e) => setWantsLeadRole(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-[#050507] accent-[#FB923C]"
              />
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-[#FB923C]"
                  strokeWidth={1.7}
                />
                <span>Register as a Club Lead</span>
              </span>
            </label>

            {wantsLeadRole && (
              <div className="mt-3 p-3 rounded-lg bg-[#050507] border border-[#FB923C]/40 space-y-2">
                <label
                  htmlFor="auth-lead-passcode"
                  className="text-xs font-medium text-[#FB923C] inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Lead Passcode</span>
                </label>
                <input
                  id="auth-lead-passcode"
                  type="text"
                  required
                  value={leadPasscode}
                  onChange={(e) => setLeadPasscode(e.target.value)}
                  placeholder="Enter Lead Passcode"
                  className="w-full px-3 py-2 rounded-md bg-[#0D0E14] border border-white/15 text-xs font-mono uppercase text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#FB923C]"
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || processingPhoto}
          className="w-full mt-2 bg-[#FB923C] text-[#050507] hover:bg-[#FDBA74] disabled:opacity-70 font-semibold py-3 px-5 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>
            {submitting
              ? mode === "signup"
                ? avatarFile
                  ? "Uploading Photo & Creating ID..."
                  : "Creating Member Pass..."
                : "Signing In..."
              : mode === "signup"
                ? "Create Member Pass"
                : "Sign In"}
          </span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}
