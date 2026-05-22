export interface SummaryItem {
  label: string
  value: string
  hint: string
  tone: 'blue' | 'green' | 'red' | 'gray'
}

export interface DeviceItem {
  name: string
  model: string
  serial: string
  status: 'green' | 'blue' | 'red'
  mode: string
  runtime: string
  health: number
  firmware: string
  badge?: string
}

export interface AlarmItem {
  title: string
  code: string
  time: string
  status: string
  tone: 'red' | 'yellow' | 'blue'
}
