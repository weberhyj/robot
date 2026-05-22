export interface ResultRow {
  labelKey: string
  value: string
  tone?: 'green' | 'blue' | 'yellow' | 'red'
}

export interface FlowStep {
  key: string
  label: string
  value: string
  tone: 'green' | 'blue'
}
