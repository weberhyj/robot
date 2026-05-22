<script setup lang="ts">
import type { FlowStep, ResultRow } from './types'
import type { CameraDetectionResult } from '@/entities/device/types'
import { Camera, CircleCheck, Lock, RefreshRight, SwitchButton, Unlock, VideoPause, VideoPlay, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import cameraImage from '@/assets/images/devices/camera-photo.png'
import conveyorImage from '@/assets/images/devices/conveyor-photo.png'
import gripperImage from '@/assets/images/devices/gripper-photo.png'
import workbenchImage from '@/assets/images/devices/workbench.svg'
import { closeGripperJaw, detectCameraOnce, getCameraStatusSnapshot, getGripperStatusSnapshot, getPlcStatusSnapshot, openGripperJaw, startConveyorSoftly, stopConveyorSoftly } from '@/services'
import { useDeviceStatusStore } from '@/stores/deviceStatusStore'
import { buildGripperClosePercent, buildGripperClosePositionMm } from './gripperControl'

const { t } = useI18n()
const deviceStatusStore = useDeviceStatusStore()

const conveyorCommandLoading = shallowRef<'start' | 'stop'>()
const gripperCommandLoading = shallowRef<'open' | 'close'>()
const cameraDetectionLoading = shallowRef(false)
const deviceStatusRefreshInterval = 5000
const conveyorCode = shallowRef('CV-01')
const conveyorSpeed = shallowRef('--')
const cameraCode = shallowRef('CAM-01')
const cameraStatusKey = shallowRef('dashboard.status.offline')
const cameraTone = shallowRef<'blue' | 'gray'>('gray')
const cameraFrameRate = shallowRef('--')
const gripperCode = shallowRef('GRP-01')
const gripperStatusKey = shallowRef('dashboard.status.offline')
const gripperTone = shallowRef<'blue' | 'red' | 'gray'>('gray')
const gripperCurrentClosePercent = shallowRef<number>()
const gripperTargetClosePercent = shallowRef(0)
const gripperMaxStrokeCm = shallowRef<number>()
let deviceStatusTimer: number | undefined
const recognitionDialogVisible = shallowRef(false)
const latestRecognitionResult = shallowRef<CameraDetectionResult>()

const flowRecord = reactive({
  executionResultKey: 'manual.resultValues.success',
  loadingKey: 'manual.resultValues.completed',
  transferKey: 'manual.resultValues.completed',
  recognitionKey: 'manual.resultValues.completed',
  graspKey: 'manual.resultValues.completed',
  placingKey: 'manual.resultValues.completed',
  categoryKey: 'manual.resultValues.categoryA',
  binKey: 'manual.resultValues.binA',
  confidence: '99.2%',
  startTime: '14:32:08',
  endTime: '14:32:22',
})

const deviceCards = computed(() => [
  {
    key: 'conveyor',
    title: t('manual.conveyor.title'),
    image: conveyorImage,
    code: conveyorCode.value,
    status: t(deviceStatusStore.conveyorStatusKey),
    metricLabel: t('manual.fields.currentSpeed'),
    metricValue: conveyorSpeed.value,
    tone: deviceStatusStore.conveyorTone,
  },
  {
    key: 'camera',
    title: t('manual.camera.title'),
    image: cameraImage,
    code: cameraCode.value,
    status: t(cameraStatusKey.value),
    metricLabel: t('manual.fields.currentFrameRate'),
    metricValue: cameraFrameRate.value,
    tone: cameraTone.value,
  },
  {
    key: 'gripper',
    title: t('manual.gripper.title'),
    image: gripperImage,
    code: gripperCode.value,
    status: t(gripperStatusKey.value),
    metricLabel: t('manual.fields.currentClosePercent'),
    metricValue: formatPercentLabel(gripperCurrentClosePercent.value),
    tone: gripperTone.value,
  },
] as const)

const flowSteps = computed<FlowStep[]>(() => [
  { key: 'loading', label: t('manual.flowSteps.loading'), value: t(flowRecord.loadingKey), tone: 'green' },
  { key: 'conveying', label: t('manual.flowSteps.conveying'), value: t(flowRecord.transferKey), tone: 'green' },
  { key: 'recognition', label: t('manual.flowSteps.recognition'), value: t(flowRecord.recognitionKey), tone: 'green' },
  { key: 'grasping', label: t('manual.flowSteps.grasping'), value: t(flowRecord.graspKey), tone: 'green' },
  { key: 'placing', label: t('manual.flowSteps.placing'), value: t(flowRecord.placingKey), tone: 'green' },
  { key: 'completed', label: t('manual.flowSteps.completed'), value: t(flowRecord.executionResultKey), tone: 'blue' },
])

const executionResultValue = computed(() => t(flowRecord.executionResultKey))
const gripperCloseStroke = computed(() => {
  if (gripperMaxStrokeCm.value === undefined)
    return '--'

  const stroke = gripperTargetClosePercent.value / 100 * gripperMaxStrokeCm.value

  return `${Number(stroke.toFixed(1))}cm`
})
const gripperMaxStrokeText = computed(() =>
  gripperMaxStrokeCm.value === undefined ? '--' : `${Number(gripperMaxStrokeCm.value.toFixed(1))}cm`)
const gripperCloseDisabled = computed(() => gripperCommandLoading.value !== undefined || gripperMaxStrokeCm.value === undefined)

const resultRows = computed<ResultRow[]>(() => [
  { labelKey: 'manual.resultFields.materialLoading', value: t(flowRecord.loadingKey), tone: 'green' },
  { labelKey: 'manual.resultFields.itemCategory', value: t(flowRecord.categoryKey), tone: 'blue' },
  { labelKey: 'manual.resultFields.materialTransfer', value: t(flowRecord.transferKey), tone: 'green' },
  { labelKey: 'manual.resultFields.bin', value: t(flowRecord.binKey), tone: 'blue' },
  { labelKey: 'manual.resultFields.materialRecognition', value: t(flowRecord.recognitionKey), tone: 'green' },
  { labelKey: 'manual.resultFields.confidence', value: flowRecord.confidence, tone: 'blue' },
  { labelKey: 'manual.resultFields.materialGrasp', value: t(flowRecord.graspKey), tone: 'green' },
  { labelKey: 'manual.resultFields.startTime', value: flowRecord.startTime },
  { labelKey: 'manual.resultFields.materialPlacement', value: t(flowRecord.placingKey), tone: 'green' },
  { labelKey: 'manual.resultFields.endTime', value: flowRecord.endTime },
])

const recognitionPreviewUrl = computed(() => buildRecognitionImageSrc(latestRecognitionResult.value?.image_base64))
const recognitionResultRows = computed(() => {
  const result = latestRecognitionResult.value

  return [
    {
      label: t('manual.recognitionResult.fields.status'),
      value: getRecognitionStatusText(result),
      tone: getRecognitionStatusTone(result),
    },
    { label: t('manual.recognitionResult.fields.category'), value: result?.material ?? '--' },
    { label: t('manual.recognitionResult.fields.confidence'), value: formatDetectionConfidence(result?.confidence) },
    { label: t('manual.recognitionResult.fields.position'), value: formatDetectionPosition(result) },
    { label: t('manual.recognitionResult.fields.time'), value: result?.detect_time ?? '--' },
  ]
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

function formatPercent(value: string): string {
  return value === '' ? '' : `${value}%`
}

function parsePercent(value: string): string {
  return value.replace(/[^\d.]/g, '')
}

function formatPercentLabel(value: number | undefined): string {
  return value === undefined ? '--' : `${Number(value.toFixed(1))}%`
}

async function startConveyor(): Promise<void> {
  await runConveyorCommand('start', startConveyorSoftly, 'running')
}

async function stopConveyor(): Promise<void> {
  await runConveyorCommand('stop', stopConveyorSoftly, 'standby')
}

function resetConveyorFault(): void {
  deviceStatusStore.setConveyorStandby()
}

async function triggerRecognition(): Promise<void> {
  if (cameraDetectionLoading.value)
    return

  cameraDetectionLoading.value = true

  try {
    const result = await detectCameraOnce()

    latestRecognitionResult.value = result
    cameraStatusKey.value = result.success ? 'manual.status.recognized' : 'manual.status.recognitionFailed'
    recognitionDialogVisible.value = true

    if (result.success)
      ElMessage.success(t('manual.messages.cameraDetectSuccess'))
    else
      ElMessage.warning(t('manual.messages.cameraDetectFailed'))
  }
  catch {
    ElMessage.error(t('manual.messages.cameraDetectRequestFailed'))
  }
  finally {
    cameraDetectionLoading.value = false
  }
}

function viewRecognitionResult(): void {
  cameraStatusKey.value = 'manual.status.resultViewed'
  recognitionDialogVisible.value = true
}

async function openGripper(): Promise<void> {
  await runGripperCommand('open', openGripperJaw, () => {
    gripperTargetClosePercent.value = 0
    gripperStatusKey.value = 'manual.status.opened'
  })
}

async function closeGripper(): Promise<void> {
  if (gripperMaxStrokeCm.value === undefined) {
    ElMessage.error(t('manual.messages.gripperMissingMaxStroke'))
    return
  }

  const position = buildGripperClosePositionMm({
    closePercent: gripperTargetClosePercent.value,
    maxStrokeCm: gripperMaxStrokeCm.value,
  })

  await runGripperCommand('close', () => closeGripperJaw(position), () => {
    gripperStatusKey.value = 'manual.status.closed'
  })
}

async function refreshManualDeviceStatus(): Promise<void> {
  const [plcSnapshot, cameraSnapshot, gripperSnapshot] = await Promise.all([
    getPlcStatusSnapshot(),
    getCameraStatusSnapshot(),
    getGripperStatusSnapshot(),
  ])

  if (plcSnapshot.plc) {
    conveyorCode.value = plcSnapshot.plc.number
    conveyorSpeed.value = `${formatNumber(plcSnapshot.plc.running_speed, 2)} m/s`
    deviceStatusStore.setConveyorStatusFromPlc(plcSnapshot.plc)
  }
  else {
    conveyorSpeed.value = '--'
    deviceStatusStore.setConveyorOffline()
  }

  if (cameraSnapshot.camera) {
    cameraCode.value = cameraSnapshot.camera.number
    cameraStatusKey.value = cameraSnapshot.camera.online ? 'dashboard.status.online' : 'dashboard.status.offline'
    cameraTone.value = cameraSnapshot.camera.online ? 'blue' : 'gray'
    cameraFrameRate.value = `${cameraSnapshot.camera.fps} fps`
  }
  else {
    cameraStatusKey.value = 'dashboard.status.offline'
    cameraTone.value = 'gray'
    cameraFrameRate.value = '--'
  }

  if (gripperSnapshot.gripper) {
    gripperCode.value = gripperSnapshot.gripper.number
    gripperStatusKey.value = gripperSnapshot.gripper.enabled ? 'dashboard.status.enabled' : 'dashboard.status.error'
    gripperTone.value = gripperSnapshot.gripper.enabled ? 'blue' : 'red'
    gripperCurrentClosePercent.value = buildGripperClosePercent({
      positionMm: gripperSnapshot.gripper.position,
      maxStrokeCm: gripperSnapshot.gripper.max_stroke,
    })
    gripperMaxStrokeCm.value = gripperSnapshot.gripper.max_stroke
  }
  else {
    gripperStatusKey.value = 'dashboard.status.offline'
    gripperTone.value = 'gray'
    gripperCurrentClosePercent.value = undefined
    gripperMaxStrokeCm.value = undefined
  }
}

function runFullSortingFlow(): void {
  const start = new Date()
  const end = new Date(start.getTime() + 14000)

  flowRecord.executionResultKey = 'manual.resultValues.success'
  flowRecord.loadingKey = 'manual.resultValues.completed'
  flowRecord.transferKey = 'manual.resultValues.completed'
  flowRecord.recognitionKey = 'manual.resultValues.completed'
  flowRecord.graspKey = 'manual.resultValues.completed'
  flowRecord.placingKey = 'manual.resultValues.completed'
  flowRecord.categoryKey = 'manual.resultValues.categoryA'
  flowRecord.binKey = 'manual.resultValues.binA'
  flowRecord.confidence = '99.2%'
  flowRecord.startTime = formatTime(start)
  flowRecord.endTime = formatTime(end)
}

async function runGripperCommand(
  command: 'open' | 'close',
  request: () => ReturnType<typeof openGripperJaw>,
  applySuccess: () => void,
): Promise<void> {
  if (gripperCommandLoading.value)
    return

  gripperCommandLoading.value = command

  try {
    const response = await request()

    if (!response.success) {
      ElMessage.error(response.message || t(`manual.messages.gripper${capitalizeGripperCommand(command)}Failed`))
      return
    }

    applySuccess()
    ElMessage.success(response.message || t(`manual.messages.gripper${capitalizeGripperCommand(command)}Success`))
    await refreshManualDeviceStatus()
  }
  catch {
    ElMessage.error(t(`manual.messages.gripper${capitalizeGripperCommand(command)}Failed`))
  }
  finally {
    gripperCommandLoading.value = undefined
  }
}

async function runConveyorCommand(
  command: 'start' | 'stop',
  request: () => Promise<boolean>,
  nextStatus: 'running' | 'standby',
): Promise<void> {
  if (conveyorCommandLoading.value)
    return

  conveyorCommandLoading.value = command

  try {
    const succeeded = await request()

    if (!succeeded) {
      ElMessage.error(t(`manual.messages.conveyor${capitalizeCommand(command)}Failed`))
      return
    }

    if (nextStatus === 'running')
      deviceStatusStore.setConveyorRunning()
    else
      deviceStatusStore.setConveyorStandby()

    ElMessage.success(t(`manual.messages.conveyor${capitalizeCommand(command)}Success`))
  }
  catch {
    ElMessage.error(t(`manual.messages.conveyor${capitalizeCommand(command)}Failed`))
  }
  finally {
    conveyorCommandLoading.value = undefined
  }
}

function capitalizeCommand(command: 'start' | 'stop'): 'Start' | 'Stop' {
  return command === 'start' ? 'Start' : 'Stop'
}

function capitalizeGripperCommand(command: 'open' | 'close'): 'Open' | 'Close' {
  return command === 'open' ? 'Open' : 'Close'
}

function formatNumber(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)
}

function getRecognitionStatusText(result: CameraDetectionResult | undefined): string {
  if (!result)
    return t('manual.recognitionResult.values.empty')

  return result.success
    ? t('manual.recognitionResult.values.success')
    : t('manual.recognitionResult.values.failed')
}

function getRecognitionStatusTone(result: CameraDetectionResult | undefined): 'green' | 'red' | 'gray' {
  if (!result)
    return 'gray'

  return result.success ? 'green' : 'red'
}

function formatDetectionConfidence(value: number | null | undefined): string {
  return value === null || value === undefined ? '--' : `${formatNumber(value, 1)}%`
}

function formatDetectionPosition(result: CameraDetectionResult | undefined): string {
  if (!result || result.coord_x === null || result.coord_y === null || result.coord_z === null)
    return '--'

  return `X: ${formatNumber(result.coord_x, 1)}   Y: ${formatNumber(result.coord_y, 1)}   Z: ${formatNumber(result.coord_z, 1)}`
}

function buildRecognitionImageSrc(imageBase64: string | null | undefined): string {
  if (!imageBase64)
    return ''

  return imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
}

onMounted(() => {
  void refreshManualDeviceStatus()
  deviceStatusTimer = window.setInterval(() => {
    void refreshManualDeviceStatus()
  }, deviceStatusRefreshInterval)
})

onBeforeUnmount(() => {
  if (deviceStatusTimer)
    window.clearInterval(deviceStatusTimer)
})
</script>

<template>
  <section class="manual-control">
    <div class="manual-control__main-card">
      <section class="manual-control__device-grid">
        <article
          v-for="device in deviceCards" :key="device.key" class="manual-device-card"
          :class="`is-${device.tone}`"
        >
          <header class="manual-device-card__header">
            <h2>{{ device.title }}</h2>
            <span class="manual-device-card__status">{{ device.status }}</span>
          </header>

          <div class="manual-device-card__summary">
            <div class="manual-device-card__image">
              <img :src="device.image" :alt="device.title">
            </div>
            <dl class="manual-device-card__info" :class="{ 'is-grid': device.key === 'gripper' }">
              <div>
                <dt>{{ t('manual.fields.deviceCode') }}</dt>
                <dd>{{ device.code }}</dd>
              </div>
              <div v-if="device.key === 'gripper'">
                <dt>{{ t('manual.fields.adjustableMaxStroke') }}</dt>
                <dd>{{ gripperMaxStrokeText }}</dd>
              </div>
              <div>
                <dt>{{ t('manual.fields.currentStatus') }}</dt>
                <dd>{{ device.status }}</dd>
              </div>
              <div>
                <dt>{{ device.metricLabel }}</dt>
                <dd>{{ device.metricValue }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="device.key === 'conveyor'" class="manual-device-card__actions">
            <el-button
              type="primary" :icon="VideoPlay" :loading="conveyorCommandLoading === 'start'"
              :disabled="!!conveyorCommandLoading" @click="startConveyor"
            >
              {{ t('manual.actions.start') }}
            </el-button>
            <el-button
              type="danger" plain :icon="VideoPause" :loading="conveyorCommandLoading === 'stop'"
              :disabled="!!conveyorCommandLoading" @click="stopConveyor"
            >
              {{ t('manual.actions.stop') }}
            </el-button>
            <el-button :icon="RefreshRight" :disabled="!!conveyorCommandLoading" @click="resetConveyorFault">
              {{ t('manual.actions.resetFault') }}
            </el-button>
          </div>

          <div v-else-if="device.key === 'camera'" class="manual-device-card__actions is-two">
            <el-button type="primary" :icon="Camera" :loading="cameraDetectionLoading" @click="triggerRecognition">
              {{ t('manual.actions.triggerRecognition') }}
            </el-button>
            <el-button :icon="View" :disabled="cameraDetectionLoading" @click="viewRecognitionResult">
              {{ t('manual.actions.viewRecognitionResult') }}
            </el-button>
          </div>

          <div v-else class="manual-device-card__gripper">
            <div class="manual-device-card__percent-control">
              <span>{{ t('manual.fields.closePercent') }}</span>
              <el-input-number
                v-model="gripperTargetClosePercent" :min="0" :max="100" :step="1" :formatter="formatPercent"
                :parser="parsePercent" size="small" controls-position="right"
              />
              <strong>{{ gripperCloseStroke }}</strong>
            </div>

            <div class="manual-device-card__actions is-two">
              <el-button
                :icon="Unlock" :loading="gripperCommandLoading === 'open'" :disabled="gripperCommandLoading === 'close'"
                @click="openGripper"
              >
                {{ t('manual.actions.open') }}
              </el-button>
              <el-button
                type="primary" :icon="Lock" :loading="gripperCommandLoading === 'close'"
                :disabled="gripperCloseDisabled" @click="closeGripper"
              >
                {{ t('manual.actions.close') }}
              </el-button>
            </div>
          </div>
        </article>
      </section>

      <section class="sorting-flow-panel">
        <div class="sorting-flow-panel__visual">
          <ol class="sorting-flow-panel__workflow" :aria-label="t('manual.flow.workflowLabel')">
            <li
              v-for="(step, index) in flowSteps" :key="step.key" class="sorting-flow-panel__workflow-step"
              :class="`is-${step.tone}`"
            >
              <span class="sorting-flow-panel__node">{{ index + 1 }}</span>
              <strong>{{ step.label }}</strong>
              <em>{{ step.value }}</em>
            </li>
          </ol>
          <div class="sorting-flow-panel__image">
            <img :src="workbenchImage" :alt="t('manual.flow.workbenchAlt')">
          </div>
        </div>

        <aside class="sorting-flow-panel__result">
          <el-button class="sorting-flow-panel__run" type="primary" :icon="SwitchButton" @click="runFullSortingFlow">
            {{ t('manual.actions.runFullFlow') }}
          </el-button>

          <div class="sorting-flow-panel__details">
            <header class="sorting-flow-panel__details-header">
              <div class="sorting-flow-panel__details-title">
                <CircleCheck />
                <h2>{{ t('manual.flow.resultTitle') }}</h2>
              </div>
              <span class="sorting-flow-panel__result-badge">{{ executionResultValue }}</span>
            </header>

            <dl>
              <div v-for="item in resultRows" :key="item.labelKey" :class="item.tone ? `is-${item.tone}` : undefined">
                <dt>{{ t(item.labelKey) }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </div>

    <el-dialog
      v-model="recognitionDialogVisible"
      class="recognition-result-dialog"
      width="520px"
      align-center
      :teleported="false"
    >
      <template #header>
        <strong class="recognition-result-dialog__title">{{ t('manual.recognitionResult.title') }}</strong>
      </template>

      <div class="recognition-result-dialog__body">
        <div class="recognition-result-dialog__preview" :aria-label="t('manual.recognitionResult.imageAlt')">
          <img
            v-if="recognitionPreviewUrl" class="recognition-result-dialog__image"
            :src="recognitionPreviewUrl" :alt="t('manual.recognitionResult.imageAlt')"
          >
          <template v-else>
            <div class="recognition-result-dialog__track" />
            <div class="recognition-result-dialog__package">
              <span />
              <i />
              <em />
            </div>
            <div class="recognition-result-dialog__box" />
          </template>
        </div>

        <dl class="recognition-result-dialog__meta">
          <div v-for="row in recognitionResultRows" :key="row.label" :class="row.tone ? `is-${row.tone}` : undefined">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </div>

      <template #footer>
        <div class="recognition-result-dialog__footer">
          <el-button :icon="RefreshRight" :loading="cameraDetectionLoading" @click="triggerRecognition">
            {{ t('manual.recognitionResult.actions.recognizeAgain') }}
          </el-button>
          <el-button type="primary" @click="recognitionDialogVisible = false">
            {{ t('manual.recognitionResult.actions.close') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped lang="scss">
.manual-control {
  width: 100%;
  max-width: 100%;
  min-width: 0;

  &__main-card {
    display: grid;
    gap: 18px;
    min-width: 0;
    min-height: calc(100vh - 154px);
    border: 1px solid #dde4ee;
    border-radius: var(--rf-radius-shell);
    background: var(--rf-color-surface);
    box-shadow: var(--rf-shadow-raised);
    padding: 20px;
  }

  &__device-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    min-width: 0;
  }
}

.manual-device-card,
.sorting-flow-panel {
  min-width: 0;
  border-radius: var(--rf-radius-panel);
  background: #ffffff;
  box-shadow: var(--rf-shadow-panel);
}

.manual-device-card {
  display: grid;
  gap: 8px;
  padding: 13px 14px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;

    h2 {
      margin: 0;
      color: #172033;
      font-size: 16px;
      line-height: 1;
    }
  }

  &__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #eaf8f0;
    color: #059669;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    padding: 2px 6px;
  }

  &.is-blue &__status {
    background: #edf4ff;
    color: var(--rf-color-blue);
  }

  &.is-yellow &__status {
    background: #fff5df;
    color: #b45309;
  }

  &.is-red &__status {
    background: #fff1f1;
    color: #dc2626;
  }

  &.is-gray &__status {
    background: #eef2f7;
    color: #64748b;
  }

  &__summary {
    display: grid;
    grid-template-columns: minmax(98px, 34%) minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  &__image {
    display: grid;
    min-height: 104px;
    place-items: center;
    border-radius: 10px;
    background: #f2f6fb;

    img {
      width: 82%;
      max-height: 88px;
      object-fit: contain;
    }
  }

  &__info {
    display: grid;
    gap: 6px;
    margin: 0;

    div {
      display: grid;
      gap: 2px;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 6px;

      &:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
    }

    &.is-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;

      div {
        min-height: 44px;
        border-bottom: 0;
        border-radius: 8px;
        background: #f8fafd;
        padding: 7px 8px;
      }
    }

    dt {
      color: var(--rf-color-text-muted);
      font-size: 10px;
      font-weight: 700;
    }

    dd {
      margin: 0;
      color: #172033;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;

    &.is-two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .el-button {
      width: 100%;
      height: 30px;
      margin: 0;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
    }
  }

  &__gripper {
    display: grid;
    gap: 9px;
  }

  &__percent-control {
    display: grid;
    grid-template-columns: auto 122px 52px;
    gap: 8px;
    align-items: center;
    min-width: 0;
    border-radius: 9px;
    background: #f8fafd;
    padding: 7px 9px;

    > span {
      overflow: hidden;
      min-width: 0;
      color: var(--rf-color-text-muted);
      font-size: 12px;
      font-weight: 800;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--rf-color-blue);
      font-size: 13px;
      line-height: 1;
      text-align: right;
    }

    :deep(.el-input-number) {
      width: 122px;
    }

    :deep(.el-input__inner) {
      text-align: center;
    }
  }
}

.sorting-flow-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.14fr) minmax(360px, 0.86fr);
  gap: 18px;
  padding: 18px;

  &__visual {
    display: grid;
    grid-template-rows: auto minmax(170px, 1fr);
    gap: 14px;
    min-width: 0;
  }

  &__image {
    display: grid;
    min-height: 214px;
    place-items: center;
    border-radius: 12px;
    background: #f3f7fc;

    img {
      width: min(92%, 420px);
      max-height: 190px;
      object-fit: contain;
    }
  }

  &__workflow {
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;

    &::before {
      position: absolute;
      top: 18px;
      right: 7.5%;
      left: 7.5%;
      height: 2px;
      border-radius: 999px;
      background: #dbe6f1;
      content: '';
    }
  }

  &__workflow-step {
    position: relative;
    z-index: 1;
    --workflow-step-color: #059669;
    display: grid;
    justify-items: center;
    gap: 7px;
    min-width: 0;
    color: var(--workflow-step-color);

    strong {
      overflow: hidden;
      color: #172033;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      color: #059669;
      font-size: 11px;
      font-style: normal;
      font-weight: 800;
      white-space: nowrap;
    }

    &.is-blue {
      --workflow-step-color: var(--rf-color-blue);

      em {
        color: var(--rf-color-blue);
      }
    }
  }

  &__node {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    border: 3px solid #f3f7fc;
    border-radius: 999px;
    background: var(--workflow-step-color);
    box-shadow: 0 0 0 1px rgba(219, 230, 241, 0.9);
    color: #ffffff;
    font-size: 12px;
    font-weight: 900;
  }

  &__result {
    display: grid;
    align-content: start;
    gap: 14px;
    min-width: 0;
  }

  &__run {
    width: 100%;
    height: 42px;
    border-radius: 9px;
    font-weight: 900;
  }

  &__details {
    display: grid;
    gap: 12px;
    min-width: 0;
    border: 1px solid #e1eaf5;
    border-radius: 12px;
    background: #fbfdff;
    padding: 14px;

    .sorting-flow-panel__details-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 0;
    }

    div {
      min-width: 0;
      border-radius: 9px;
      background: #ffffff;
      padding: 8px 10px;
    }

    dt {
      color: var(--rf-color-text-muted);
      font-size: 11px;
      font-weight: 700;
    }

    dd {
      overflow: hidden;
      margin: 4px 0 0;
      color: #172033;
      font-size: 13px;
      font-weight: 800;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .is-green dd {
      color: #059669;
    }

    .is-blue dd {
      color: var(--rf-color-blue);
    }
  }

  &__details-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: #059669;

    h2 {
      overflow: hidden;
      margin: 0;
      color: #172033;
      font-size: 16px;
      line-height: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    svg {
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
    }
  }

  &__result-badge {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #eaf8f0;
    color: #059669;
    font-size: 12px;
    font-weight: 900;
    line-height: 1;
    padding: 6px 10px;
  }
}

.recognition-result-dialog {
  :deep(.el-dialog) {
    border-radius: 10px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #edf2f7;
    padding: 16px 18px 14px;
  }

  :deep(.el-dialog__body) {
    padding: 14px 14px 0;
  }

  :deep(.el-dialog__footer) {
    padding: 14px;
  }

  &__title {
    color: #172033;
    font-size: 16px;
    font-weight: 900;
    line-height: 1;
  }

  &__body {
    display: grid;
    grid-template-columns: 218px minmax(0, 1fr);
    gap: 18px;
    min-width: 0;
  }

  &__preview {
    position: relative;
    min-height: 184px;
    overflow: hidden;
    border-radius: 7px;
    background: linear-gradient(90deg, transparent 48%, rgb(226 232 240 / 82%) 48% 52%, transparent 52%), #273241;
  }

  &__track {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgb(255 255 255 / 12%), transparent 40%),
      repeating-linear-gradient(0deg, rgb(255 255 255 / 5%) 0 1px, transparent 1px 18px);
  }

  &__package {
    position: absolute;
    left: 57px;
    top: 70px;
    width: 102px;
    height: 58px;
    border: 1px solid #95abc3;
    border-radius: 3px;
    background: linear-gradient(145deg, #c9d7e6, #7f99b4 62%, #647d9a);
    box-shadow: 0 12px 22px rgb(7 13 24 / 28%);
    transform: rotate(-18deg) skewX(-8deg);

    span,
    i,
    em {
      position: absolute;
      display: block;
      background: rgb(255 255 255 / 48%);
    }

    span {
      left: 13px;
      top: 13px;
      width: 58px;
      height: 5px;
      border-radius: 999px;
    }

    i {
      left: 13px;
      top: 26px;
      width: 70px;
      height: 4px;
      border-radius: 999px;
    }

    em {
      right: 14px;
      bottom: 12px;
      width: 28px;
      height: 16px;
      border-radius: 2px;
      background: repeating-linear-gradient(90deg, #26364a 0 2px, #d9e4ef 2px 4px);
    }
  }

  &__box {
    position: absolute;
    left: 38px;
    top: 26px;
    width: 140px;
    height: 136px;
    border: 2px solid #35d06f;
    box-shadow:
      0 0 0 1px rgb(53 208 111 / 12%),
      inset 0 0 18px rgb(53 208 111 / 10%);
  }

  &__meta {
    display: grid;
    align-content: start;
    gap: 8px;
    margin: 0;
    min-width: 0;

    div {
      display: grid;
      grid-template-columns: 82px minmax(0, 1fr);
      align-items: center;
      min-height: 32px;
      border-radius: 6px;
      background: #f8fafd;
      padding: 6px 10px;
    }

    dt {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    dd {
      overflow: hidden;
      margin: 0;
      color: #334155;
      font-size: 12px;
      font-weight: 800;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .is-green dd {
      width: fit-content;
      justify-self: end;
      border-radius: 5px;
      background: #e8f8ef;
      color: #059669;
      padding: 4px 8px;
    }

    .is-red dd {
      width: fit-content;
      justify-self: end;
      border-radius: 5px;
      background: #fee2e2;
      color: #dc2626;
      padding: 4px 8px;
    }

    .is-gray dd {
      width: fit-content;
      justify-self: end;
      border-radius: 5px;
      background: #eef2f7;
      color: #64748b;
      padding: 4px 8px;
    }
  }

  &__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__footer {
    display: grid;
    grid-template-columns: minmax(0, 170px) minmax(0, 1fr);
    gap: 174px;

    .el-button {
      width: 100%;
      height: 33px;
      margin: 0;
      border-radius: 6px;
      font-weight: 800;
    }
  }
}

@media (max-width: 1440px) {
  .manual-control {
    &__main-card {
      gap: 14px;
      min-height: calc(100vh - 136px);
      padding: 16px;
    }

    &__device-grid {
      gap: 12px;
    }
  }

  .manual-device-card {
    gap: 8px;
    padding: 12px;

    &__image {
      min-height: 92px;

      img {
        max-height: 78px;
      }
    }

    &__actions .el-button {
      height: 30px;
      font-size: 11px;
    }

    &__percent-control {
      grid-template-columns: auto 108px 50px;

      :deep(.el-input-number) {
        width: 108px;
      }
    }
  }

  .sorting-flow-panel {
    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.7fr);
    gap: 14px;
    padding: 15px;

    &__image {
      min-height: 186px;

      img {
        max-height: 166px;
      }
    }

    &__details dl {
      gap: 7px;
    }
  }
}
</style>
