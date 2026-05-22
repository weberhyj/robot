import { describe, expect, it } from 'vitest'
import { buildGripperCloseAmountMm } from './gripperControl'

describe('manual gripper control mapping', () => {
  it('calculates close amount millimeters from current position and max stroke millimeters', () => {
    expect(buildGripperCloseAmountMm({ positionMm: 24.8, maxStrokeMm: 40 })).toBe(15)
  })

  it('clamps close amount by max stroke when reading status', () => {
    expect(buildGripperCloseAmountMm({ positionMm: -5, maxStrokeMm: 40 })).toBe(40)
  })
})
