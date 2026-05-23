import type { AlarmRecordFilterOptionSource } from './types'
import type { AlarmType as DashboardAlarmType } from '@/shared/types/alarm'

export const fallbackAlarmTypeOptions: AlarmRecordFilterOptionSource[] = [
  { value: 'camera_timeout', labelKey: 'alarmRecords.types.cameraConnectionTimeout' },
  { value: 'camera_detect_error', labelKey: 'alarmRecords.types.cameraRecognitionError' },
  { value: 'robot_timeout', labelKey: 'alarmRecords.types.robotConnectionTimeout' },
  { value: 'robot_error', labelKey: 'alarmRecords.types.robotError' },
  { value: 'gripper_error', labelKey: 'alarmRecords.types.gripperGraspError' },
  { value: 'conveyor_error', labelKey: 'alarmRecords.types.conveyorError' },
  { value: 'plc_timeout', labelKey: 'alarmRecords.types.plcConnectionTimeout' },
  { value: 'bin_capacity_warning', labelKey: 'alarmRecords.types.binCapacityWarning' },
  { value: 'bin_capacity_full', labelKey: 'alarmRecords.types.binCapacityFull' },
]

export const fallbackAlarmLevelOptions: AlarmRecordFilterOptionSource[] = [
  { value: 'critical', labelKey: 'alarmRecords.levels.critical' },
  { value: 'warning', labelKey: 'alarmRecords.levels.warning' },
  { value: 'info', labelKey: 'alarmRecords.levels.info' },
]

export const fallbackAlarmStatusOptions: AlarmRecordFilterOptionSource[] = [
  { value: 'pending', labelKey: 'alarmRecords.statuses.unhandled' },
  { value: 'processing', labelKey: 'alarmRecords.statuses.processing' },
  { value: 'completed', labelKey: 'alarmRecords.statuses.completed' },
]

export const dashboardAlarmTypeToApiAlertType = {
  cameraConnectionTimeout: 'camera_timeout',
  cameraRecognitionError: 'camera_detect_error',
  robotConnectionTimeout: 'robot_timeout',
  robotError: 'robot_error',
  gripperGraspError: 'gripper_error',
  conveyorError: 'conveyor_error',
  plcConnectionTimeout: 'plc_timeout',
  binCapacityWarning: 'bin_capacity_warning',
  binCapacityFull: 'bin_capacity_full',
} satisfies Record<DashboardAlarmType, string>
