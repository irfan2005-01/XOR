/**
 * Computes normalized page scroll depth in [0, 1].
 */
export function calculateScrollDepth(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  const maxScrollable = scrollHeight - viewportHeight;
  if (maxScrollable <= 0) return 0;
  const raw = scrollY / maxScrollable;
  return Math.max(0, Math.min(1, raw));
}
