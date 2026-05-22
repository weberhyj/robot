import type { LoginStatusMetric } from './types'

export const loginStatusMetrics: LoginStatusMetric[] = [
  {
    labelKey: 'login.metrics.vision',
    icon: 'camera',
    placement: 'vision',
  },
  {
    labelKey: 'login.metrics.robot',
    icon: 'robot',
    placement: 'robot',
  },
  {
    labelKey: 'login.metrics.conveyor',
    icon: 'conveyor',
    placement: 'conveyor',
  },
  {
    labelKey: 'login.metrics.sorting',
    icon: 'sorting',
    placement: 'sorting',
  },
]
