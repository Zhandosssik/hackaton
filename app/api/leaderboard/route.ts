import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  findUserProgressRank,
  getLeaderboard,
} from "@/lib/progress-db";
import type { LeaderboardResponse } from "@/types/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitParam)
    ? Math.min(100, Math.max(1, Math.floor(limitParam)))
    : 50;

  const sessionUser = await getSessionUser();
  const { entries, totalPlayers } = getLeaderboard(
    limit,
    sessionUser?.id ?? null,
  );

  let currentUserEntry = entries.find((e) => e.isCurrentUser) ?? null;

  if (sessionUser && !currentUserEntry) {
    currentUserEntry = findUserProgressRank(sessionUser.id);
  }

  const payload: LeaderboardResponse & {
    currentUserEntry: typeof currentUserEntry;
  } = {
    entries,
    currentUserId: sessionUser?.id ?? null,
    totalPlayers,
    currentUserEntry,
  };

  return NextResponse.json(payload);
}
