import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  findStoredUserByEmail,
  findStoredUserById,
  insertStoredUser,
  isStoredEmailTaken,
  type StoredUser,
} from "@/lib/db";
import type { User, UserPublic } from "@/types/auth";

export const SESSION_COOKIE = "pq_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
const BCRYPT_ROUNDS = 10;

function storedToUser(row: StoredUser): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function findUserByEmail(
  email: string,
): (User & { passwordHash: string }) | null {
  const row = findStoredUserByEmail(email);
  if (!row) return null;

  const user = storedToUser(row);
  return { ...user, passwordHash: row.password_hash };
}

export function findUserById(id: string): User | null {
  const row = findStoredUserById(id);
  return row ? storedToUser(row) : null;
}

export function createUser(input: {
  email: string;
  passwordHash: string;
  displayName: string;
}): User {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const row = insertStoredUser({
    id,
    email: input.email,
    password_hash: input.passwordHash,
    display_name: input.displayName,
    created_at: createdAt,
  });

  return storedToUser(row);
}

export function isEmailTaken(email: string): boolean {
  return isStoredEmailTaken(email);
}

export async function getSessionUser(): Promise<UserPublic | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const user = findUserById(userId);
  return user ? toPublicUser(user) : null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
