
import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "ht_admin";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  }

  return secret;
}

function sign(timestamp: string) {
  return createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
}

export function createAdminSession() {
  const timestamp = Date.now().toString();

  return `${timestamp}.${sign(timestamp)}`;
}

export function verifyAdminSession(token?: string) {
  try {
    if (!token) return false;

    const parts = token.split(".");

    if (parts.length !== 2) return false;

    const [timestamp, signature] = parts;

    if (!/^\d+$/.test(timestamp)) return false;

    const age = Date.now() - Number(timestamp);

    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > 7 * 24 * 60 * 60 * 1000
    ) {
      return false;
    }

    const expected = sign(timestamp);

    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");

    return (
      a.length === b.length &&
      timingSafeEqual(a, b)
    );
  } catch {
    return false;
  }
}
