interface BuildGripperClosePositionOptions {
  closePercent: number
  maxStrokeCm: number
}

interface BuildGripperClosePercentOptions {
  positionMm: number
  maxStrokeCm: number
}

export function buildGripperClosePositionMm(options: BuildGripperClosePositionOptions): number {
  const maxStrokeMm = options.maxStrokeCm * 10
  const positionMm = maxStrokeMm * (1 - clampPercent(options.closePercent) / 100)

  return roundToOneDecimal(positionMm)
}

export function buildGripperClosePercent(options: BuildGripperClosePercentOptions): number {
  const maxStrokeMm = options.maxStrokeCm * 10

  if (maxStrokeMm <= 0)
    return 0

  const closePercent = (maxStrokeMm - options.positionMm) / maxStrokeMm * 100

  return roundToOneDecimal(clampPercent(closePercent))
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
