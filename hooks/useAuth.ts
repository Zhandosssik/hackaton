"use client";

import { useCallback, useEffect, useState } from "react";
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
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
