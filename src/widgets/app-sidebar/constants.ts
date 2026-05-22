export const controlModes = ['automatic', 'manual'] as const

export type QuickControlMode = typeof controlModes[number]
