export const MIN_SCALE = 0.3;
export const MAX_SCALE = 3;

export function clampScale(scale: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}
