import type { GraspRecordStatistics } from '@/entities/task/types'

const unavailableValue = '--'

export interface GraspRecordStatisticsView {
  totalValue: string
  yesterdayCompareValue: string
  okValue: string
  ngValue: string
  accuracyValue: string
  avgDurationValue: string
  binAValue: string
  binBValue: string
}

export function buildGraspRecordStatisticsView(statistics: GraspRecordStatistics | undefined): GraspRecordStatisticsView {
  if (!statistics) {
    return {
      totalValue: unavailableValue,
      yesterdayCompareValue: unavailableValue,
      okValue: unavailableValue,
      ngValue: unavailableValue,
      accuracyValue: unavailableValue,
      avgDurationValue: unavailableValue,
      binAValue: unavailableValue,
      binBValue: unavailableValue,
    }
  }

  return {
    totalValue: formatInteger(statistics.total_count),
    yesterdayCompareValue: formatSignedPercent(statistics.yesterday_compare_pct),
    okValue: formatInteger(statistics.ok_count),
    ngValue: formatInteger(statistics.ng_count),
    accuracyValue: formatNumber(statistics.accuracy, 1),
    avgDurationValue: formatNumber(statistics.avg_duration_ms, 1),
    binAValue: formatBinCount(statistics, 'A'),
    binBValue: formatBinCount(statistics, 'B'),
  }
}

function formatBinCount(statistics: GraspRecordStatistics, binMarker: 'A' | 'B'): string {
  const binCount = statistics.bin_counts.find(item => item.target_bin.trim().toUpperCase().startsWith(binMarker))

  return binCount ? formatInteger(binCount.count) : unavailableValue
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : maximumFractionDigits,
  }).format(value)
}

function formatSignedPercent(value: number): string {
  const formattedValue = formatNumber(value, 1)

  return value > 0 ? `+${formattedValue}%` : `${formattedValue}%`
}
