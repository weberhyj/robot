export interface StatusCard {
  title: string
  main: string
  sub: string
  state: string
  tone: 'green' | 'blue' | 'yellow'
}

export interface LogRow {
  time: string
  level: string
  module: string
  action: string
  result: string
  tone: 'green' | 'blue' | 'yellow'
}

export interface BinItem {
  id: string
  label: string
  count: number
  progress: number
  tone: 'blue' | 'green'
}

export type JointItem = [name: string, value: string]

export type GripperMetric = [label: string, value: string, progress: number]
