import type { DeviceDetailFieldSource, DeviceDetailSource, DeviceDetailType, DeviceStatusSource, RobotJointSource } from './types'
import type { BinStatus, CameraStatus, GripperStatus } from '@/entities/device/types'
import type { PlcRobotStatusSnapshot } from '@/entities/plc-robot/types'
import type { RobotJointTelemetry, RobotStatus, RobotTcpPose, RobotTcpRaw } from '@/entities/robot/types'
import { buildGripperClosePercent } from '@/entities/device/gripper'
import { resolveConveyorStatus } from '@/entities/device/status'

const runningStatusKey = 'dashboard.status.running'
const onlineStatusKey = 'dashboard.status.online'
const enabledStatusKey = 'dashboard.status.enabled'
const errorStatusKey = 'dashboard.status.error'
const offlineStatusKey = 'dashboard.status.offline'
const conveyorDeviceCode = 'CV-01'
const robotDeviceCode = 'RB-01'
const cameraDeviceCode = 'CAM-01'
const gripperDeviceCode = 'GRP-01'
const binsDeviceCode = 'BIN-SET-01'
const apiBackedDetailTypesByCode: Record<string, DeviceDetailType> = {
  [conveyorDeviceCode]: 'conveyor',
  [robotDeviceCode]: 'robot',
  [cameraDeviceCode]: 'camera',
  [gripperDeviceCode]: 'gripper',
  [binsDeviceCode]: 'bins',
}

interface RobotStatusView {
  statusKey: string
  tone: DeviceStatusSource['tone']
}

interface RuntimeStatusView {
  statusKey: string
  tone: DeviceStatusSource['tone']
}

export function mergeLiveDeviceStatusSources(
  sources: DeviceStatusSource[],
  snapshot: PlcRobotStatusSnapshot,
): DeviceStatusSource[] {
  return sources.map((device) => {
    if (device.code === conveyorDeviceCode) {
      const status = resolveConveyorStatus(snapshot.plc)

      return {
        ...device,
        statusKey: status.statusKey,
        valueKey: status.statusKey,
        tone: status.tone,
      }
    }

    if (device.code === robotDeviceCode) {
      const status = getRobotStatus(snapshot.robot)

      return {
        ...device,
        statusKey: status.statusKey,
        valueKey: status.statusKey,
        tone: status.tone,
      }
    }

    if (device.code === cameraDeviceCode) {
      const status = getCameraStatus(snapshot.camera)

      return {
        ...device,
        code: snapshot.camera?.number ?? device.code,
        statusKey: status.statusKey,
        valueKey: status.statusKey,
        tone: status.tone,
      }
    }

    if (device.code === gripperDeviceCode) {
      const status = getGripperStatus(snapshot.gripper)

      return {
        ...device,
        code: snapshot.gripper?.number ?? device.code,
        statusKey: status.statusKey,
        valueKey: status.statusKey,
        tone: status.tone,
      }
    }

    if (device.code === binsDeviceCode) {
      return {
        ...device,
        statusKey: snapshot.bins ? device.statusKey : offlineStatusKey,
        valueKey: snapshot.bins ? device.valueKey : offlineStatusKey,
        tone: snapshot.bins ? device.tone : 'gray',
        details: snapshot.bins ? buildBinStatusDetails(snapshot.bins, device.details) : resetBinStatusDetails(device.details),
      }
    }

    return device
  })
}

export function mergeLiveDeviceDetails(
  sources: DeviceDetailSource[],
  snapshot: PlcRobotStatusSnapshot,
): DeviceDetailSource[] {
  return sources.map((device) => {
    if (snapshot.plc && device.type === 'conveyor') {
      const status = resolveConveyorStatus(snapshot.plc)

      return {
        ...device,
        code: snapshot.plc.number,
        statusKey: status.statusKey,
        tone: status.tone,
        fields: [
          {
            key: 'max-load',
            labelKey: 'dashboard.deviceDetails.fields.maxLoad',
            value: formatMeasurement(snapshot.plc.max_load, 'kg', 2),
          },
          {
            key: 'running-speed',
            labelKey: 'dashboard.deviceDetails.fields.runningSpeed',
            value: formatMeasurement(snapshot.plc.running_speed, 'm/s', 2),
          },
        ],
      }
    }

    if (snapshot.robot && device.code === 'RB-01') {
      const status = getRobotStatus(snapshot.robot)

      return {
        ...device,
        code: snapshot.robot.number ?? device.code,
        statusKey: status.statusKey,
        tone: status.tone,
        joints: snapshot.robot.arthrosis_list.map(formatRobotJoint),
        tcpPose: buildTcpPoseFields(snapshot.robot.tcp_pose),
        tcpWrench: buildTcpWrenchFields(snapshot.robot.tcp_raw),
      }
    }

    if (snapshot.camera && device.type === 'camera') {
      const status = getCameraStatus(snapshot.camera)

      return {
        ...device,
        code: snapshot.camera.number,
        statusKey: status.statusKey,
        tone: status.tone,
        fields: [
          {
            key: 'frame-rate',
            labelKey: 'dashboard.deviceDetails.fields.frameRate',
            value: formatMeasurement(snapshot.camera.fps, 'fps', 0),
          },
          {
            key: 'resolution',
            labelKey: 'dashboard.deviceDetails.fields.resolution',
            value: snapshot.camera.resolution,
          },
        ],
      }
    }

    if (snapshot.gripper && device.type === 'gripper') {
      const status = getGripperStatus(snapshot.gripper)

      return {
        ...device,
        code: snapshot.gripper.number,
        statusKey: status.statusKey,
        tone: status.tone,
        fields: [
          {
            key: 'close-percent',
            labelKey: 'dashboard.deviceDetails.fields.closePercent',
            value: `${formatNumber(buildGripperClosePercent({
              positionMm: snapshot.gripper.position,
              maxStrokeCm: snapshot.gripper.max_stroke,
            }), 1)}%`,
          },
          {
            key: 'max-stroke',
            labelKey: 'dashboard.deviceDetails.fields.maxStroke',
            value: formatMeasurement(snapshot.gripper.max_stroke, 'cm', 1),
          },
          {
            key: 'close-speed',
            labelKey: 'dashboard.deviceDetails.fields.closeSpeed',
            value: formatMeasurement(snapshot.gripper.closing_speed, 'mm/s', 1),
          },
        ],
      }
    }

    if (snapshot.bins && device.type === 'bins') {
      return {
        ...device,
        bins: buildBinCapacitySources(snapshot.bins, device.bins),
      }
    }

    return device
  })
}

export function resetDeviceDetailSource(
  sources: DeviceDetailSource[],
  defaultSources: DeviceDetailSource[],
  deviceCode: string,
): DeviceDetailSource[] {
  const defaultSource = findDeviceDetailSource(defaultSources, deviceCode)

  if (!defaultSource)
    return sources

  return sources.map(device => isDeviceDetailSourceTarget(device, deviceCode) ? defaultSource : device)
}

function findDeviceDetailSource(sources: DeviceDetailSource[], deviceCode: string): DeviceDetailSource | undefined {
  const targetType = apiBackedDetailTypesByCode[deviceCode]

  return sources.find(device => device.code === deviceCode || (targetType && device.type === targetType))
}

function isDeviceDetailSourceTarget(device: DeviceDetailSource, deviceCode: string): boolean {
  const targetType = apiBackedDetailTypesByCode[deviceCode]

  return device.code === deviceCode || (targetType !== undefined && device.type === targetType)
}

function getRobotStatus(robotStatus?: RobotStatus): RobotStatusView {
  if (!robotStatus) {
    return {
      statusKey: offlineStatusKey,
      tone: 'gray',
    }
  }

  if (robotStatus.status === 0) {
    return {
      statusKey: offlineStatusKey,
      tone: 'gray',
    }
  }

  return {
    statusKey: runningStatusKey,
    tone: 'green',
  }
}

function getCameraStatus(cameraStatus?: CameraStatus): RuntimeStatusView {
  if (!cameraStatus) {
    return {
      statusKey: offlineStatusKey,
      tone: 'gray',
    }
  }

  return cameraStatus.online
    ? { statusKey: onlineStatusKey, tone: 'blue' }
    : { statusKey: offlineStatusKey, tone: 'gray' }
}

function getGripperStatus(gripperStatus?: GripperStatus): RuntimeStatusView {
  if (!gripperStatus) {
    return {
      statusKey: offlineStatusKey,
      tone: 'gray',
    }
  }

  return gripperStatus.enabled
    ? { statusKey: enabledStatusKey, tone: 'blue' }
    : { statusKey: errorStatusKey, tone: 'red' }
}

function buildTcpPoseFields(tcpPose: RobotTcpPose): DeviceDetailFieldSource[] {
  return [
    { key: 'x', labelKey: 'dashboard.deviceDetails.fields.tcpX', value: formatNumber(tcpPose.x, 2) },
    { key: 'y', labelKey: 'dashboard.deviceDetails.fields.tcpY', value: formatNumber(tcpPose.y, 2) },
    { key: 'z', labelKey: 'dashboard.deviceDetails.fields.tcpZ', value: formatNumber(tcpPose.z, 2) },
    { key: 'rx', labelKey: 'dashboard.deviceDetails.fields.tcpRx', value: formatNumber(tcpPose.rx, 2) },
    { key: 'ry', labelKey: 'dashboard.deviceDetails.fields.tcpRy', value: formatNumber(tcpPose.ry, 2) },
    { key: 'rz', labelKey: 'dashboard.deviceDetails.fields.tcpRz', value: formatNumber(tcpPose.rz, 2) },
  ]
}

function buildTcpWrenchFields(tcpRaw: RobotTcpRaw): DeviceDetailFieldSource[] {
  return [
    { key: 'mx', labelKey: 'dashboard.deviceDetails.fields.forceMx', value: formatNumber(tcpRaw.mx, 2) },
    { key: 'my', labelKey: 'dashboard.deviceDetails.fields.forceMy', value: formatNumber(tcpRaw.my, 2) },
    { key: 'mz', labelKey: 'dashboard.deviceDetails.fields.forceMz', value: formatNumber(tcpRaw.mz, 2) },
    { key: 'fx', labelKey: 'dashboard.deviceDetails.fields.forceFx', value: formatNumber(tcpRaw.fx, 2) },
    { key: 'fy', labelKey: 'dashboard.deviceDetails.fields.forceFy', value: formatNumber(tcpRaw.fy, 2) },
    { key: 'fz', labelKey: 'dashboard.deviceDetails.fields.forceFz', value: formatNumber(tcpRaw.fz, 2) },
  ]
}

function formatRobotJoint(joint: RobotJointTelemetry): RobotJointSource {
  return {
    joint: joint.name,
    position: formatMeasurement(joint.q, 'deg', 2),
    torque: formatMeasurement(joint.tau, 'Nm', 2),
    current: formatMeasurement(joint.motor_current, 'A', 2),
    temperature: formatJointTemperature(joint.motor_tem, joint.mcu_tem),
  }
}

function buildBinStatusDetails(
  bins: BinStatus[],
  existingDetails: DeviceStatusSource['details'] = [],
): NonNullable<DeviceStatusSource['details']> {
  return sortBins(bins).map((bin) => {
    const key = getBinKey(bin)
    const existingDetail = existingDetails.find(detail => detail.key === key)

    return {
      key,
      labelKey: getBinNameKey(bin),
      value: `${formatNumber(bin.fill_rate, 1)}%`,
      tone: getBinTone(bin),
      ...(existingDetail?.valueKey ? { valueKey: existingDetail.valueKey } : {}),
    }
  })
}

function resetBinStatusDetails(
  existingDetails: DeviceStatusSource['details'] = [],
): NonNullable<DeviceStatusSource['details']> {
  return existingDetails.map(detail => ({
    ...detail,
    value: '--',
  }))
}

function buildBinCapacitySources(
  bins: BinStatus[],
  existingBins: DeviceDetailSource['bins'] = [],
): NonNullable<DeviceDetailSource['bins']> {
  return sortBins(bins).map((bin) => {
    const key = getBinKey(bin)
    const existingBin = existingBins.find(item => item.key === key)

    return {
      key,
      nameKey: getBinNameKey(bin),
      image: existingBin?.image ?? '',
      total: formatInteger(bin.total_capacity),
      loaded: formatInteger(bin.current_load),
      fillRate: clampPercent(bin.fill_rate),
      tone: getBinTone(bin),
    }
  })
}

function sortBins(bins: BinStatus[]): BinStatus[] {
  return [...bins].sort((left, right) => getBinSortOrder(left) - getBinSortOrder(right))
}

function getBinSortOrder(bin: BinStatus): number {
  const key = getBinKey(bin)
  const orderMap: Record<string, number> = {
    'bin-a': 1,
    'bin-b': 2,
    'bin-ng': 3,
  }

  return orderMap[key] ?? bin.id
}

function getBinKey(bin: BinStatus): string {
  const name = bin.name.toUpperCase()

  if (name.includes('NG'))
    return 'bin-ng'

  if (name.includes('B'))
    return 'bin-b'

  return 'bin-a'
}

function getBinNameKey(bin: BinStatus): string {
  const key = getBinKey(bin)
  const nameKeyMap: Record<string, string> = {
    'bin-a': 'dashboard.devices.binA.name',
    'bin-b': 'dashboard.devices.binB.name',
    'bin-ng': 'dashboard.devices.binNg.name',
  }

  return nameKeyMap[key]
}

function getBinTone(bin: BinStatus): 'green' | 'blue' | 'red' {
  const key = getBinKey(bin)

  if (key === 'bin-ng')
    return 'red'

  return key === 'bin-b' ? 'blue' : 'green'
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Number(value.toFixed(1))))
}

function formatJointTemperature(motorTemperature: number | null, mcuTemperature: number | null): string {
  const motorTemperatureText = formatNullableNumber(motorTemperature, 1)
  const mcuTemperatureText = formatNullableNumber(mcuTemperature, 1)

  if (motorTemperatureText === '--' && mcuTemperatureText === '--') {
    return '--'
  }

  return `${motorTemperatureText} / ${mcuTemperatureText} C`
}

function formatMeasurement(value: number | null, unit: string, fractionDigits: number): string {
  if (value === null) {
    return '--'
  }

  return `${formatNumber(value, fractionDigits)} ${unit}`
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNullableNumber(value: number | null, fractionDigits: number): string {
  if (value === null) {
    return '--'
  }

  return formatNumber(value, fractionDigits)
}

function formatNumber(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)
}
