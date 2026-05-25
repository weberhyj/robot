<script setup lang="ts">
import type { AlarmRow, DeviceDetailSource, DeviceStatusItem, GraspRecordRow, MetricItem, TaskRow, TaskSource } from './types'
import type { AlertRecord } from '@/entities/alarm/types'
import type { GraspRecord, GraspRecordStatistics, SortingTask, TaskStatus } from '@/entities/task/types'
import { ArrowRight, Check, CircleCheck, Close, Document } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { fetchAlertPage, fetchGraspRecordStatistics, fetchTaskGraspRecords, fetchTaskPage, getBinStatusSnapshot, getCameraStatusSnapshot, getCameraStreamUrl, getGripperStatusSnapshot, getPlcStatusSnapshot, getRobotStatusSnapshot } from '@/services'
import { useDeviceStatusStore } from '@/stores/deviceStatusStore'
import { deviceDetailSources, deviceSources, metricSources } from './data'
import { mergeLiveDeviceDetails, mergeLiveDeviceStatusSources, resetDeviceDetailSource } from './liveStatus'
import { buildGraspRecordStatisticsView } from './statistics'

const { t } = useI18n()
const router = useRouter()
const deviceStatusStore = useDeviceStatusStore()

const warningGlowDeviceCodes = new Set(['RB-01', 'CV-01', 'GRP-01'])
const errorStatusKey = 'dashboard.status.error'
const conveyorDeviceCode = 'CV-01'
const robotDeviceCode = 'RB-01'
const cameraDeviceCode = 'CAM-01'
const gripperDeviceCode = 'GRP-01'
const binsDeviceCode = 'BIN-SET-01'
const taskDisplayLimit = 4
const criticalAlarmDisplayLimit = 20
const liveStatusRefreshInterval = 5000
const deviceDetailRefreshInterval = 1000
const graspRecordPageSizeOptions = [10, 20, 50]
type WorkstationStatus = 'running' | 'stopped'
const workstationStatus: WorkstationStatus = 'running'
const binProgressColors = {
  blue: '#2563eb',
  green: '#10b981',
  red: '#ef4444',
}
const graspRecordDialogVisible = ref(false)
const deviceDetailDialogVisible = ref(false)
const activeDeviceCode = ref('')
const graspRecordCurrentPage = ref(1)
const graspRecordPageSize = ref(10)
const liveDeviceStatusSources = shallowRef(deviceSources)
const liveDeviceDetailSources = shallowRef(deviceDetailSources)
const liveTaskSources = shallowRef<TaskSource[]>([])
const liveAlarmRows = shallowRef<AlarmRow[]>([])
const liveGraspRecordStatistics = shallowRef<GraspRecordStatistics>()
const liveGraspRecordRows = shallowRef<GraspRecordRow[]>([])
const liveGraspRecordTotal = ref(0)
const cameraDetailStreamUrl = shallowRef('')
const activeTaskId = ref<number>()
let liveStatusTimer: number | undefined
let deviceDetailTimer: number | undefined
let deviceDetailRefreshToken = 0
let dashboardLiveDataRefreshing = false

const graspRecordStatisticsView = computed(() => buildGraspRecordStatisticsView(liveGraspRecordStatistics.value))

const statusMetrics = computed<MetricItem[]>(() => metricSources.map(metric => ({
  key: metric.key,
  label: t(metric.labelKey),
  value: getStatusMetricValue(metric.key),
  unit: metric.unitKey ? t(metric.unitKey) : undefined,
  hint: t(metric.hintKey),
  tone: metric.tone,
  breakdown: metric.breakdown?.map(item => ({
    key: item.key,
    label: t(item.labelKey),
    value: getStatusMetricBreakdownValue(item.key),
    tone: item.tone,
  })),
})))

const deviceStatusItems = computed<DeviceStatusItem[]>(() => liveDeviceStatusSources.value.map((source) => {
  const device = source.code === conveyorDeviceCode
    ? {
        ...source,
        statusKey: deviceStatusStore.conveyorStatusKey,
        valueKey: deviceStatusStore.conveyorStatusKey,
        tone: deviceStatusStore.conveyorTone,
      }
    : source

  return {
    name: t(device.nameKey),
    code: device.code,
    image: device.image,
    status: t(device.statusKey),
    label: t(device.labelKey),
    value: t(device.valueKey),
    tone: device.tone,
    warningGlow: warningGlowDeviceCodes.has(device.code) && device.statusKey === errorStatusKey,
    details: device.details?.map(detail => ({
      key: detail.key,
      label: t(detail.labelKey),
      value: detail.value ?? (detail.valueKey ? t(detail.valueKey) : ''),
      tone: detail.tone,
    })),
  }
}))

const alarms = computed<AlarmRow[]>(() => liveAlarmRows.value)
const openCriticalAlarmCount = computed(() => alarms.value.filter(alarm => alarm.unconfirmed).length)

const tasks = computed<TaskRow[]>(() => liveTaskSources.value
  .slice(0, taskDisplayLimit)
  .map(task => ({
    id: task.id,
    taskNumber: task.taskNumber,
    name: task.name ?? t(task.nameKey),
    start: task.start,
    end: task.end,
    total: task.total,
    okNg: task.okNg,
    rate: task.rate,
    status: t(task.statusKey),
    done: task.done,
  })))

const activeDeviceDetail = computed<DeviceDetailSource | undefined>(() =>
  liveDeviceDetailSources.value.find(device => device.code === activeDeviceCode.value)
  ?? liveDeviceDetailSources.value.find(device => activeDeviceCode.value === conveyorDeviceCode && device.type === 'conveyor'))
const graspRecordTotal = computed(() => liveGraspRecordTotal.value)
const visibleGraspRecordRows = computed<GraspRecordRow[]>(() => liveGraspRecordRows.value)

function openGraspRecordDialog(row: TaskRow): void {
  activeTaskId.value = row.id
  graspRecordCurrentPage.value = 1
  graspRecordDialogVisible.value = true

  void refreshGraspRecords()
}

function openDeviceDetailDialog(device: DeviceStatusItem): void {
  activeDeviceCode.value = device.code
  cameraDetailStreamUrl.value = device.code === cameraDeviceCode ? getCameraStreamUrl({ fps: 15 }) : ''
  deviceDetailDialogVisible.value = true
  resetDeviceDetail(device.code)
  startDeviceDetailRefresh()
}

function startDeviceDetailRefresh(): void {
  stopDeviceDetailRefresh()
  const refreshToken = ++deviceDetailRefreshToken

  void runDeviceDetailRefreshLoop(refreshToken)
}

function stopDeviceDetailRefresh(): void {
  deviceDetailRefreshToken += 1
  cameraDetailStreamUrl.value = ''

  if (deviceDetailTimer) {
    window.clearTimeout(deviceDetailTimer)
    deviceDetailTimer = undefined
  }
}

function closeDeviceDetailDialog(close: () => void): void {
  stopDeviceDetailRefresh()
  close()
}

function stopLiveDeviceStatusRefresh(): void {
  if (liveStatusTimer) {
    window.clearInterval(liveStatusTimer)
    liveStatusTimer = undefined
  }
}

function stopDashboardRefresh(): void {
  stopLiveDeviceStatusRefresh()
  stopDeviceDetailRefresh()
}

function handlePageExit(): void {
  stopDashboardRefresh()
}

async function runDeviceDetailRefreshLoop(refreshToken: number): Promise<void> {
  await refreshActiveDeviceDetail(refreshToken)

  if (refreshToken !== deviceDetailRefreshToken || !deviceDetailDialogVisible.value)
    return

  deviceDetailTimer = window.setTimeout(() => {
    void runDeviceDetailRefreshLoop(refreshToken)
  }, deviceDetailRefreshInterval)
}

async function refreshActiveDeviceDetail(refreshToken: number): Promise<void> {
  const deviceCode = activeDeviceCode.value

  if (refreshToken !== deviceDetailRefreshToken || !deviceDetailDialogVisible.value || !deviceCode)
    return

  await refreshDeviceDetail(deviceCode)
}

async function refreshDeviceDetail(deviceCode: string): Promise<void> {
  if (deviceCode === robotDeviceCode)
    return refreshRobotDetail()

  if (deviceCode === conveyorDeviceCode)
    return refreshConveyorDetail()

  if (deviceCode === cameraDeviceCode)
    return refreshCameraDetail()

  if (deviceCode === gripperDeviceCode)
    return refreshGripperDetail()

  if (deviceCode === binsDeviceCode)
    return refreshBinDetail()
}

function getBinProgressColor(tone: 'green' | 'blue' | 'red'): string {
  return binProgressColors[tone]
}

function openAlarmRecordSearch(alarm: AlarmRow): void {
  void router.push({
    name: 'AlarmRecordsPage',
    query: {
      type: alarm.alarmType,
    },
  })
}

function resetDeviceDetail(deviceCode: string): void {
  liveDeviceDetailSources.value = resetDeviceDetailSource(liveDeviceDetailSources.value, deviceDetailSources, deviceCode)
}

async function refreshLiveDeviceStatuses(): Promise<void> {
  const [plcSnapshot, robotSnapshot, cameraSnapshot, gripperSnapshot, binSnapshot] = await Promise.all([
    getPlcStatusSnapshot(),
    getRobotStatusSnapshot(),
    getCameraStatusSnapshot(),
    getGripperStatusSnapshot(),
    getBinStatusSnapshot(),
  ])

  deviceStatusStore.setConveyorStatusFromPlc(plcSnapshot.plc)

  liveDeviceStatusSources.value = mergeLiveDeviceStatusSources(liveDeviceStatusSources.value, {
    ...plcSnapshot,
    ...robotSnapshot,
    ...cameraSnapshot,
    ...gripperSnapshot,
    ...binSnapshot,
  })
}

async function refreshDashboardLiveData(): Promise<void> {
  await Promise.all([
    refreshLiveDeviceStatuses(),
    refreshGraspRecordStatistics(),
    refreshCriticalAlarms(),
  ])
}

async function runDashboardLiveDataRefresh(): Promise<void> {
  if (dashboardLiveDataRefreshing)
    return

  dashboardLiveDataRefreshing = true

  try {
    await refreshDashboardLiveData()
  }
  finally {
    dashboardLiveDataRefreshing = false
  }
}

async function refreshGraspRecordStatistics(): Promise<void> {
  try {
    liveGraspRecordStatistics.value = await fetchGraspRecordStatistics()
  }
  catch {
    liveGraspRecordStatistics.value = undefined
  }
}

async function refreshCriticalAlarms(): Promise<void> {
  try {
    const response = await fetchAlertPage({
      page: 1,
      page_size: criticalAlarmDisplayLimit,
      alert_level: 'critical',
    })

    liveAlarmRows.value = response.items.map(mapAlarmRow)
  }
  catch {
    liveAlarmRows.value = []
  }
}

async function refreshConveyorDetail(): Promise<void> {
  const snapshot = await getPlcStatusSnapshot()

  deviceStatusStore.setConveyorStatusFromPlc(snapshot.plc)

  liveDeviceDetailSources.value = mergeLiveDeviceDetails(liveDeviceDetailSources.value, snapshot)
}

async function refreshRobotDetail(): Promise<void> {
  const snapshot = await getRobotStatusSnapshot()

  liveDeviceDetailSources.value = mergeLiveDeviceDetails(liveDeviceDetailSources.value, snapshot)
}

async function refreshCameraDetail(): Promise<void> {
  const snapshot = await getCameraStatusSnapshot()

  liveDeviceDetailSources.value = mergeLiveDeviceDetails(liveDeviceDetailSources.value, snapshot)
}

async function refreshGripperDetail(): Promise<void> {
  const snapshot = await getGripperStatusSnapshot()

  liveDeviceDetailSources.value = mergeLiveDeviceDetails(liveDeviceDetailSources.value, snapshot)
}

async function refreshBinDetail(): Promise<void> {
  const snapshot = await getBinStatusSnapshot()

  liveDeviceDetailSources.value = mergeLiveDeviceDetails(liveDeviceDetailSources.value, snapshot)
}

async function refreshTaskList(): Promise<void> {
  try {
    const response = await fetchTaskPage({ page: 1, page_size: taskDisplayLimit })

    liveTaskSources.value = response.items.map(mapTaskSource)
  }
  catch {
    liveTaskSources.value = []
  }
}

async function refreshGraspRecords(): Promise<void> {
  if (!activeTaskId.value) {
    liveGraspRecordRows.value = []
    liveGraspRecordTotal.value = 0
    return
  }

  try {
    const response = await fetchTaskGraspRecords(activeTaskId.value, {
      page: graspRecordCurrentPage.value,
      page_size: graspRecordPageSize.value,
    })

    liveGraspRecordRows.value = response.items.map(mapGraspRecordRow)
    liveGraspRecordTotal.value = response.total
  }
  catch {
    liveGraspRecordRows.value = []
    liveGraspRecordTotal.value = 0
  }
}

function mapTaskSource(task: SortingTask): TaskSource {
  return {
    id: task.id,
    taskNumber: task.task_number,
    nameKey: '',
    name: task.task_name,
    start: formatClockTime(task.start_time),
    end: formatClockTime(task.end_time),
    total: formatInteger(task.total_count),
    okNg: `${formatInteger(task.ok_count)} / ${formatInteger(task.ng_count)}`,
    rate: `${formatNumber(task.yield_rate, 1)}%`,
    statusKey: getTaskStatusKey(task.status),
    done: task.status === 'completed',
  }
}

function mapGraspRecordRow(record: GraspRecord): GraspRecordRow {
  return {
    id: String(record.id),
    time: formatClockTime(record.time),
    material: record.material,
    coordinate: `X: ${formatNumber(record.coord_x, 1)} / Y: ${formatNumber(record.coord_y, 1)} / Z: ${formatNumber(record.coord_z, 1)}`,
    confidence: `${formatNumber(record.confidence, 1)}%`,
    targetBin: record.target_bin,
    duration: `${formatNumber(record.duration, 2)}s`,
    result: t(`dashboard.graspRecords.results.${record.result}`),
    success: record.result === 'success',
  }
}

function mapAlarmRow(record: AlertRecord): AlarmRow {
  return {
    key: String(record.id),
    alarmType: record.alert_type,
    time: formatClockTime(record.alert_time),
    level: record.alert_level_label || t('alarmRecords.levels.critical'),
    content: record.content || record.alert_type_label || '--',
    status: record.status_label || getAlarmStatusLabel(record.status),
    unconfirmed: record.status !== 'completed',
    tone: getAlarmTone(record.alert_level),
  }
}

function getAlarmTone(level: string): AlarmRow['tone'] {
  const toneMap: Record<string, AlarmRow['tone']> = {
    critical: 'red',
    info: 'blue',
    warning: 'yellow',
  }

  return toneMap[level] ?? 'red'
}

function getAlarmStatusLabel(status: string): string {
  const statusKeyMap: Record<string, string> = {
    completed: 'alarmRecords.statuses.completed',
    pending: 'alarmRecords.statuses.unhandled',
    processing: 'alarmRecords.statuses.processing',
  }

  return t(statusKeyMap[status] ?? 'alarmRecords.statuses.unhandled')
}

function getTaskStatusKey(status: TaskStatus): string {
  const statusKeyMap: Record<TaskStatus, string> = {
    completed: 'dashboard.taskStatus.completed',
    failed: 'dashboard.taskStatus.failed',
    pending: 'dashboard.taskStatus.pending',
    running: 'dashboard.taskStatus.running',
  }

  return statusKeyMap[status]
}

function formatClockTime(value: string | null): string {
  if (!value)
    return '--'

  return new Date(value).toLocaleTimeString('zh-CN', { hour12: false })
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number, fractionDigits: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)
}

function getStatusMetricValue(key: string): string {
  const view = graspRecordStatisticsView.value
  const metricValueMap: Record<string, string> = {
    accuracy: view.accuracyValue,
    duration: view.avgDurationValue,
    ng: view.ngValue,
    ok: view.okValue,
  }

  return metricValueMap[key] ?? '--'
}

function getStatusMetricBreakdownValue(key: string): string {
  const view = graspRecordStatisticsView.value
  const breakdownValueMap: Record<string, string> = {
    'ok-a': view.binAValue,
    'ok-b': view.binBValue,
  }

  return breakdownValueMap[key] ?? '--'
}

onMounted(() => {
  void runDashboardLiveDataRefresh()
  void refreshTaskList()
  liveStatusTimer = window.setInterval(() => {
    void runDashboardLiveDataRefresh()
  }, liveStatusRefreshInterval)
  window.addEventListener('beforeunload', handlePageExit)
  window.addEventListener('pagehide', handlePageExit)
})

watch([graspRecordCurrentPage, graspRecordPageSize], () => {
  if (graspRecordDialogVisible.value)
    void refreshGraspRecords()
})

watch(deviceDetailDialogVisible, (visible) => {
  if (!visible)
    stopDeviceDetailRefresh()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handlePageExit)
  window.removeEventListener('pagehide', handlePageExit)
  stopDashboardRefresh()
})
</script>

<template>
  <section class="dashboard-overview">
    <div class="dashboard-overview__main-card">
      <section class="status-panel">
        <div class="status-panel__state">
          <div class="status-panel__badge" :class="`is-${workstationStatus}`">
            <span>
              <el-icon>
                <Check v-if="workstationStatus === 'running'" />
                <Close v-else />
              </el-icon>
            </span>
          </div>
          <div>
            <p class="section-kicker">
              {{ t('dashboard.robotStatus.label') }}
            </p>
            <strong :class="`is-${workstationStatus}`">
              <span>{{ t(`dashboard.robotStatus.statuses.${workstationStatus}`) }}</span>
            </strong>
            <div class="status-panel__state-meta">
              <small>{{ t('dashboard.robotStatus.runtimeLabel') }} {{ t('dashboard.robotStatus.runtimeValue') }}</small>
            </div>
          </div>
        </div>

        <div class="status-panel__metrics">
          <article class="status-panel__total">
            <span>{{ t('dashboard.total.label') }}</span>
            <div class="status-panel__value">
              <strong>{{ graspRecordStatisticsView.totalValue }}</strong>
              <em>{{ t('dashboard.units.items') }}</em>
            </div>
            <small>{{ t('dashboard.total.hint', { value: graspRecordStatisticsView.yesterdayCompareValue }) }}</small>
          </article>

          <article
            v-for="metric in statusMetrics" :key="metric.key" class="status-panel__metric"
            :class="`is-${metric.tone}`"
          >
            <span>{{ metric.label }}</span>
            <div class="status-panel__value">
              <strong>{{ metric.value }}</strong>
              <em v-if="metric.unit">{{ metric.unit }}</em>
            </div>
            <div v-if="metric.breakdown" class="status-panel__breakdown">
              <span v-for="item in metric.breakdown" :key="item.key" :class="`text-${item.tone}`">
                {{ item.label }} {{ item.value }}
              </span>
            </div>
            <small v-else>{{ metric.hint }}</small>
          </article>
        </div>
      </section>

      <section class="panel device-status-panel">
        <header class="panel__header">
          <div>
            <h2>{{ t('dashboard.deviceStatus.title') }}</h2>
          </div>
        </header>

        <div class="device-status-panel__grid">
          <article
            v-for="device in deviceStatusItems" :key="device.code" class="device-status-card" :class="[
              `is-${device.tone}`,
              {
                'has-bin-details': device.details,
                'has-warning-glow': device.warningGlow,
              },
            ]"
          >
            <div class="device-status-card__head">
              <strong>{{ device.name }}</strong>
            </div>

            <div class="device-status-card__media">
              <img :src="device.image" :alt="device.name">
            </div>

            <div v-if="!device.details" class="device-status-card__number">
              <span>{{ t('dashboard.deviceFields.code') }}</span>
              <strong>{{ device.code }}</strong>
            </div>

            <div v-if="device.details" class="device-status-card__details">
              <div v-for="detail in device.details" :key="detail.key" class="device-status-card__detail-row">
                <span :class="`text-${detail.tone}`">{{ detail.label }}</span>
                <strong>{{ detail.value }}</strong>
              </div>
            </div>
            <div v-else class="device-status-card__operation">
              <span>{{ device.label }}</span>
              <strong :class="`is-${device.tone}`">
                <span class="state-dot" :class="`is-${device.tone}`" />
                {{ device.value }}
              </strong>
            </div>

            <el-button class="device-status-card__detail" type="primary" text @click="openDeviceDetailDialog(device)">
              <span>{{ t('dashboard.actions.detail') }}</span>
              <el-icon class="device-status-card__detail-icon">
                <ArrowRight />
              </el-icon>
            </el-button>
          </article>
        </div>
      </section>

      <section class="dashboard-overview__lower">
        <section class="panel task-panel">
          <header class="panel__header">
            <div>
              <h2>{{ t('dashboard.tasks.title') }}</h2>
            </div>
            <div class="panel__actions">
              <el-button type="primary" size="small" plain>
                {{ t('dashboard.actions.more') }}
              </el-button>
            </div>
          </header>

          <el-table class="task-panel__table" :data="tasks" size="small">
            <el-table-column prop="taskNumber" :label="t('dashboard.tasks.columns.id')" min-width="150" show-overflow-tooltip />
            <el-table-column
              prop="name" :label="t('dashboard.tasks.columns.name')" min-width="150"
              show-overflow-tooltip
            />
            <el-table-column prop="start" :label="t('dashboard.tasks.columns.start')" min-width="105" />
            <el-table-column prop="end" :label="t('dashboard.tasks.columns.end')" min-width="105" />
            <el-table-column prop="total" :label="t('dashboard.tasks.columns.total')" min-width="100" align="right" />
            <el-table-column prop="okNg" :label="t('dashboard.tasks.columns.okNg')" min-width="110" align="right" />
            <el-table-column prop="rate" :label="t('dashboard.tasks.columns.rate')" min-width="90" align="right">
              <template #default="{ row }">
                <span :class="row.done ? 'text-green' : 'text-red'">{{ row.rate }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="t('dashboard.tasks.columns.status')" min-width="105" align="right">
              <template #default="{ row }">
                <span class="task-panel__status">
                  <span class="state-dot" :class="row.done ? 'is-green' : 'is-red'" />
                  <span :class="row.done ? 'text-green' : 'text-red'">{{ row.status }}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="t('dashboard.tasks.columns.detail')" min-width="96" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  class="task-panel__detail" type="primary" text size="small"
                  @click="openGraspRecordDialog(row)"
                >
                  <span>{{ t('dashboard.actions.detail') }}</span>
                  <el-icon class="task-panel__detail-icon">
                    <ArrowRight />
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="panel alarm-panel">
          <header class="panel__header">
            <div>
              <h2>{{ t('dashboard.alarmPanel.title') }}</h2>
            </div>
            <el-tag type="danger" effect="plain" round>
              {{ t('dashboard.alarmPanel.unconfirmedCount', { count: openCriticalAlarmCount }) }}
            </el-tag>
          </header>
          <div class="alarm-panel__viewport">
            <div v-if="alarms.length" class="alarm-panel__track">
              <div v-for="groupIndex in 3" :key="groupIndex" class="alarm-panel__group" :aria-hidden="groupIndex !== 1">
                <button
                  v-for="alarm in alarms" :key="`${groupIndex}-${alarm.key}`" class="alarm-panel__row"
                  type="button" :aria-label="`${alarm.level} ${alarm.content}`" :tabindex="groupIndex === 1 ? 0 : -1"
                  @click="openAlarmRecordSearch(alarm)"
                >
                  <span class="state-dot" :class="`is-${alarm.tone}`" />
                  <time>{{ alarm.time }}</time>
                  <strong :class="`text-${alarm.tone}`">{{ alarm.level }}</strong>
                  <span>{{ alarm.content }}</span>
                  <em :class="alarm.unconfirmed ? 'text-red' : 'text-green'">{{ alarm.status }}</em>
                </button>
              </div>
            </div>
            <div v-else class="alarm-panel__empty">
              {{ t('dashboard.alarmPanel.empty') }}
            </div>
          </div>
        </section>
      </section>
    </div>

    <el-dialog
      v-model="deviceDetailDialogVisible" class="dashboard-dialog device-detail-dialog" width="860px"
      align-center :show-close="false" @close="stopDeviceDetailRefresh" @closed="stopDeviceDetailRefresh"
    >
      <template #header="{ close }">
        <header class="device-detail-dialog__header">
          <div class="device-detail-dialog__title">
            <h2>
              {{ activeDeviceDetail ? t('dashboard.deviceDetails.title', { device: t(activeDeviceDetail.nameKey) })
                : t('dashboard.deviceDetails.fallbackTitle') }}
            </h2>
          </div>
          <button
            class="device-detail-dialog__close" type="button" :aria-label="t('dashboard.deviceDetails.close')"
            @click="closeDeviceDetailDialog(close)"
          >
            <el-icon>
              <Close />
            </el-icon>
          </button>
        </header>
      </template>

      <div v-if="activeDeviceDetail" class="device-detail-dialog__shell">
        <div
          class="device-detail-dialog__body"
          :class="{ 'is-bin-detail': activeDeviceDetail.type === 'bins' }"
        >
          <aside v-if="activeDeviceDetail.type !== 'bins'" class="device-detail-dialog__identity">
            <div class="device-detail-dialog__identity-card">
              <div class="device-detail-dialog__media">
                <img :src="activeDeviceDetail.image" :alt="t(activeDeviceDetail.nameKey)">
              </div>

              <dl class="device-detail-dialog__identity-list">
                <div class="device-detail-dialog__identity-row">
                  <el-icon class="device-detail-dialog__identity-icon is-code">
                    <Document />
                  </el-icon>
                  <dt>{{ t('dashboard.deviceDetails.fields.code') }}</dt>
                  <dd>{{ activeDeviceDetail.code }}</dd>
                </div>
                <div class="device-detail-dialog__identity-row">
                  <el-icon class="device-detail-dialog__identity-icon is-status">
                    <CircleCheck />
                  </el-icon>
                  <dt>{{ t('dashboard.deviceDetails.fields.status') }}</dt>
                  <dd class="device-detail-dialog__status-value" :class="`is-${activeDeviceDetail.tone}`">
                    {{ t(activeDeviceDetail.statusKey) }}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <div class="device-detail-dialog__content">
            <section v-if="activeDeviceDetail.fields.length" class="device-detail-dialog__section">
              <h3>{{ t('dashboard.deviceDetails.sections.parameters') }}</h3>
              <div class="device-detail-dialog__facts is-parameter-list">
                <div v-for="field in activeDeviceDetail.fields" :key="field.key" class="device-detail-dialog__fact">
                  <span>{{ t(field.labelKey) }}</span>
                  <strong>{{ field.value }}</strong>
                </div>
              </div>
            </section>

            <section
              v-if="activeDeviceDetail.type === 'camera'"
              class="device-detail-dialog__section device-detail-dialog__stream-section"
            >
              <h3>{{ t('dashboard.deviceDetails.sections.cameraStream') }}</h3>
              <div class="device-detail-dialog__stream">
                <img
                  v-if="cameraDetailStreamUrl" :src="cameraDetailStreamUrl"
                  :alt="t('dashboard.deviceDetails.sections.cameraStream')"
                >
                <span v-else>{{ t('dashboard.deviceDetails.streamUnavailable') }}</span>
              </div>
            </section>

            <div
              v-if="activeDeviceDetail.tcpPose?.length || activeDeviceDetail.tcpWrench?.length"
              class="device-detail-dialog__split"
            >
              <section v-if="activeDeviceDetail.tcpPose?.length" class="device-detail-dialog__section">
                <h3>{{ t('dashboard.deviceDetails.sections.tcpPose') }}</h3>
                <div class="device-detail-dialog__metrics">
                  <div
                    v-for="field in activeDeviceDetail.tcpPose" :key="field.key"
                    class="device-detail-dialog__metric"
                  >
                    <span class="device-detail-dialog__metric-label">{{ t(field.labelKey) }}</span>
                    <span class="device-detail-dialog__metric-value">{{ field.value }}</span>
                  </div>
                </div>
              </section>

              <section v-if="activeDeviceDetail.tcpWrench?.length" class="device-detail-dialog__section">
                <h3>{{ t('dashboard.deviceDetails.sections.tcpWrench') }}</h3>
                <div class="device-detail-dialog__metrics">
                  <div
                    v-for="field in activeDeviceDetail.tcpWrench" :key="field.key"
                    class="device-detail-dialog__metric"
                  >
                    <span class="device-detail-dialog__metric-label">{{ t(field.labelKey) }}</span>
                    <span class="device-detail-dialog__metric-value">{{ field.value }}</span>
                  </div>
                </div>
              </section>
            </div>

            <section v-if="activeDeviceDetail.joints?.length" class="device-detail-dialog__section">
              <h3>{{ t('dashboard.deviceDetails.sections.joints') }}</h3>
              <el-table class="device-detail-dialog__table" :data="activeDeviceDetail.joints" size="small" border>
                <el-table-column
                  prop="joint" :label="t('dashboard.deviceDetails.columns.joint')" min-width="58"
                  align="center" header-align="center"
                />
                <el-table-column
                  prop="position" :label="t('dashboard.deviceDetails.columns.position')" min-width="96"
                  align="center" header-align="center"
                />
                <el-table-column
                  prop="torque" :label="t('dashboard.deviceDetails.columns.torque')" min-width="94"
                  align="center" header-align="center"
                />
                <el-table-column
                  prop="current" :label="t('dashboard.deviceDetails.columns.current')" min-width="98"
                  align="center" header-align="center"
                />
                <el-table-column
                  prop="temperature" :label="t('dashboard.deviceDetails.columns.temperature')"
                  min-width="116" align="center" header-align="center"
                />
              </el-table>
            </section>

            <section v-if="activeDeviceDetail.bins?.length" class="device-detail-dialog__section">
              <div class="device-detail-dialog__bins">
                <article
                  v-for="bin in activeDeviceDetail.bins" :key="bin.key" class="device-detail-dialog__bin"
                  :class="`is-${bin.tone}`"
                >
                  <div class="device-detail-dialog__bin-media">
                    <img :src="bin.image" :alt="t(bin.nameKey)">
                  </div>
                  <header>
                    <strong>{{ t(bin.nameKey) }}</strong>
                    <span>{{ bin.fillRate }}%</span>
                  </header>
                  <el-progress
                    :percentage="bin.fillRate" :stroke-width="8" :color="getBinProgressColor(bin.tone)"
                    :show-text="false"
                  />
                  <dl>
                    <div>
                      <dt>{{ t('dashboard.deviceDetails.fields.totalCapacity') }}</dt>
                      <dd>{{ bin.total }}</dd>
                    </div>
                    <div>
                      <dt>{{ t('dashboard.deviceDetails.fields.loaded') }}</dt>
                      <dd>{{ bin.loaded }}</dd>
                    </div>
                    <div>
                      <dt>{{ t('dashboard.deviceDetails.fields.fillRate') }}</dt>
                      <dd>{{ bin.fillRate }}%</dd>
                    </div>
                  </dl>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="graspRecordDialogVisible" class="dashboard-dialog grasp-record-dialog" width="920px"
      align-center :title="t('dashboard.graspRecords.title')"
    >
      <el-table class="grasp-record-dialog__table" :data="visibleGraspRecordRows" size="small" height="420" border>
        <el-table-column
          prop="time" :label="t('dashboard.graspRecords.columns.time')" min-width="105" align="center"
          header-align="center"
        />
        <el-table-column
          prop="material" :label="t('dashboard.graspRecords.columns.material')" min-width="100"
          align="center" header-align="center"
        />
        <el-table-column
          prop="coordinate" :label="t('dashboard.graspRecords.columns.coordinate')" min-width="175"
          align="center" header-align="center" show-overflow-tooltip
        />
        <el-table-column
          prop="confidence" :label="t('dashboard.graspRecords.columns.confidence')" min-width="90"
          align="center" header-align="center"
        />
        <el-table-column
          prop="targetBin" :label="t('dashboard.graspRecords.columns.targetBin')" min-width="110"
          align="center" header-align="center"
        />
        <el-table-column
          prop="duration" :label="t('dashboard.graspRecords.columns.duration')" min-width="85"
          align="center" header-align="center"
        />
        <el-table-column
          :label="t('dashboard.graspRecords.columns.result')" min-width="90" align="center"
          header-align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" effect="light">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <footer class="grasp-record-dialog__pagination">
        <span>{{ t('dashboard.graspRecords.summary.total', { total: graspRecordTotal }) }}</span>
        <el-pagination
          v-model:current-page="graspRecordCurrentPage" v-model:page-size="graspRecordPageSize" background
          layout="sizes, prev, pager, next, jumper" :page-sizes="graspRecordPageSizeOptions"
          :total="graspRecordTotal"
        />
      </footer>
    </el-dialog>
  </section>
</template>

<style scoped lang="scss">
.dashboard-overview {
  width: 100%;
  max-width: 100%;
  min-width: 0;

  &__main-card {
    display: grid;
    width: 100%;
    max-width: 100%;
    align-content: start;
    gap: 15px;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid #dde4ee;
    border-radius: var(--rf-radius-shell);
    background: var(--rf-color-surface);
    box-shadow: var(--rf-shadow-raised);
    padding: 20px;
  }

  &__lower {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
    gap: 22px;
    align-items: stretch;
  }
}

.panel,
.status-panel {
  min-width: 0;
  border-radius: var(--rf-radius-panel);
  background: #fff;
  box-shadow: var(--rf-shadow-panel);
}

.panel {
  padding: 15px 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;

    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
  }
}

.section-kicker {
  margin: 0;
  color: #7a8494;
  font-size: 13px;
  font-weight: 700;
}

.status-panel {
  display: grid;
  min-height: 122px;
  align-items: center;
  grid-template-columns: minmax(240px, 292px) minmax(0, 1fr);
  gap: 22px;
  padding: 12px 24px;

  &__state {
    display: flex;
    align-items: center;
    gap: 20px;

    strong {
      display: block;
      margin-top: 6px;
      color: #16a34a;
      font-size: 28px;
      line-height: 1;

      &.is-stopped {
        color: #64748b;
      }
    }

    small {
      display: block;
      color: #64748b;
      font-size: 13px;
    }
  }

  &__state-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-top: 8px;
  }

  &__badge {
    display: grid;
    width: 78px;
    height: 78px;
    place-items: center;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    background: #dcfce7;

    span {
      display: grid;
      width: 46px;
      height: 46px;
      place-items: center;
      border-radius: 999px;
      background: #22c55e;
      color: #fff;
      font-size: 23px;
      font-weight: 800;
    }

    .el-icon {
      font-size: 26px;
    }

    &.is-stopped {
      border-color: #e2e8f0;
      background: #f1f5f9;

      span {
        background: #94a3b8;
      }
    }
  }

  &__metrics {
    display: grid;
    align-items: stretch;
    grid-template-columns: minmax(170px, 1.15fr) repeat(4, minmax(122px, 1fr));
    gap: 10px;
  }

  &__total,
  &__metric {
    min-width: 0;
    border-radius: 12px;
    background: #f8fafd;
  }

  &__total {
    display: grid;
    min-height: 92px;
    align-content: center;
    padding: 14px 16px;

    span,
    em,
    small {
      color: #64748b;
      font-style: normal;
      font-size: 12px;
    }

    .status-panel__value {
      margin-top: 8px;
    }

    strong {
      color: var(--rf-color-blue);
      font-size: 30px;
      line-height: 1;
    }

    small {
      display: block;
      margin-top: 8px;
      color: #15803d;
      font-weight: 700;
    }
  }

  &__metric {
    display: grid;
    min-height: 92px;
    align-content: space-between;
    padding: 13px 14px;

    span,
    em,
    small {
      color: #64748b;
      font-style: normal;
      font-size: 12px;
    }

    small {
      display: block;
      font-size: 11px;
    }

    .status-panel__value {
      margin-top: 3px;
    }

    &.is-green strong {
      color: #15803d;
    }

    &.is-red strong {
      color: #be123c;
    }

    &.is-blue strong {
      color: #2563eb;
    }
  }

  &__value {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 4px;
    white-space: nowrap;

    strong {
      color: #111827;
      font-size: 23px;
      line-height: 1;
    }

    em {
      flex: 0 0 auto;
      color: #64748b;
      font-style: normal;
      font-size: 12px;
      font-weight: 700;
    }
  }

  &__breakdown {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    span {
      overflow: hidden;
      min-width: 0;
      font-size: 11px;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.device-status-panel {
  min-width: 0;
  overflow: hidden;

  &__grid {
    display: grid;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    // grid-auto-columns: 196px;
    grid-auto-flow: column;
    gap: 20px;
    align-items: stretch;
    overscroll-behavior-inline: contain;
    padding: 12px 15px;
    scrollbar-color: #cbd5e1 #f1f5f9;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 999px;
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #cbd5e1;
    }
  }
}

.device-status-card {
  position: relative;
  display: grid;
  grid-template-rows: auto 84px auto auto 26px;
  height: 248px;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  align-content: start;
  gap: 10px;
  // border: 1px solid #e4ebf4;
  border-radius: 10px;
  background: #f8fafd;
  // box-shadow: 0 10px 24px rgb(31 45 61 / 6%);
  padding: 15px 20px;
  transition:
    transform 180ms var(--rf-ease-out),
    border-color 180ms var(--rf-ease-out),
    box-shadow 180ms var(--rf-ease-out);

  &__media {
    position: relative;
    display: grid;
    height: 84px;
    place-items: center;
    overflow: hidden;

    img {
      display: block;
      max-width: 94%;
      max-height: 82px;
      object-fit: contain;
      filter: drop-shadow(0 10px 10px rgb(15 23 42 / 10%));
    }
  }

  &__head {
    display: block;
    min-width: 0;

    strong {
      display: block;
      overflow: hidden;
      color: #111827;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__number {
    display: flex;
    min-height: 24px;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding-top: 1px;
    white-space: nowrap;

    span {
      flex: 0 0 auto;
      color: #64748b;
      font-size: 11px;
    }

    strong {
      overflow: hidden;
      min-width: 0;
      color: #334155;
      font-size: 13px;
      line-height: 1;
      text-align: right;
      text-overflow: ellipsis;
    }
  }

  &__operation {
    display: flex;
    min-height: 24px;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    white-space: nowrap;

    > span {
      flex: 0 0 auto;
      color: #64748b;
      font-size: 11px;
      line-height: 1;
    }

    strong {
      display: inline-flex;
      min-width: 0;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      text-overflow: ellipsis;

      &.is-green {
        color: #15803d;
      }

      &.is-blue {
        color: #1d4ed8;
      }

      &.is-yellow {
        color: #b45309;
      }

      &.is-red {
        color: #b91c1c;
      }

      &.is-gray {
        color: #475569;
      }
    }
  }

  &__value {
    display: flex;
    min-height: 25px;
    min-width: 0;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    border-radius: 7px;
    background: rgb(255 255 255 / 72%);
    padding: 0 8px;
    white-space: nowrap;

    span {
      flex: 0 0 auto;
      color: #64748b;
      font-size: 11px;
    }

    strong {
      overflow: hidden;
      min-width: 0;
      color: #334155;
      font-size: 12px;
      line-height: 1;
      text-align: right;
      text-overflow: ellipsis;
    }
  }

  &__details {
    display: grid;
    min-width: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  &__detail-row {
    display: grid;
    min-height: 34px;
    min-width: 0;
    align-content: center;
    gap: 5px;

    span {
      overflow: hidden;
      min-width: 0;
      font-size: 11px;
      line-height: 1;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #334155;
      font-size: 14px;
      line-height: 1;
      text-align: center;
    }
  }

  &__detail {
    --el-button-active-bg-color: transparent;
    --el-button-active-border-color: transparent;
    --el-button-active-text-color: #2563eb;
    --el-button-bg-color: transparent;
    --el-button-border-color: transparent;
    --el-button-hover-bg-color: transparent;
    --el-button-hover-border-color: transparent;
    --el-button-hover-text-color: #2563eb;
    --el-button-text-color: #2563eb;

    position: relative;
    margin-top: 4px;
    width: fit-content;
    height: 26px;
    min-height: 26px;
    max-height: 26px;
    justify-self: center;
    box-sizing: border-box;
    overflow: hidden;
    gap: 2px;
    border: 0;
    background: transparent;
    color: #2563eb;
    cursor: pointer;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    padding: 0 4px;
    box-shadow: none;
    transition: none;

    &:hover,
    &:focus,
    &:active {
      border-color: transparent;
      background: transparent;
      color: #2563eb;
      box-shadow: none;
      transform: none;
    }

    &:focus-visible {
      outline: 2px solid rgb(37 99 235 / 35%);
      outline-offset: 2px;
    }
  }

  &__detail-icon {
    margin-left: 0;
    font-size: 12px;
  }

  &.is-green {
    border-color: #dcefe5;
  }

  &.is-blue {
    border-color: #dce8fa;
  }

  &.is-yellow {
    border-color: #f4e8c9;
  }

  &.is-red {
    border-color: #f3d8d8;
  }

  &.has-bin-details {
    grid-template-rows: auto 84px 1fr 26px;

    .device-status-card__detail {
      align-self: end;
    }
  }

  &.has-warning-glow {
    border-color: #ef4444;
    box-shadow:
      0 0 0 1px rgb(239 68 68 / 18%),
      0 0 22px rgb(239 68 68 / 24%),
      0 14px 28px rgb(127 29 29 / 12%);
    animation: warning-glow-pulse 1800ms ease-in-out infinite;
  }
}

@keyframes warning-glow-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgb(239 68 68 / 16%),
      0 0 18px rgb(239 68 68 / 18%),
      0 14px 28px rgb(127 29 29 / 10%);
  }

  50% {
    box-shadow:
      0 0 0 1px rgb(239 68 68 / 26%),
      0 0 30px rgb(239 68 68 / 34%),
      0 14px 30px rgb(127 29 29 / 14%);
  }
}

.task-panel__table {
  --el-table-header-bg-color: #f8fafd;
  --el-table-border-color: transparent;
  --task-table-body-min-height: 148px;

  width: 100%;
  min-height: calc(var(--task-table-body-min-height) + 39px);
  overflow: hidden;
  border-radius: 10px;
  font-size: 12px;

  :deep(.el-table__body-wrapper),
  :deep(.el-table__empty-block) {
    min-height: var(--task-table-body-min-height);
  }

  :deep(.el-table__cell) {
    padding: 8px 0;
  }
}

.task-panel__status {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  white-space: nowrap;
}

.task-panel__detail {
  height: 24px;
  padding: 0 4px;
  gap: 2px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.task-panel__detail-icon {
  margin-left: 0;
  font-size: 12px;
}

.dashboard-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #edf2f7;
    padding: 16px 18px 14px;
  }

  :deep(.el-dialog__title) {
    color: #172033;
    font-size: 16px;
    font-weight: 900;
  }

  :deep(.el-dialog__body) {
    padding: 14px 16px 16px;
  }
}

.device-detail-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 18px 46px rgb(15 23 42 / 14%);
  }

  :deep(.el-dialog__header) {
    border-bottom: 0;
    padding-bottom: 0;
  }

  :deep(.el-dialog__body) {
    background: #fff;
    padding: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eef2f7;
    padding: 0 10px 10px 10px;
  }

  &__title {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;

    h2 {
      overflow: hidden;
      margin: 0;
      color: #172033;
      font-size: 18px;
      font-weight: 800;
      line-height: 1.25;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__close {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    transition:
      background-color 160ms var(--rf-ease-out),
      color 160ms var(--rf-ease-out);

    &:hover,
    &:focus-visible {
      background: #f1f5f9;
      color: #172033;
    }
  }

  &__shell {
    display: grid;
    background: #fff;
  }

  &__body {
    display: grid;
    align-items: start;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 22px;
    padding-top: var(--el-dialog-padding-primary);

    &.is-bin-detail {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__identity {
    position: sticky;
    top: 0;
  }

  &__identity-card {
    display: grid;
    gap: 10px;
    border-radius: 12px;
    background: #f6f9fd;
    padding: 15px;
  }

  &__identity-list {
    display: grid;
    gap: 0;
    border: 1px solid #e8eef6;
    border-radius: 10px;
    background: #fff;
    margin: 0;
    overflow: hidden;
    box-shadow: 0 10px 22px rgb(15 23 42 / 5%);

    > div {
      min-width: 0;
    }

    dt,
    dd {
      margin: 0;
      line-height: 1.2;
    }

    dt {
      color: #475569;
      flex: 0 0 auto;
      font-size: 13px;
      font-weight: 400;
      white-space: nowrap;
    }

    dd {
      overflow: hidden;
      min-width: 0;
      color: #172033;
      font-size: 14px;
      font-weight: 400;
      justify-self: end;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__identity-row {
    display: grid;
    min-height: 45px;
    align-items: center;
    grid-template-columns: 26px max-content minmax(0, 1fr);
    gap: 5px;
    padding: 0 18px;

    + .device-detail-dialog__identity-row {
      border-top: 1px solid #eef2f7;
    }
  }

  &__identity-icon {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    font-size: 18px;

    &.is-code {
      color: #4f7fb5;
    }

    &.is-status {
      color: #22c55e;
    }
  }

  &__status-value {
    width: fit-content;
    border-radius: 6px;
    padding: 3px 9px;

    &.is-green {
      background: #dcfce7;
      color: #16a34a;
    }

    &.is-blue {
      background: #dbeafe;
      color: #2563eb;
    }

    &.is-yellow {
      background: #fef3c7;
      color: #b45309;
    }

    &.is-red {
      background: #fee2e2;
      color: #dc2626;
    }

    &.is-gray {
      background: #e2e8f0;
      color: #64748b;
    }
  }

  &__content {
    display: grid;
    max-height: calc(100vh - 190px);
    min-width: 0;
    overflow-y: auto;
    gap: 10px;
    padding-right: 2px;
    scrollbar-color: #cbd5e1 #f1f5f9;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 999px;
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #cbd5e1;
    }
  }

  &__media {
    display: grid;
    height: 198px;
    place-items: center;
    overflow: hidden;
    border-radius: 9px;
    background: transparent;

    img {
      display: block;
      max-width: 90%;
      max-height: 150px;
      object-fit: contain;
      filter: drop-shadow(0 10px 12px rgb(15 23 42 / 10%));
    }
  }

  &__facts {
    display: grid;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    &.is-parameter-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;

      .device-detail-dialog__fact {
        position: relative;
        display: grid;
        min-height: 56px;
        align-content: center;
        align-items: center;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        gap: 10px;
        padding: 0 14px;
        box-shadow: 0 8px 18px rgb(15 23 42 / 4%);

        &::before {
          display: block;
          width: 22px;
          height: 22px;
          border: 1px solid #bde7ff;
          border-radius: 999px;
          background: radial-gradient(circle at center, #10a8ff 0 2px, transparent 3px), #f0f9ff;
          content: '';
        }

        span {
          font-size: 13px;
        }

        strong {
          justify-self: end;
        }
      }
    }
  }

  &__fact,
  &__metric,
  &__bin {
    min-width: 0;
    border: 1px solid #eef2f7;
    border-radius: 9px;
    background: #f8fafd;
  }

  &__fact {
    display: grid;
    align-content: center;
    gap: 7px;
    min-height: 50px;
    padding: 9px 11px;

    span {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    strong {
      overflow: hidden;
      color: #172033;
      font-size: 14px;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__section {
    display: grid;
    gap: 10px;
    min-width: 0;
    border: 0;
    border-radius: 10px;
    background: #fff;
    padding: 12px;
    box-shadow: 0 10px 22px rgb(15 23 42 / 4%);

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #172033;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;

      &::before {
        width: 4px;
        height: 13px;
        flex: 0 0 4px;
        border-radius: 999px;
        background: #10a8ff;
        content: '';
      }
    }
  }

  &__stream {
    --device-camera-stream-height: 320px;

    display: grid;
    min-height: var(--device-camera-stream-height);
    place-items: center;
    overflow: hidden;
    border: 1px solid #e4edf7;
    border-radius: 10px;
    background:
      linear-gradient(90deg, rgb(226 232 240 / 60%) 1px, transparent 1px),
      linear-gradient(0deg, rgb(226 232 240 / 60%) 1px, transparent 1px), #172033;
    background-size: 18px 18px;

    img {
      display: block;
      width: 100%;
      height: var(--device-camera-stream-height);
      object-fit: cover;
    }

    span {
      color: #94a3b8;
      font-size: 13px;
      font-weight: 700;
    }
  }

  &__table {
    --el-table-border-color: #edf2f7;
    --el-table-header-bg-color: #f8fafd;
    --el-table-row-hover-bg-color: #f8fbff;

    overflow: hidden;
    border-radius: 9px;
    font-size: 12px;

    :deep(.el-table__cell) {
      padding: 7px 0;
    }

    :deep(.cell) {
      padding: 0 4px;
      white-space: nowrap;
    }

    :deep(th.el-table__cell) {
      color: #475569;
      font-size: 12px;
      font-weight: 900;
    }
  }

  &__split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  &__metrics {
    display: grid;
    min-width: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }

  &__metric {
    display: grid;
    min-height: 38px;
    align-content: center;
    gap: 5px;
    padding: 8px 10px;

    &-label {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    &-value {
      color: #172033;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  &__bins {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  &__bin {
    display: grid;
    gap: 8px;
    padding: 10px;

    :deep(.el-progress-bar__outer) {
      background-color: #e5edf7;
    }

    &-media {
      display: grid;
      min-height: 78px;
      place-items: center;
      border-radius: 8px;
      background: #fff;

      img {
        display: block;
        width: 72px;
        height: 56px;
        object-fit: contain;
      }
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      strong {
        color: #172033;
        font-size: 13px;
        font-weight: 800;
      }

      span {
        color: #334155;
        font-size: 14px;
        font-weight: 800;
      }
    }

    dl {
      display: grid;
      gap: 7px;
      margin: 0;
    }

    dl > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    dt,
    dd {
      margin: 0;
      font-size: 12px;
      line-height: 1.2;
    }

    dt {
      color: #64748b;
      font-weight: 700;
    }

    dd {
      color: #172033;
      font-weight: 900;
    }
  }
}

:global(.device-detail-dialog.el-dialog > .el-dialog__header),
:global(.device-detail-dialog .el-dialog__header) {
  padding-bottom: 0 !important;
}

.grasp-record-dialog {
  &__table {
    --el-table-border-color: #edf2f7;
    --el-table-header-bg-color: #f8fafd;
    --el-table-row-hover-bg-color: #f8fbff;

    border-radius: 10px;
    overflow: hidden;
    font-size: 12px;

    :deep(.el-table__cell) {
      padding: 9px 0;
    }

    :deep(th.el-table__cell) {
      color: #475569;
      font-size: 12px;
      font-weight: 900;
    }

    :deep(.el-tag) {
      min-width: 48px;
      justify-content: center;
      border-radius: 999px;
      font-weight: 800;
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid #edf2f7;
    margin-top: 12px;
    padding-top: 12px;

    span {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
  }
}

.alarm-panel {
  display: flex;
  flex-direction: column;

  &__viewport {
    flex: 1 1 0;
    height: 0;
    min-height: 0;
    overflow: hidden;

    &:hover,
    &:focus-within {
      .alarm-panel__track {
        animation-play-state: paused;
      }
    }
  }

  &__track {
    display: grid;
    animation: alarm-list-scroll 12s linear infinite;
    will-change: transform;
  }

  &__group {
    display: grid;
    gap: 4px;
    padding-bottom: 4px;
  }

  &__row {
    display: grid;
    width: 100%;
    height: 22px;
    align-items: center;
    border: 1px solid #eef2f7;
    border-radius: 7px;
    background: #f8fafd;
    color: inherit;
    cursor: pointer;
    font: inherit;
    grid-template-columns: 10px 58px 42px 1fr 64px;
    gap: 10px;
    padding: 0 14px;
    font-size: 10px;
    text-align: left;
    transition:
      border-color 160ms var(--rf-ease-out),
      background-color 160ms var(--rf-ease-out);

    &:hover,
    &:focus-visible {
      border-color: #bfdbfe;
      background: #f4f8ff;
    }

    time {
      color: #64748b;
    }

    em {
      font-style: normal;
      font-weight: 700;
      text-align: right;
    }
  }

  &__empty {
    display: grid;
    height: 100%;
    min-height: 108px;
    place-items: center;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
  }
}

@keyframes alarm-list-scroll {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-33.3333%);
  }
}

.state-dot {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--state-dot-color);

  &::after {
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: var(--state-dot-glow);
    content: '';
    opacity: 0.18;
    transform: scale(0.65);
    animation: state-dot-breathe 2400ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
    will-change: transform, opacity;
  }

  &.is-green {
    --state-dot-color: #22c55e;
    --state-dot-glow: rgb(34 197 94 / 22%);
  }

  &.is-blue {
    --state-dot-color: #2563eb;
    --state-dot-glow: rgb(37 99 235 / 20%);
  }

  &.is-yellow {
    --state-dot-color: #f59e0b;
    --state-dot-glow: rgb(245 158 11 / 24%);
  }

  &.is-red {
    --state-dot-color: #ef4444;
    --state-dot-glow: rgb(239 68 68 / 24%);
  }

  &.is-gray {
    --state-dot-color: #94a3b8;
    --state-dot-glow: transparent;

    &::after {
      display: none;
    }
  }
}

@keyframes state-dot-breathe {
  0%,
  100% {
    opacity: 0.16;
    transform: scale(0.65);
  }

  50% {
    opacity: 0.42;
    transform: scale(1.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .alarm-panel__track,
  .state-dot::after {
    animation: none;
  }

  .state-dot::after {
    opacity: 0.22;
    transform: scale(1);
  }
}

.text-green {
  color: #059669;
  font-weight: 700;
}

.text-blue {
  color: #2563eb;
  font-weight: 700;
}

.text-yellow {
  color: #b45309;
  font-weight: 700;
}

.text-red {
  color: #dc2626;
  font-weight: 700;
}

.text-gray {
  color: #64748b;
  font-weight: 700;
}

@media (max-width: 1440px) {
  .dashboard-overview {
    &__main-card {
      gap: 16px;
      padding: 18px;
    }

    &__lower {
      grid-template-columns: minmax(0, 1fr) minmax(320px, 340px);
      gap: 16px;
    }
  }

  .panel {
    padding: 15px 24px;
  }

  .status-panel {
    min-height: 118px;
    grid-template-columns: minmax(200px, 238px) minmax(0, 1fr);
    gap: 16px;
    padding: 12px 24px;

    &__badge {
      width: 66px;
      height: 66px;

      span {
        width: 40px;
        height: 40px;
      }
    }

    &__state {
      gap: 15px;

      strong {
        font-size: 24px;
      }
    }

    &__metrics {
      grid-template-columns: minmax(140px, 1.08fr) repeat(4, minmax(100px, 1fr));
      gap: 8px;
    }

    &__total,
    &__metric {
      min-height: 82px;
    }

    &__total {
      padding: 12px 14px;

      strong {
        font-size: 26px;
      }
    }

    &__metric {
      padding: 11px 12px;

      strong {
        font-size: 20px;
      }
    }
  }

  .device-status-panel__grid {
    grid-auto-columns: 184px;
    gap: 12px;
    padding-bottom: 10px;
  }

  .device-status-card {
    grid-template-rows: auto 74px auto auto 26px;
    height: 228px;
    gap: 8px;
    padding: 15px 20px;

    &__media {
      height: 74px;

      img {
        max-height: 72px;
      }
    }

    &__number,
    &__value,
    &__operation,
    &__detail-row {
      padding-inline: 0;
    }

    &.has-bin-details {
      grid-template-rows: auto 74px 1fr 26px;
    }
  }

  .device-detail-dialog {
    &__stream {
      --device-camera-stream-height: 280px;
    }
  }
}
</style>
