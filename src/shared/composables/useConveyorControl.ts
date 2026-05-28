import type { ComputedRef, ShallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { computed, readonly, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { startConveyorSoftly, stopConveyorSoftly } from '@/services'
import { useDeviceStatusStore } from '@/stores/deviceStatusStore'

export type ConveyorCommand = 'start' | 'stop'

interface UseConveyorControlReturn {
  conveyorCommandLoading: Readonly<ShallowRef<ConveyorCommand | undefined>>
  isConveyorCommandRunning: ComputedRef<boolean>
  startConveyor: () => Promise<void>
  stopConveyor: () => Promise<void>
  resetConveyorFault: () => void
}

type ConveyorCommandRequest = () => Promise<boolean>
type ConveyorCommandSuccess = () => void

const conveyorCommandMessageSuffix: Record<ConveyorCommand, 'Start' | 'Stop'> = {
  start: 'Start',
  stop: 'Stop',
}

export function useConveyorControl(): UseConveyorControlReturn {
  const { t } = useI18n()
  const deviceStatusStore = useDeviceStatusStore()
  const conveyorCommandLoading = shallowRef<ConveyorCommand>()
  const isConveyorCommandRunning = computed(() => conveyorCommandLoading.value !== undefined)

  async function startConveyor(): Promise<void> {
    await runConveyorCommand('start', startConveyorSoftly, () => {
      deviceStatusStore.setConveyorRunning()
    })
  }

  async function stopConveyor(): Promise<void> {
    await runConveyorCommand('stop', stopConveyorSoftly, () => {
      deviceStatusStore.setConveyorStandby()
    })
  }

  function resetConveyorFault(): void {
    deviceStatusStore.setConveyorStandby()
  }

  async function runConveyorCommand(
    command: ConveyorCommand,
    request: ConveyorCommandRequest,
    applySuccess: ConveyorCommandSuccess,
  ): Promise<void> {
    if (conveyorCommandLoading.value)
      return

    conveyorCommandLoading.value = command

    try {
      const succeeded = await request()

      if (!succeeded) {
        ElMessage.error(t(`manual.messages.conveyor${conveyorCommandMessageSuffix[command]}Failed`))
        return
      }

      applySuccess()
      ElMessage.success(t(`manual.messages.conveyor${conveyorCommandMessageSuffix[command]}Success`))
    }
    catch {
      ElMessage.error(t(`manual.messages.conveyor${conveyorCommandMessageSuffix[command]}Failed`))
    }
    finally {
      conveyorCommandLoading.value = undefined
    }
  }

  return {
    conveyorCommandLoading: readonly(conveyorCommandLoading),
    isConveyorCommandRunning,
    startConveyor,
    stopConveyor,
    resetConveyorFault,
  }
}
