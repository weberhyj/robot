export interface RobotTcpPose {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
}

export interface RobotTcpRaw {
  fx: number
  fy: number
  fz: number
  mx: number
  my: number
  mz: number
}

export interface RobotJointTelemetry {
  name: string
  q: number
  tau: number
  motor_current: number | null
  motor_tem: number | null
  mcu_tem: number | null
}

export interface RobotStatus {
  number?: string
  status?: number
  tcp_pose: RobotTcpPose
  tcp_raw: RobotTcpRaw
  arthrosis_list: RobotJointTelemetry[]
}
