"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { portalService } from "@/services/portalService";
import type { LogInInput, PublicMember, SignUpInput } from "@/types/portal";

export type AuthModalMode = "signup" | "login";

interface AuthContextValue {
  user: PublicMember | null;
  isHydrated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode, redirectTo?: string | null) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  postAuthRedirect: string | null;
  signUp: (input: SignUpInput) => Promise<PublicMember>;
  logIn: (input: LogInInput) => Promise<PublicMember>;
  upgradeToClubLead: (passcode: string) => Promise<PublicMember>;
  updateMemberAvatar: (file: File) => Promise<PublicMember>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicMember | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>("/dashboard");

  useEffect(() => {
    let cancelled = false;

    portalService
      .getCurrentSession()
      .then((member) => {
        if (!cancelled) {
          setUser(member);
          setIsHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openAuthModal = useCallback(
    (mode: AuthModalMode = "login", redirectTo: string | null = "/dashboard") => {
      setAuthModalMode(mode);
      setPostAuthRedirect(redirectTo);
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<PublicMember> => {
    const created = await portalService.signUpMember(input);
    setUser(created);
    return created;
  }, []);

  const logIn = useCallback(async (input: LogInInput): Promise<PublicMember> => {
    const loggedIn = await portalService.loginMember(input);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const upgradeToClubLead = useCallback(
    async (passcode: string): Promise<PublicMember> => {
      if (!user) {
        throw new Error("Please sign in first.");
      }
      const updated = await portalService.upgradeToClubLead(user.userId, passcode);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const updateMemberAvatar = useCallback(
    async (file: File): Promise<PublicMember> => {
      if (!user?.docId) {
        throw new Error("Please sign in first.");
      }
      const updated = await portalService.updateMemberAvatar(user.docId, file);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const logOut = useCallback(async () => {
    await portalService.logoutMember();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isHydrated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        postAuthRedirect,
        signUp,
        logIn,
        upgradeToClubLead,
        updateMemberAvatar,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return ctx;
}
