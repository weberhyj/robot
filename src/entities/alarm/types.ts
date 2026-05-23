export type AlertLevel = 'critical' | 'warning' | 'info'
export type AlertProcessStatus = 'pending' | 'processing' | 'completed'

export interface AlertOption {
  value: string
  label: string
}

export interface AlertEnumsResponse {
  alert_types: AlertOption[]
  alert_levels: AlertOption[]
  alert_statuses: AlertOption[]
}

export interface AlertListQuery {
  page?: number
  page_size?: number
  alert_type?: string
  alert_level?: string
  status?: string
  start_time?: string
  end_time?: string
}

export interface AlertRecord {
  id: number
  alert_type: string
  alert_type_label: string
  alert_level: AlertLevel | string
  alert_level_label: string
  alert_time: string
  content: string
  status: AlertProcessStatus | string
  status_label: string
  handler: string | null
  handle_time: string | null
}

export interface AlertListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  items: AlertRecord[]
}
