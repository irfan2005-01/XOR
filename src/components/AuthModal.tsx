"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { X } from "lucide-react";

export function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    postAuthRedirect,
  } = useAuth();

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSuccess = () => {
    closeAuthModal();
    if (postAuthRedirect) {
      router.push(postAuthRedirect);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="absolute inset-0"
        onClick={closeAuthModal}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-xl bg-[#0D0E14]/80 backdrop-blur-md border border-white/15 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#FB923C] font-medium">
              XOR &middot; LAEC Bidar
            </p>
            <h2
              id="auth-modal-title"
              className="font-heading text-xl font-semibold text-white mt-1 tracking-tight"
            >
              {authModalMode === "signup"
                ? "Create Your Member Pass"
                : "Welcome Back to XOR"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
            className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#050507] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <AuthForm
          mode={authModalMode}
          onModeChange={setAuthModalMode}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
