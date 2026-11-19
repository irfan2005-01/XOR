export const LAST_SEEN_BROADCAST_KEY = "xor_last_seen_broadcast";
export const BROADCAST_SEEN_EVENT = "xor:broadcast-seen";

/**
 * Counts how many broadcast timestamps are strictly newer than `lastSeenIso`.
 * If `lastSeenIso` is missing or invalid, all existing broadcasts count as unread.
 */
export function countUnreadBroadcasts(
  broadcastTimestamps: string[],
  lastSeenIso: string | null
): number {
  if (broadcastTimestamps.length === 0) {
    return 0;
  }

  if (!lastSeenIso) {
    return broadcastTimestamps.length;
  }

  const lastSeenMs = Date.parse(lastSeenIso);
  if (Number.isNaN(lastSeenMs)) {
    return broadcastTimestamps.length;
  }

  let unread = 0;
  for (const ts of broadcastTimestamps) {
    const ms = Date.parse(ts);
    if (!Number.isNaN(ms) && ms > lastSeenMs) {
      unread += 1;
    }
  }
  return unread;
}

export function getLastSeenBroadcast(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_SEEN_BROADCAST_KEY);
  } catch {
    return null;
  }
}

export function markBroadcastsSeen(latestCreatedAt?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const marker =
      latestCreatedAt && !Number.isNaN(Date.parse(latestCreatedAt))
        ? latestCreatedAt
        : new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_BROADCAST_KEY, marker);
    window.dispatchEvent(new CustomEvent(BROADCAST_SEEN_EVENT, { detail: marker }));
  } catch {
    // Ignore storage errors gracefully
  }
}
