import type { AlertLevel, AlertProcessStatus } from '@/entities/alarm/types'

export type AlarmRecordTagType = 'danger' | 'warning' | 'info' | 'success'

export interface AlarmRecordFilterOptionSource {
  value: string
  labelKey: string
}

export interface AlarmRecordRow {
  id: string
  alarmTime: string
  type: string
  level: string
  levelType: AlarmRecordTagType
  content: string
  status: string
  statusType: AlarmRecordTagType
  handler: string
  handledAt: string
}

export interface AlarmRecordFilters {
  type: string
  level: AlertLevel | ''
  status: AlertProcessStatus | ''
  timeRange: [string, string] | []
}
