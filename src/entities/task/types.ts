export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'
export type GraspRecordResult = 'success' | 'failed'

export interface TaskListQuery {
  page?: number
  page_size?: number
  status?: TaskStatus
  task_name?: string
}

export interface TaskListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  items: SortingTask[]
}

export interface SortingTask {
  id: number
  task_number: string
  task_name: string
  start_time: string | null
  end_time: string | null
  total_count: number
  ok_count: number
  ng_count: number
  yield_rate: number
  status: TaskStatus
  created_at: string | null
  updated_at: string | null
}

export interface GraspRecordQuery {
  page?: number
  page_size?: number
  result?: GraspRecordResult
  material?: string
}

export interface GraspRecordListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  items: GraspRecord[]
}

export interface GraspRecordBinCount {
  target_bin: string
  count: number
}

export interface GraspRecordStatistics {
  total_count: number
  yesterday_compare_pct: number
  ok_count: number
  ng_count: number
  bin_counts: GraspRecordBinCount[]
  accuracy: number
  avg_duration_ms: number
}

export interface GraspRecord {
  id: number
  task_id: number
  time: string | null
  material: string
  coord_x: number
  coord_y: number
  coord_z: number
  confidence: number
  target_bin: string
  duration: number
  result: GraspRecordResult
  created_at: string | null
}
