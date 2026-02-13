"use client";

import { useSession, signOut } from "next-auth/react";
import type { User } from "@shared/models/auth";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user as User | undefined;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return {
    user,
    isLoading,
    isAuthenticated,
    logout: () => signOut({ callbackUrl: "/login" }),
    isLoggingOut: false, // next-auth doesn't expose this directly in the same way
  };
}
