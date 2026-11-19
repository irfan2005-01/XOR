"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScrollProgress />
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
