import type { GraspRecordStatistics } from '@/entities/task/types'
import { describe, expect, it } from 'vitest'
import { buildGraspRecordStatisticsView } from './statistics'

describe('dashboard grasp record statistics mapping', () => {
  it('maps grasp record statistics into status panel display values', () => {
    const statistics: GraspRecordStatistics = {
      total_count: 3284,
      yesterday_compare_pct: 8.4,
      ok_count: 3255,
      ng_count: 29,
      bin_counts: [
        { target_bin: 'A bin', count: 1200 },
        { target_bin: 'B bin', count: 2055 },
        { target_bin: 'NG bin', count: 29 },
      ],
      accuracy: 99.12,
      avg_duration_ms: 142,
    }

    expect(buildGraspRecordStatisticsView(statistics)).toEqual({
      totalValue: '3,284',
      yesterdayCompareValue: '+8.4%',
      okValue: '3,255',
      ngValue: '29',
      accuracyValue: '99.1',
      avgDurationValue: '142',
      binAValue: '1,200',
      binBValue: '2,055',
    })
  })

  it('uses unavailable placeholders when statistics are not loaded', () => {
    expect(buildGraspRecordStatisticsView(undefined)).toEqual({
      totalValue: '--',
      yesterdayCompareValue: '--',
      okValue: '--',
      ngValue: '--',
      accuracyValue: '--',
      avgDurationValue: '--',
      binAValue: '--',
      binBValue: '--',
    })
  })
})
