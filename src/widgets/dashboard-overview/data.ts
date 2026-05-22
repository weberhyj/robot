import type { AlarmSource, DeviceDetailSource, DeviceStatusSource, GraspRecordSource, MetricSource, TaskSource } from './types'
import binAImage from '@/assets/images/devices/bin-a.svg'
import binBImage from '@/assets/images/devices/bin-b.svg'
import binNgImage from '@/assets/images/devices/bin-ng.svg'
import cameraImage from '@/assets/images/devices/camera-photo.png'
import conveyorImage from '@/assets/images/devices/conveyor-photo.png'
import gripperImage from '@/assets/images/devices/gripper-photo.png'
import robotArmImage from '@/assets/images/devices/robot-arm-photo.png'

const unavailableValue = '--'
const offlineStatusKey = 'dashboard.status.offline'

const defaultRobotJointSources = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map(joint => ({
  joint,
  position: unavailableValue,
  torque: unavailableValue,
  current: unavailableValue,
  temperature: unavailableValue,
}))

const defaultRobotTcpPoseSources = [
  { key: 'x', labelKey: 'dashboard.deviceDetails.fields.tcpX', value: unavailableValue },
  { key: 'y', labelKey: 'dashboard.deviceDetails.fields.tcpY', value: unavailableValue },
  { key: 'z', labelKey: 'dashboard.deviceDetails.fields.tcpZ', value: unavailableValue },
  { key: 'rx', labelKey: 'dashboard.deviceDetails.fields.tcpRx', value: unavailableValue },
  { key: 'ry', labelKey: 'dashboard.deviceDetails.fields.tcpRy', value: unavailableValue },
  { key: 'rz', labelKey: 'dashboard.deviceDetails.fields.tcpRz', value: unavailableValue },
]

const defaultRobotTcpWrenchSources = [
  { key: 'mx', labelKey: 'dashboard.deviceDetails.fields.forceMx', value: unavailableValue },
  { key: 'my', labelKey: 'dashboard.deviceDetails.fields.forceMy', value: unavailableValue },
  { key: 'mz', labelKey: 'dashboard.deviceDetails.fields.forceMz', value: unavailableValue },
  { key: 'fx', labelKey: 'dashboard.deviceDetails.fields.forceFx', value: unavailableValue },
  { key: 'fy', labelKey: 'dashboard.deviceDetails.fields.forceFy', value: unavailableValue },
  { key: 'fz', labelKey: 'dashboard.deviceDetails.fields.forceFz', value: unavailableValue },
]

const defaultRobotTelemetrySources = {
  joints: defaultRobotJointSources,
  tcpPose: defaultRobotTcpPoseSources,
  tcpWrench: defaultRobotTcpWrenchSources,
}

const defaultConveyorTelemetrySources = {
  fields: [
    { key: 'max-load', labelKey: 'dashboard.deviceDetails.fields.maxLoad', value: unavailableValue },
    { key: 'running-speed', labelKey: 'dashboard.deviceDetails.fields.runningSpeed', value: unavailableValue },
  ],
}

export const metricSources: MetricSource[] = [
  {
    key: 'ok',
    labelKey: 'dashboard.metrics.ok.label',
    value: unavailableValue,
    unitKey: 'dashboard.units.items',
    hintKey: 'dashboard.metrics.ok.hint',
    tone: 'green',
    breakdown: [
      { key: 'ok-a', labelKey: 'dashboard.metrics.ok.breakdown.a', value: unavailableValue, tone: 'green' },
      { key: 'ok-b', labelKey: 'dashboard.metrics.ok.breakdown.b', value: unavailableValue, tone: 'blue' },
    ],
  },
  { key: 'ng', labelKey: 'dashboard.metrics.ng.label', value: unavailableValue, unitKey: 'dashboard.units.items', hintKey: 'dashboard.metrics.ng.hint', tone: 'red' },
  { key: 'accuracy', labelKey: 'dashboard.metrics.accuracy.label', value: unavailableValue, unitKey: 'dashboard.units.percent', hintKey: 'dashboard.metrics.accuracy.hint', tone: 'green' },
  { key: 'duration', labelKey: 'dashboard.metrics.duration.label', value: unavailableValue, unitKey: 'dashboard.units.ms', hintKey: 'dashboard.metrics.duration.hint', tone: 'blue' },
]

export const deviceSources: DeviceStatusSource[] = [
  {
    nameKey: 'dashboard.devices.robot.name',
    code: 'RB-01',
    image: robotArmImage,
    statusKey: offlineStatusKey,
    labelKey: 'dashboard.deviceFields.operationStatus',
    valueKey: offlineStatusKey,
    tone: 'gray',
  },
  {
    nameKey: 'dashboard.devices.camera.name',
    code: 'CAM-01',
    image: cameraImage,
    statusKey: offlineStatusKey,
    labelKey: 'dashboard.deviceFields.operationStatus',
    valueKey: offlineStatusKey,
    tone: 'gray',
  },
  {
    nameKey: 'dashboard.devices.conveyor.name',
    code: 'CV-01',
    image: conveyorImage,
    statusKey: offlineStatusKey,
    labelKey: 'dashboard.deviceFields.operationStatus',
    valueKey: offlineStatusKey,
    tone: 'gray',
  },
  {
    nameKey: 'dashboard.devices.gripper.name',
    code: 'GRP-01',
    image: gripperImage,
    statusKey: offlineStatusKey,
    labelKey: 'dashboard.deviceFields.operationStatus',
    valueKey: offlineStatusKey,
    tone: 'gray',
  },
  {
    nameKey: 'dashboard.devices.bins.name',
    code: 'BIN-SET-01',
    image: binAImage,
    statusKey: offlineStatusKey,
    labelKey: 'dashboard.deviceFields.quantity',
    valueKey: 'dashboard.devices.bins.value',
    tone: 'gray',
    details: [
      { key: 'bin-a', labelKey: 'dashboard.devices.binA.name', value: unavailableValue, tone: 'green' },
      { key: 'bin-b', labelKey: 'dashboard.devices.binB.name', value: unavailableValue, tone: 'blue' },
      { key: 'bin-ng', labelKey: 'dashboard.devices.binNg.name', value: unavailableValue, tone: 'red' },
    ],
  },
]

export const deviceDetailSources: DeviceDetailSource[] = [
  {
    code: 'RB-01',
    type: 'robot',
    nameKey: 'dashboard.devices.robot.name',
    image: robotArmImage,
    statusKey: offlineStatusKey,
    tone: 'gray',
    fields: [],
    ...defaultRobotTelemetrySources,
  },
  {
    code: 'CAM-01',
    type: 'camera',
    nameKey: 'dashboard.devices.camera.name',
    image: cameraImage,
    statusKey: offlineStatusKey,
    tone: 'gray',
    fields: [
      { key: 'frame-rate', labelKey: 'dashboard.deviceDetails.fields.frameRate', value: unavailableValue },
      { key: 'resolution', labelKey: 'dashboard.deviceDetails.fields.resolution', value: unavailableValue },
    ],
  },
  {
    code: 'CV-01',
    type: 'conveyor',
    nameKey: 'dashboard.devices.conveyor.name',
    image: conveyorImage,
    statusKey: offlineStatusKey,
    tone: 'gray',
    fields: [],
    ...defaultConveyorTelemetrySources,
  },
  {
    code: 'GRP-01',
    type: 'gripper',
    nameKey: 'dashboard.devices.gripper.name',
    image: gripperImage,
    statusKey: offlineStatusKey,
    tone: 'gray',
    fields: [
      { key: 'close-percent', labelKey: 'dashboard.deviceDetails.fields.closePercent', value: unavailableValue },
      { key: 'max-stroke', labelKey: 'dashboard.deviceDetails.fields.maxStroke', value: unavailableValue },
      { key: 'close-speed', labelKey: 'dashboard.deviceDetails.fields.closeSpeed', value: unavailableValue },
    ],
  },
  {
    code: 'BIN-SET-01',
    type: 'bins',
    nameKey: 'dashboard.devices.bins.name',
    image: binAImage,
    statusKey: offlineStatusKey,
    tone: 'gray',
    fields: [],
    bins: [
      { key: 'bin-a', nameKey: 'dashboard.devices.binA.name', image: binAImage, total: unavailableValue, loaded: unavailableValue, fillRate: 0, tone: 'green' },
      { key: 'bin-b', nameKey: 'dashboard.devices.binB.name', image: binBImage, total: unavailableValue, loaded: unavailableValue, fillRate: 0, tone: 'blue' },
      { key: 'bin-ng', nameKey: 'dashboard.devices.binNg.name', image: binNgImage, total: unavailableValue, loaded: unavailableValue, fillRate: 0, tone: 'red' },
    ],
  },
]

export const alarmSources: AlarmSource[] = [
  { key: 'camera-connection-timeout', alarmType: 'cameraConnectionTimeout', time: '14:36:28', levelKey: 'dashboard.alarmLevels.alarm', contentKey: 'alarmRecords.types.cameraConnectionTimeout', statusKey: 'dashboard.alarmStatus.unconfirmed', unconfirmed: true, tone: 'red' },
  { key: 'camera-recognition-error', alarmType: 'cameraRecognitionError', time: '14:28:16', levelKey: 'dashboard.alarmLevels.notice', contentKey: 'alarmRecords.types.cameraRecognitionError', statusKey: 'dashboard.alarmStatus.cleared', unconfirmed: false, tone: 'blue' },
  { key: 'robot-connection-timeout', alarmType: 'robotConnectionTimeout', time: '14:21:37', levelKey: 'dashboard.alarmLevels.alarm', contentKey: 'alarmRecords.types.robotConnectionTimeout', statusKey: 'dashboard.alarmStatus.unconfirmed', unconfirmed: true, tone: 'red' },
  { key: 'robot-error', alarmType: 'robotError', time: '14:09:58', levelKey: 'dashboard.alarmLevels.alarm', contentKey: 'alarmRecords.types.robotError', statusKey: 'dashboard.alarmStatus.confirmed', unconfirmed: false, tone: 'red' },
  { key: 'gripper-grasp-error', alarmType: 'gripperGraspError', time: '13:56:04', levelKey: 'dashboard.alarmLevels.warning', contentKey: 'alarmRecords.types.gripperGraspError', statusKey: 'dashboard.alarmStatus.confirmed', unconfirmed: false, tone: 'yellow' },
  { key: 'conveyor-error', alarmType: 'conveyorError', time: '13:42:31', levelKey: 'dashboard.alarmLevels.warning', contentKey: 'alarmRecords.types.conveyorError', statusKey: 'dashboard.alarmStatus.confirmed', unconfirmed: false, tone: 'yellow' },
  { key: 'plc-connection-timeout', alarmType: 'plcConnectionTimeout', time: '13:35:22', levelKey: 'dashboard.alarmLevels.alarm', contentKey: 'alarmRecords.types.plcConnectionTimeout', statusKey: 'dashboard.alarmStatus.confirmed', unconfirmed: false, tone: 'red' },
  { key: 'bin-capacity-warning', alarmType: 'binCapacityWarning', time: '13:23:31', levelKey: 'dashboard.alarmLevels.warning', contentKey: 'alarmRecords.types.binCapacityWarning', statusKey: 'dashboard.alarmStatus.cleared', unconfirmed: false, tone: 'yellow' },
  { key: 'bin-capacity-full', alarmType: 'binCapacityFull', time: '13:08:53', levelKey: 'dashboard.alarmLevels.warning', contentKey: 'alarmRecords.types.binCapacityFull', statusKey: 'dashboard.alarmStatus.confirmed', unconfirmed: false, tone: 'yellow' },
]

export const taskSources: TaskSource[] = []

export const graspRecordSources: GraspRecordSource[] = []
