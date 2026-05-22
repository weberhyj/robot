import type { DeviceDetailSource, DeviceStatusSource } from './types'
import type { PlcRobotStatusSnapshot } from '@/entities/plc-robot/types'
import { describe, expect, it } from 'vitest'
import { mergeLiveDeviceDetails, mergeLiveDeviceStatusSources, resetDeviceDetailSource } from './liveStatus'

const deviceDetailsFixture: DeviceDetailSource[] = [
  {
    code: 'RB-01',
    type: 'robot',
    nameKey: 'dashboard.devices.robot.name',
    image: 'robot.png',
    statusKey: 'dashboard.status.running',
    tone: 'green',
    fields: [],
  },
  {
    code: 'CV-01',
    type: 'conveyor',
    nameKey: 'dashboard.devices.conveyor.name',
    image: 'conveyor.png',
    statusKey: 'dashboard.status.error',
    tone: 'red',
    fields: [],
  },
]

describe('dashboard device detail mapping', () => {
  it('maps API snapshots into robot and conveyor status cards', () => {
    const statusSources: DeviceStatusSource[] = [
      {
        nameKey: 'dashboard.devices.robot.name',
        code: 'RB-01',
        image: 'robot.png',
        statusKey: 'dashboard.status.offline',
        labelKey: 'dashboard.deviceFields.operationStatus',
        valueKey: 'dashboard.status.offline',
        tone: 'gray',
      },
      {
        nameKey: 'dashboard.devices.conveyor.name',
        code: 'CV-01',
        image: 'conveyor.png',
        statusKey: 'dashboard.status.offline',
        labelKey: 'dashboard.deviceFields.operationStatus',
        valueKey: 'dashboard.status.offline',
        tone: 'gray',
      },
    ]

    const mappedSources = mergeLiveDeviceStatusSources(statusSources, {
      plc: {
        number: 'CV-01',
        max_load: 1,
        running_speed: 0.42,
        system_starting: 1,
      },
      robot: {
        tcp_pose: { x: 1, y: 2, z: 3, rx: 4, ry: 5, rz: 6 },
        tcp_raw: { fx: 1, fy: 2, fz: 3, mx: 4, my: 5, mz: 6 },
        arthrosis_list: [],
      },
    })

    expect(mappedSources.map(source => [source.code, source.statusKey, source.valueKey, source.tone])).toEqual([
      ['RB-01', 'dashboard.status.running', 'dashboard.status.running', 'green'],
      ['CV-01', 'dashboard.status.running', 'dashboard.status.running', 'green'],
    ])
  })

  it('keeps API-backed status cards offline when status APIs fail', () => {
    const statusSources: DeviceStatusSource[] = [
      {
        nameKey: 'dashboard.devices.robot.name',
        code: 'RB-01',
        image: 'robot.png',
        statusKey: 'dashboard.status.running',
        labelKey: 'dashboard.deviceFields.operationStatus',
        valueKey: 'dashboard.status.running',
        tone: 'green',
      },
      {
        nameKey: 'dashboard.devices.conveyor.name',
        code: 'CV-01',
        image: 'conveyor.png',
        statusKey: 'dashboard.status.running',
        labelKey: 'dashboard.deviceFields.operationStatus',
        valueKey: 'dashboard.status.running',
        tone: 'green',
      },
    ]

    const mappedSources = mergeLiveDeviceStatusSources(statusSources, {})

    expect(mappedSources.map(source => [source.statusKey, source.valueKey, source.tone])).toEqual([
      ['dashboard.status.offline', 'dashboard.status.offline', 'gray'],
      ['dashboard.status.offline', 'dashboard.status.offline', 'gray'],
    ])
  })

  it('maps PLC status into the conveyor detail dialog', () => {
    const snapshot: PlcRobotStatusSnapshot = {
      plc: {
        number: 'CV-01',
        max_load: 1,
        running_speed: 0.42,
        system_starting: 1,
      },
    }

    const conveyorDetail = mergeLiveDeviceDetails(deviceDetailsFixture, snapshot)
      .find(device => device.type === 'conveyor')

    expect(conveyorDetail?.statusKey).toBe('dashboard.status.running')
    expect(conveyorDetail?.tone).toBe('green')
    expect(conveyorDetail?.fields).toEqual([
      { key: 'max-load', labelKey: 'dashboard.deviceDetails.fields.maxLoad', value: '1 kg' },
      { key: 'running-speed', labelKey: 'dashboard.deviceDetails.fields.runningSpeed', value: '0.42 m/s' },
    ])
  })

  it('maps robot telemetry into TCP and joint detail sections', () => {
    const snapshot: PlcRobotStatusSnapshot = {
      robot: {
        tcp_pose: { x: 123.4, y: 234.5, z: 345.6, rx: 1.1, ry: 2.2, rz: 3.3 },
        tcp_raw: { fx: 0.1, fy: 0.2, fz: 0.3, mx: 0.4, my: 0.5, mz: 0.6 },
        arthrosis_list: [
          {
            name: 'A1',
            q: 10.1,
            tau: 1.23,
            motor_current: null,
            motor_tem: null,
            mcu_tem: null,
          },
        ],
      },
    }

    const robotDetail = mergeLiveDeviceDetails(deviceDetailsFixture, snapshot)
      .find(device => device.type === 'robot')

    expect(robotDetail?.tcpPose?.map(field => field.value)).toEqual(['123.4', '234.5', '345.6', '1.1', '2.2', '3.3'])
    expect(robotDetail?.tcpWrench?.map(field => field.value)).toEqual(['0.4', '0.5', '0.6', '0.1', '0.2', '0.3'])
    expect(robotDetail?.joints).toEqual([
      {
        joint: 'A1',
        position: '10.1 deg',
        torque: '1.23 Nm',
        current: '--',
        temperature: '--',
      },
    ])
  })

  it('maps gripper position into close amount millimeter detail', () => {
    const snapshot: PlcRobotStatusSnapshot = {
      gripper: {
        number: 'GRP-01',
        enabled: true,
        position: 24.8,
        max_stroke: 40,
        closing_speed: 45,
      },
    }

    const gripperDetail = mergeLiveDeviceDetails([
      {
        code: 'GRP-01',
        type: 'gripper',
        nameKey: 'dashboard.devices.gripper.name',
        image: 'gripper.png',
        statusKey: 'dashboard.status.offline',
        tone: 'gray',
        fields: [],
      },
    ], snapshot).find(device => device.type === 'gripper')

    expect(gripperDetail?.statusKey).toBe('dashboard.status.enabled')
    expect(gripperDetail?.fields).toEqual([
      { key: 'close-percent', labelKey: 'dashboard.deviceDetails.fields.closePercent', value: '15 mm' },
      { key: 'max-stroke', labelKey: 'dashboard.deviceDetails.fields.maxStroke', value: '40 mm' },
      { key: 'close-speed', labelKey: 'dashboard.deviceDetails.fields.closeSpeed', value: '45 mm/s' },
    ])
  })

  it('resets API-backed detail data to unavailable defaults before fetching', () => {
    const defaultDetails: DeviceDetailSource[] = [
      {
        code: 'RB-01',
        type: 'robot',
        nameKey: 'dashboard.devices.robot.name',
        image: 'robot.png',
        statusKey: 'dashboard.status.offline',
        tone: 'gray',
        fields: [],
        joints: [
          { joint: 'A1', position: '--', torque: '--', current: '--', temperature: '--' },
        ],
        tcpPose: [
          { key: 'x', labelKey: 'dashboard.deviceDetails.fields.tcpX', value: '--' },
        ],
        tcpWrench: [
          { key: 'mx', labelKey: 'dashboard.deviceDetails.fields.forceMx', value: '--' },
        ],
      },
    ]

    const currentDetails = mergeLiveDeviceDetails(defaultDetails, {
      robot: {
        tcp_pose: { x: 123.4, y: 234.5, z: 345.6, rx: 1.1, ry: 2.2, rz: 3.3 },
        tcp_raw: { fx: 0.1, fy: 0.2, fz: 0.3, mx: 0.4, my: 0.5, mz: 0.6 },
        arthrosis_list: [
          {
            name: 'A1',
            q: 10.1,
            tau: 1.23,
            motor_current: null,
            motor_tem: null,
            mcu_tem: null,
          },
        ],
      },
    })

    expect(resetDeviceDetailSource(currentDetails, defaultDetails, 'RB-01')).toEqual(defaultDetails)
  })
})
