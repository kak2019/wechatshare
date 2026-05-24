import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SESSION_DAYS = 30;

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: attempt } = hashPassword(password, salt);
  try {
    return timingSafeEqual(Buffer.from(attempt, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function sessionExpiresAt(): number {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().slice(0, 20);
}

export function isValidUsername(username: string): boolean {
  return /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/.test(username.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 4 && password.length <= 32;
}

export function userIdFromUsername(username: string): string {
  return createHash("sha256").update(normalizeUsername(username)).digest("hex").slice(0, 16);
}
