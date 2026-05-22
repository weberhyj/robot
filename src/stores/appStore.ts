import { defineStore } from 'pinia'

export interface AppSystemState {
  connectionStatus: 'connected' | 'disconnected'
  safetyStatus: 'normal' | 'warning' | 'emergency'
  controlMode: 'automatic' | 'manual' | 'maintenance'
  ipAddress: string
  version: string
  userName: string
  userRole: 'administrator' | 'operator' | 'maintainer'
}

const controlModeStorageKey = 'roboflow.controlMode'
const defaultControlMode: AppSystemState['controlMode'] = 'automatic'

function isControlMode(value: string | null): value is AppSystemState['controlMode'] {
  return value === 'automatic' || value === 'manual' || value === 'maintenance'
}

function readStoredControlMode(): AppSystemState['controlMode'] {
  if (typeof window === 'undefined')
    return defaultControlMode

  const storedMode = window.sessionStorage.getItem(controlModeStorageKey)

  return isControlMode(storedMode) ? storedMode : defaultControlMode
}

function writeStoredControlMode(mode: AppSystemState['controlMode']): void {
  if (typeof window === 'undefined')
    return

  window.sessionStorage.setItem(controlModeStorageKey, mode)
}

export const useAppStore = defineStore('app', {
  state: (): AppSystemState => ({
    connectionStatus: 'connected',
    safetyStatus: 'normal',
    controlMode: readStoredControlMode(),
    ipAddress: '192.168.11.100',
    version: 'v0.1.0',
    userName: 'admin',
    userRole: 'administrator',
  }),
  actions: {
    setControlMode(mode: AppSystemState['controlMode']): void {
      this.controlMode = mode
      writeStoredControlMode(mode)
    },
  },
})
