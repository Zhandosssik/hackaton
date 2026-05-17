"use client";

import { useCallback, useEffect, useState } from "react";
import { clearActiveUserId, setActiveUserId } from "@/lib/active-user";
import { copyGuestEducationToUser } from "@/lib/education-storage";
import { copyGuestProgressToUser } from "@/lib/game-progress";
import type { UserPublic } from "@/types/auth";

interface UseAuthResult {
  user: UserPublic | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const data = (await response.json()) as { user: UserPublic };
        setUser(data.user);
        setActiveUserId(data.user.id);
        copyGuestProgressToUser(data.user.id);
        copyGuestEducationToUser(data.user.id);
      } else {
        setUser(null);
        clearActiveUserId();
      }
    } catch {
      setUser(null);
      clearActiveUserId();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    refresh,
  };
}
