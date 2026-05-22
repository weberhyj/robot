import { describe, expect, it } from 'vitest'
import { buildGripperClosePercent, buildGripperClosePositionMm } from './gripperControl'

describe('manual gripper control mapping', () => {
  it('converts close percent and max stroke centimeters to API target position millimeters', () => {
    expect(buildGripperClosePositionMm({ closePercent: 20, maxStrokeCm: 10 })).toBe(80)
  })

  it('rounds the target position to one decimal millimeter', () => {
    expect(buildGripperClosePositionMm({ closePercent: 33.33, maxStrokeCm: 10 })).toBe(66.7)
  })

  it('calculates close percent from current position millimeters and max stroke centimeters', () => {
    expect(buildGripperClosePercent({ positionMm: 24.8, maxStrokeCm: 4 })).toBe(38)
  })
})
