import type { PlcStatus } from './types'

export type DeviceStatusTone = 'green' | 'blue' | 'yellow' | 'red' | 'gray'
export type ConveyorStatusKey
  = | 'dashboard.status.running'
    | 'dashboard.status.standby'
    | 'dashboard.status.offline'

export interface ConveyorStatusView {
  statusKey: ConveyorStatusKey
  tone: DeviceStatusTone
}

export const conveyorRunningStatus: ConveyorStatusView = {
  statusKey: 'dashboard.status.running',
  tone: 'green',
}

export const conveyorStandbyStatus: ConveyorStatusView = {
  statusKey: 'dashboard.status.standby',
  tone: 'yellow',
}

export const conveyorOfflineStatus: ConveyorStatusView = {
  statusKey: 'dashboard.status.offline',
  tone: 'gray',
}

export function resolveConveyorStatus(plcStatus?: PlcStatus): ConveyorStatusView {
  if (!plcStatus)
    return conveyorOfflineStatus

  if (plcStatus.system_starting === 1)
    return conveyorRunningStatus

  if (plcStatus.system_starting === 0)
    return conveyorStandbyStatus

  return conveyorOfflineStatus
}
