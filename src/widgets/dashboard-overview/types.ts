import type { AlarmType } from '@/shared/types/alarm'

export interface MetricItem {
  key: string
  label: string
  value: string
  unit?: string
  hint: string
  tone: 'blue' | 'green' | 'red'
  breakdown?: MetricBreakdownItem[]
}

export interface MetricBreakdownItem {
  key: string
  label: string
  value: string
  tone: 'blue' | 'green' | 'red'
}

export interface DeviceStatusItem {
  name: string
  code: string
  image: string
  status: string
  label: string
  value: string
  tone: StatusTone
  warningGlow: boolean
  details?: DeviceStatusDetailItem[]
}

export interface DeviceStatusDetailItem {
  key: string
  label: string
  value: string
  tone: StatusTone
}

export type DeviceDetailType = 'robot' | 'camera' | 'conveyor' | 'gripper' | 'bins'

export interface DeviceDetailSource {
  code: string
  type: DeviceDetailType
  nameKey: string
  image: string
  statusKey: string
  tone: StatusTone
  fields: DeviceDetailFieldSource[]
  joints?: RobotJointSource[]
  tcpPose?: DeviceDetailFieldSource[]
  tcpWrench?: DeviceDetailFieldSource[]
  bins?: BinCapacitySource[]
}

export interface DeviceDetailFieldSource {
  key: string
  labelKey: string
  value: string
}

export interface RobotJointSource {
  joint: string
  position: string
  torque: string
  current: string
  temperature: string
}

export interface BinCapacitySource {
  key: string
  nameKey: string
  image: string
  total: string
  loaded: string
  fillRate: number
  tone: 'green' | 'blue' | 'red'
}

export interface AlarmRow {
  key: string
  alarmType: AlarmType
  time: string
  level: string
  content: string
  status: string
  unconfirmed: boolean
  tone: 'green' | 'blue' | 'yellow' | 'red'
}

export interface TaskRow {
  id: number
  taskNumber: string
  name: string
  start: string
  end: string
  total: string
  okNg: string
  rate: string
  status: string
  done: boolean
}

export interface GraspRecordRow {
  id: string
  time: string
  material: string
  coordinate: string
  confidence: string
  targetBin: string
  duration: string
  result: string
  success: boolean
}

export interface MetricSource {
  key: string
  labelKey: string
  value: string
  unitKey?: string
  hintKey: string
  tone: 'blue' | 'green' | 'red'
  breakdown?: MetricBreakdownSource[]
}

export interface MetricBreakdownSource {
  key: string
  labelKey: string
  value: string
  tone: 'blue' | 'green' | 'red'
}

export interface DeviceStatusSource {
  nameKey: string
  code: string
  image: string
  statusKey: string
  labelKey: string
  valueKey: string
  tone: StatusTone
  details?: DeviceStatusDetailSource[]
}

export interface DeviceStatusDetailSource {
  key: string
  labelKey: string
  valueKey?: string
  value?: string
  tone: StatusTone
}

type StatusTone = 'green' | 'blue' | 'yellow' | 'red' | 'gray'

export interface AlarmSource {
  key: string
  alarmType: AlarmType
  time: string
  levelKey: string
  contentKey: string
  statusKey: string
  unconfirmed: boolean
  tone: 'green' | 'blue' | 'yellow' | 'red'
}

export interface TaskSource {
  id: number
  taskNumber: string
  nameKey: string
  name?: string
  start: string
  end: string
  total: string
  okNg: string
  rate: string
  statusKey: string
  done: boolean
}

export interface GraspRecordSource {
  id: string
  taskId: string
  time: string
  materialKey: string
  x: string
  y: string
  theta: string
  confidence: string
  targetBinKey: string
  duration: string
  resultKey: string
  success: boolean
}
