export interface LoginStatusMetric {
  labelKey: string
  icon: 'camera' | 'conveyor' | 'robot' | 'sorting'
  placement: 'vision' | 'robot' | 'conveyor' | 'sorting'
}

export interface LoginFormModel {
  account: string
  password: string
  remember: boolean
}
