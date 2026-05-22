import type { AlarmType } from '@/shared/types/alarm'

export type { AlarmType } from '@/shared/types/alarm'

export type AlarmLevel = 'critical' | 'warning' | 'info'

export type AlarmProcessStatus = 'unhandled' | 'processing' | 'completed'

export interface AlarmRecordSource {
  id: string
  alarmTime: string
  type: AlarmType
  level: AlarmLevel
  contentKey: string
  status: AlarmProcessStatus
  handler: string
  handledAt: string
}

export interface AlarmRecordRow {
  id: string
  alarmTime: string
  type: string
  level: string
  levelType: 'danger' | 'warning' | 'info'
  content: string
  status: string
  statusType: 'danger' | 'warning' | 'success'
  handler: string
  handledAt: string
}

export interface AlarmRecordFilters {
  type: AlarmType | ''
  level: AlarmLevel | ''
  status: AlarmProcessStatus | ''
  timeRange: [string, string] | []
}
