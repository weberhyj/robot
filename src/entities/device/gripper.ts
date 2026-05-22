interface BuildGripperCloseAmountOptions {
  positionMm: number
  maxStrokeMm: number
}

export function buildGripperCloseAmountMm(options: BuildGripperCloseAmountOptions): number {
  const maxStrokeMm = normalizeNonNegativeNumber(options.maxStrokeMm)

  if (maxStrokeMm <= 0)
    return 0

  const closeAmountMm = maxStrokeMm - normalizeNonNegativeNumber(options.positionMm)

  return Math.round(clampCloseAmount(closeAmountMm, maxStrokeMm))
}

function clampCloseAmount(value: number, maxStrokeMm: number): number {
  return Math.min(maxStrokeMm, Math.max(0, value))
}

function normalizeNonNegativeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}
