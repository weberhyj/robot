import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDeviceStatusStore } from './deviceStatusStore'

describe('device status store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('maps PLC status into the shared conveyor status', () => {
    const store = useDeviceStatusStore()

    store.setConveyorStatusFromPlc({
      number: 'CV-01',
      max_load: 1,
      running_speed: 0.42,
      system_starting: 1,
    })

    expect(store.conveyorStatusKey).toBe('dashboard.status.running')
    expect(store.conveyorTone).toBe('green')

    store.setConveyorStatusFromPlc({
      number: 'CV-01',
      max_load: 1,
      running_speed: 0,
      system_starting: 0,
    })

    expect(store.conveyorStatusKey).toBe('dashboard.status.standby')
    expect(store.conveyorTone).toBe('yellow')
  })

  it('lets manual control command results update the shared conveyor status', () => {
    const store = useDeviceStatusStore()

    store.setConveyorRunning()
    expect(store.conveyorStatusKey).toBe('dashboard.status.running')

    store.setConveyorStandby()
    expect(store.conveyorStatusKey).toBe('dashboard.status.standby')
  })
})
