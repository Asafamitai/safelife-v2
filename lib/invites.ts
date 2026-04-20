/**
 * Invite encoding — purely client-side for the demo.
 *
 * An invite is a base64url-encoded JSON payload: `{ memberId, role, v }`.
 * No crypto, no server. Two browsers coordinate via the URL query
 * `?invite=XYZ`: generating on one side produces a URL the other side
 * can open to be recognized as the inviter's counterpart persona.
 *
 * The `v` field pins the schema so older demo links break cleanly
 * instead of silently misparsing.
 */

import type { MemberRole } from "./store/members";

const VERSION = 1;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type InviteRole = "parent" | "family";

export interface InvitePayload {
  memberId: string;
  role: InviteRole;
  memberName: string;
  v: number;
}

function base64urlEncode(s: string): string {
  // btoa handles Latin-1; JSON we produce is ASCII-safe.
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export function generateInviteCode(payload: Omit<InvitePayload, "v">): string {
  return base64urlEncode(JSON.stringify({ ...payload, v: VERSION }));
}

export function parseInviteCode(code: string): InvitePayload | null {
  try {
    const raw = base64urlDecode(code);
    const obj = JSON.parse(raw) as InvitePayload;
    if (!obj || typeof obj !== "object") return null;
    if (obj.v !== VERSION) return null;
    if (typeof obj.memberId !== "string") return null;
    if (typeof obj.memberName !== "string") return null;
    if (obj.role !== "parent" && obj.role !== "family") return null;
    return obj;
  } catch {
    return null;
  }
}

export function inviteUrl(code: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${BASE_PATH}/onboarding/connect/?invite=${code}`;
}

/**
 * Map a `MemberRole` to the persona role the invite represents.
 * "Parent" → parent persona; anything else → family persona.
 */
export function memberRoleToInviteRole(role: MemberRole): InviteRole {
  return role === "Parent" ? "parent" : "family";
}
