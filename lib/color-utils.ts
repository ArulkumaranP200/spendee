/**
 * Appends an alpha channel to a `#rrggbb` hex color, e.g. withAlpha('#7c3aed', 0.15) -> '#7c3aed26'.
 * Used for light-tint selected/hover states instead of solid color fills.
 */
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const alphaHex = clamped.toString(16).padStart(2, '0');
  return `${hex}${alphaHex}`;
}
