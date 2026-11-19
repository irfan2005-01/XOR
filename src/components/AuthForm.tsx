"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth, type AuthModalMode } from "@/context/AuthContext";
import { processAvatarImage } from "@/lib/avatar-upload";
import { DEFAULT_LEAD_CREDENTIALS } from "@/services/portalService";
import { ArrowRight, Camera, KeyRound, ShieldCheck, Sparkles, Upload } from "lucide-react";

const BRANCH_SEMESTER_OPTIONS = [
  "CSE • 5th Sem",
  "CSE • 3rd Sem",
  "CSE • 7th Sem",
  "AI & ML • 5th Sem",
  "AI & ML • 3rd Sem",
  "ECE • 5th Sem",
  "ECE • 3rd Sem",
  "Mechanical • 5th Sem",
  "Civil • 5th Sem",
  "CSE • 1st Sem",
];

interface AuthFormProps {
  mode: AuthModalMode;
  onModeChange: (mode: AuthModalMode) => void;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const { signUp, logIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [usn, setUsn] = useState("");
  const [branchSemester, setBranchSemester] = useState(BRANCH_SEMESTER_OPTIONS[0]);
  const [wantsLeadRole, setWantsLeadRole] = useState(false);
  const [leadPasscode, setLeadPasscode] = useState("");

  // Mandatory Profile Photo state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarSizeBytes, setAvatarSizeBytes] = useState<number | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credentialsGenerated, setCredentialsGenerated] = useState(false);

  const handleGenerateLeadCredentials = () => {
    setEmail(DEFAULT_LEAD_CREDENTIALS.email);
    setPassword(DEFAULT_LEAD_CREDENTIALS.password);
    onModeChange("login");
    setCredentialsGenerated(true);
    setError(null);
    setTimeout(() => setCredentialsGenerated(false), 3000);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || processingPhoto) return;
    setError(null);

    if (mode === "signup" && !avatarFile) {
      setError("Please upload a profile photo to create your XOR member pass.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signUp({
          fullName,
          usn,
          branchSemester,
          email,
          password,
          avatarFile,
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
      {/* Lead Access Card */}
      <div className="mb-6 p-4 rounded-xl bg-[#162323] border border-[#BC806A]/45">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[#BC806A] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Club Lead Quick Access
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#BC806A]/20 text-[#EFE7E4] border border-[#BC806A]/30">
            Full Control
          </span>
        </div>
        <p className="text-xs text-[#B59289] leading-relaxed mb-3">
          Sign in with Lead credentials to manage broadcasts, events, and all portal operations.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#1D2C2C] border border-[#484A43]/60">
          <div className="text-xs font-mono space-y-0.5 min-w-0">
            <div className="text-[#EFE7E4] truncate">
              <span className="text-[#806B64]">Email:</span> lead@xor.club
            </div>
            <div className="text-[#EFE7E4] truncate">
              <span className="text-[#806B64]">Password:</span> xorlead2026
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateLeadCredentials}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-[#BC806A] hover:bg-[#C9917D] text-[#162323] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{credentialsGenerated ? "Credentials Loaded!" : "Generate & Fill Lead Login"}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid grid-cols-2 p-1 rounded-lg bg-[#162323] border border-[#484A43]/60 mb-6"
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
              ? "bg-[#BC806A] text-[#162323]"
              : "text-[#B59289] hover:text-[#EFE7E4]"
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
              ? "bg-[#BC806A] text-[#162323]"
              : "text-[#B59289] hover:text-[#EFE7E4]"
          }`}
        >
          Member Sign Up
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 px-3.5 py-2.5 rounded-lg bg-[#BC806A]/15 border border-[#BC806A]/50 text-xs text-[#EFE7E4] leading-relaxed"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            {/* Mandatory Profile Photo Uploader */}
            <div>
              <span className="block text-xs font-medium text-[#B59289] mb-2">
                Profile Photo <span className="text-[#BC806A]">*</span>
              </span>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#162323] border border-[#484A43]/70">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Select profile photo"
                  className="relative w-16 h-16 rounded-xl bg-[#1D2C2C] border-[1.5px] border-[#BC806A]/75 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group"
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
                      className="w-5 h-5 text-[#BC806A] group-hover:scale-110 transition-transform"
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D2C2C] border border-[#484A43] hover:border-[#BC806A] text-xs font-medium text-[#EFE7E4] transition-colors cursor-pointer disabled:opacity-70"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.7} />
                    <span>
                      {processingPhoto
                        ? "Resizing 400×400..."
                        : avatarFile
                          ? "Change Photo"
                          : "Upload Photo"}
                    </span>
                  </button>
                  <p className="text-[11px] font-mono text-[#806B64] mt-1.5 truncate tabular-nums">
                    {avatarSizeBytes !== null
                      ? `Ready · 400×400 · ${Math.max(1, Math.round(avatarSizeBytes / 1024))} KB`
                      : "Required · JPG, PNG or WebP (<300KB)"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-medium text-[#B59289] mb-1.5"
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
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="auth-usn"
                  className="block text-xs font-medium text-[#B59289] mb-1.5"
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#162323] border border-[#484A43]/70 text-sm font-mono uppercase text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-branch"
                  className="block text-xs font-medium text-[#B59289] mb-1.5"
                >
                  Branch &amp; Semester
                </label>
                <select
                  id="auth-branch"
                  value={branchSemester}
                  onChange={(e) => setBranchSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] focus:outline-none focus:border-[#BC806A] transition-colors"
                >
                  {BRANCH_SEMESTER_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[#1D2C2C] text-[#EFE7E4]">
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
            className="block text-xs font-medium text-[#B59289] mb-1.5"
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
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-medium text-[#B59289] mb-1.5"
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
            placeholder="Password"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#162323] border border-[#484A43]/70 text-sm text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A] transition-colors"
          />
        </div>

        {mode === "signup" && (
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-[#B59289] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wantsLeadRole}
                onChange={(e) => setWantsLeadRole(e.target.checked)}
                className="w-4 h-4 rounded border-[#484A43] bg-[#162323] accent-[#BC806A]"
              />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.6} />
                Register with Club Lead access (requires passcode)
              </span>
            </label>

            {wantsLeadRole && (
              <div className="mt-3 p-3 rounded-lg bg-[#162323] border border-[#484A43]/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="auth-lead-passcode"
                    className="text-xs font-medium text-[#EFE7E4] inline-flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#BC806A]" strokeWidth={1.5} />
                    Club Lead Passcode
                  </label>
                </div>
                <input
                  id="auth-lead-passcode"
                  type="text"
                  value={leadPasscode}
                  onChange={(e) => setLeadPasscode(e.target.value)}
                  placeholder="Lead Passcode"
                  className="w-full px-3 py-2 rounded-md bg-[#1D2C2C] border border-[#484A43]/70 text-xs font-mono text-[#EFE7E4] placeholder:text-[#806B64]/70 focus:outline-none focus:border-[#BC806A]"
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || processingPhoto}
          className="w-full mt-2 bg-[#BC806A] hover:bg-[#C9917D] disabled:opacity-70 text-[#162323] font-medium py-3 px-5 rounded-lg text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>
            {submitting
              ? mode === "signup"
                ? "Uploading Photo & Creating ID..."
                : "Signing In..."
              : mode === "signup"
                ? "Create Member Pass"
                : "Sign In as Club Lead"}
          </span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
