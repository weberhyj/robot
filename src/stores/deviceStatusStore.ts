import type { ConveyorStatusKey, DeviceStatusTone } from '@/entities/device/status'
import type { PlcStatus } from '@/entities/device/types'
import { defineStore } from 'pinia'
import { conveyorOfflineStatus, conveyorRunningStatus, conveyorStandbyStatus, resolveConveyorStatus } from '@/entities/device/status'

export interface DeviceStatusState {
  conveyorStatusKey: ConveyorStatusKey
  conveyorTone: DeviceStatusTone
}

export const useDeviceStatusStore = defineStore('deviceStatus', {
  state: (): DeviceStatusState => ({
    conveyorStatusKey: conveyorOfflineStatus.statusKey,
    conveyorTone: conveyorOfflineStatus.tone,
  }),
  actions: {
    setConveyorStatus(status: { statusKey: ConveyorStatusKey, tone: DeviceStatusTone }): void {
      this.conveyorStatusKey = status.statusKey
      this.conveyorTone = status.tone
    },
    setConveyorStatusFromPlc(plcStatus?: PlcStatus): void {
      this.setConveyorStatus(resolveConveyorStatus(plcStatus))
    },
    setConveyorRunning(): void {
      this.setConveyorStatus(conveyorRunningStatus)
    },
    setConveyorStandby(): void {
      this.setConveyorStatus(conveyorStandbyStatus)
    },
    setConveyorOffline(): void {
      this.setConveyorStatus(conveyorOfflineStatus)
    },
  },
})
