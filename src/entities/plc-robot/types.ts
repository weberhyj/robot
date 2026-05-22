import type { BinStatus, CameraStatus, GripperStatus, PlcStatus } from '@/entities/device/types'
import type { RobotStatus } from '@/entities/robot/types'

export interface PlcRobotStatusSnapshot {
  plc?: PlcStatus
  robot?: RobotStatus
  gripper?: GripperStatus
  camera?: CameraStatus
  bins?: BinStatus[]
}
