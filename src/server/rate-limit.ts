import "server-only";

import { createHash } from "node:crypto";
import { createAdminSupabase } from "@/lib/supabase/server";

/**
 * Layered abuse protection for the contact form:
 *   1. Upstash Redis (if configured) — fixed window per IP
 *   2. Supabase table fallback — recent submissions per hashed IP
 *   3. Neither configured → allowed, with a logged warning
 * The visitor's raw IP is never stored; only a salted hash.
 */

const WINDOW_SECONDS = 15 * 60;
const MAX_PER_WINDOW = 5;

export function hashIp(ip: string): string {
  const salt = process.env.CONTACT_RATE_SALT || "sws-default-salt-rotate-me";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

async function upstashCheck(identifier: string): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const key = `sws:contact:${identifier}`;
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(WINDOW_SECONDS), "NX"],
      ]),
      cache: "no-store",
    });
    if (!response.ok) return null; // fail open: never block legitimate users
    const results = (await response.json()) as Array<{ result?: number | string }>;
    const count = Number(results?.[0]?.result ?? 0);
    return count <= MAX_PER_WINDOW;
  } catch {
    return null;
  }
}

async function databaseCheck(ipHash: string): Promise<boolean | null> {
  const admin = createAdminSupabase();
  if (!admin) return null;

  try {
    const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();
    const { count, error } = await admin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (error) return null;
    return (count ?? 0) < MAX_PER_WINDOW;
  } catch {
    return null;
  }
}

export async function allowContactSubmission(ip: string): Promise<boolean> {
  const ipHash = hashIp(ip);

  const viaUpstash = await upstashCheck(ipHash);
  if (viaUpstash !== null) return viaUpstash;

  const viaDatabase = await databaseCheck(ipHash);
  if (viaDatabase !== null) return viaDatabase;

  console.warn(
    "[rate-limit] no rate-limit backend configured (Upstash or Supabase); allowing submission",
  );
  return true;
}
