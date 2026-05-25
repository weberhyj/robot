export type BinCapacityAlertLevel = 'critical' | 'warning' | 'info'

export interface BinCapacitySetting {
  enabled: boolean
  threshold_percent: number
  alert_level: BinCapacityAlertLevel | string
}

export interface BinCapacitySettingUpdatePayload {
  enabled?: boolean
  threshold_percent?: number
  alert_level?: string
  operator?: string
  remark?: string
}

export interface BinCapacitySettingResetQuery {
  operator?: string
  remark?: string
}

export interface SettingHistoryQuery {
  page?: number
  page_size?: number
  setting_key?: string
}

export interface SettingHistoryRecord {
  id: number
  setting_key: string
  setting_label: string
  old_value: string
  new_value: string
  operator: string | null
  remark: string | null
  changed_at: string | null
}

export interface SettingHistoryListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  items: SettingHistoryRecord[]
}
