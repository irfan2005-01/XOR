const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * Generates a unique formatted member ID (`XOR-26-XXXX`) with 4 numeric digits,
 * avoiding collisions with any existing member IDs.
 */
export function generateUniqueMemberId(
  existingIds: string[],
  randomFn: () => number = Math.random
): string {
  const existingSet = new Set(existingIds.map((id) => id.trim().toUpperCase()));

  for (let attempt = 0; attempt < 500; attempt++) {
    const num = Math.floor(randomFn() * 9000) + 1000; // 1000..9999
    const candidate = `XOR-26-${num}`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Deterministic fallback sweep across 4-digit space
  for (let code = 1000; code <= 9999; code++) {
    const candidate = `XOR-26-${code}`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate unique XOR member ID.");
}

/**
 * Formats an ISO date string into concise uppercase pass notation (e.g., "18 NOV 2026").
 */
export function formatIssueDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "18 NOV 2026";
  }
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = MONTH_NAMES[parsed.getUTCMonth()] ?? "NOV";
  const year = parsed.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Generates a deterministic array of bar widths (1..3) for rendering a clean
 * verification barcode directly from the member's XOR-26-XXXX ID.
 */
export function computePassBarcodeBars(memberId: string): number[] {
  const normalized = memberId.trim().toUpperCase() || "XOR-26-0000";
  const bars: number[] = [];

  // Guard bars on left
  bars.push(2, 1, 2);

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    bars.push(((code >> 0) & 1) + 1);
    bars.push(((code >> 1) & 1) + 1);
    bars.push(((code >> 2) & 2) === 2 ? 3 : 1);
  }

  // Guard bars on right
  bars.push(2, 1, 2);
  return bars;
}
