export interface PlcStatus {
  number: string
  max_load: number
  running_speed: number
  system_starting: number
}

export interface GripperStatus {
  number: string
  enabled: boolean
  position: number
  max_stroke: number
  closing_speed: number
}

export type GripperControlAction = 'open' | 'close'

export interface GripperControlResponse {
  success: boolean
  action: GripperControlAction
  message: string
}

export interface CameraStatus {
  number: string
  online: boolean
  fps: number
  resolution: string
}

export interface CameraDetectionResult {
  success: boolean
  material: string | null
  confidence: number | null
  coord_x: number | null
  coord_y: number | null
  coord_z: number | null
  detect_time: string
  image_base64: string | null
}

export interface CameraStreamQuery {
  fps?: number
}

export interface BinStatus {
  id: number
  name: string
  bin_type: string
  material_type: string | null
  total_capacity: number
  current_load: number
  fill_rate: number
  length: number
  width: number
  height: number
  position_x: number
  position_y: number
  is_calibrated: boolean
  created_at: string | null
  updated_at: string | null
}

export interface BinEnumOption {
  value: string
  label: string
}

export interface BinEnumsResponse {
  bin_types: BinEnumOption[]
  material_types: BinEnumOption[]
}

export interface BinCreatePayload {
  name: string
  bin_type: string
  material_type?: string | null
  total_capacity?: number
  current_load?: number
  fill_rate?: number
  length?: number
  width?: number
  height?: number
  position_x?: number
  position_y?: number
  is_calibrated?: boolean
}

export type BinUpdatePayload = Partial<BinCreatePayload>
