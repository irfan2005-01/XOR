import { Account, Client, Databases, ID, Query, Storage } from "appwrite";

export const DEFAULT_APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
export const DEFAULT_APPWRITE_PROJECT_ID = "6afd778d001cf7bb0d79";
export const DEFAULT_APPWRITE_DATABASE_ID = "6afd790c00116999bec8";

/**
 * Sanitizes NEXT_PUBLIC_APPWRITE_ENDPOINT so Markdown links like
 * `[https://sgp.cloud.appwrite.io/v1](https://sgp.cloud.appwrite.io/v1)`,
 * angle-bracketed links, or quoted strings resolve to a plain valid URL.
 */
export function normalizeAppwriteEndpoint(rawEndpoint?: string | null): string {
  if (!rawEndpoint) {
    return DEFAULT_APPWRITE_ENDPOINT;
  }

  let cleaned = rawEndpoint.trim().replace(/^['"]|['"]$/g, "").trim();

  // Extract URL from Markdown link syntax: [text](https://...)
  const markdownMatch = cleaned.match(/^\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/i);
  if (markdownMatch?.[1]) {
    cleaned = markdownMatch[1].trim();
  }

  // Strip angle brackets if present: <https://...>
  const angleMatch = cleaned.match(/^<(https?:\/\/[^>\s]+)>$/i);
  if (angleMatch?.[1]) {
    cleaned = angleMatch[1].trim();
  }

  // Extract first http(s) URL if trailing markdown punctuation remains
  const urlMatch = cleaned.match(/https?:\/\/[^\s\]\)>"']+/i);
  if (urlMatch?.[0]) {
    cleaned = urlMatch[0];
  }

  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return cleaned.replace(/\/+$/, "");
    }
  } catch {
    // Fall back to default endpoint below
  }

  return DEFAULT_APPWRITE_ENDPOINT;
}

function normalizeAppwriteId(rawValue: string | undefined, fallback: string): string {
  const cleaned = (rawValue ?? "").trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned || fallback;
}

export const APPWRITE_ENDPOINT = normalizeAppwriteEndpoint(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
);

export const APPWRITE_PROJECT_ID = normalizeAppwriteId(
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  DEFAULT_APPWRITE_PROJECT_ID
);

export const APPWRITE_DATABASE_ID = normalizeAppwriteId(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  DEFAULT_APPWRITE_DATABASE_ID
);

export const MEMBERS_COLLECTION_ID = "members";
export const ANNOUNCEMENTS_COLLECTION_ID = "announcements";
export const AVATARS_BUCKET_ID = "avatars";

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };
