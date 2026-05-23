<script setup lang="ts">
import type { AlarmRecordFilterOptionSource, AlarmRecordFilters, AlarmRecordRow, AlarmRecordTagType } from './types'
import type { AlertEnumsResponse, AlertListQuery, AlertOption, AlertRecord } from '@/entities/alarm/types'
import type { AlarmType as DashboardAlarmType } from '@/shared/types/alarm'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { fetchAlertEnums, fetchAlertPage } from '@/services'
import {
  dashboardAlarmTypeToApiAlertType,
  fallbackAlarmLevelOptions,
  fallbackAlarmStatusOptions,
  fallbackAlarmTypeOptions,
} from './data'

const { t } = useI18n()
const route = useRoute()

const pageSizeOptions = [10, 20, 50]
const apiAlertTypeValues = new Set(fallbackAlarmTypeOptions.map(option => option.value))
const queryForm = reactive<AlarmRecordFilters>({
  type: '',
  level: '',
  status: '',
  timeRange: [],
})
const appliedFilters = shallowRef<AlarmRecordFilters>(createEmptyFilters())
const currentPage = shallowRef(1)
const pageSize = shallowRef(10)
const alertEnums = shallowRef<AlertEnumsResponse>()
const tableRows = shallowRef<AlarmRecordRow[]>([])
const totalRecords = shallowRef(0)
const tableLoading = shallowRef(false)
let alertListRefreshToken = 0

const alarmTypeSelectOptions = computed(() =>
  createSelectOptions(alertEnums.value?.alert_types, fallbackAlarmTypeOptions))
const alarmLevelSelectOptions = computed(() =>
  createSelectOptions(alertEnums.value?.alert_levels, fallbackAlarmLevelOptions))
const alarmStatusSelectOptions = computed(() =>
  createSelectOptions(alertEnums.value?.alert_statuses, fallbackAlarmStatusOptions))

onMounted(() => {
  void refreshAlertEnums()
})

watch(
  () => route.query.type,
  () => {
    applyRouteQueryFilters()
    refreshFirstPage()
  },
  { immediate: true },
)

watch([currentPage, pageSize], () => {
  void refreshAlertRecords()
})

function createEmptyFilters(): AlarmRecordFilters {
  return {
    type: '',
    level: '',
    status: '',
    timeRange: [],
  }
}

function createSelectOptions(
  apiOptions: AlertOption[] | undefined,
  fallbackOptions: AlarmRecordFilterOptionSource[],
): AlertOption[] {
  if (apiOptions?.length)
    return apiOptions

  return fallbackOptions.map(option => ({
    value: option.value,
    label: t(option.labelKey),
  }))
}

function cloneFilters(filters: AlarmRecordFilters): AlarmRecordFilters {
  return {
    type: filters.type,
    level: filters.level,
    status: filters.status,
    timeRange: filters.timeRange.length === 2 ? [...filters.timeRange] : [],
  }
}

function getRouteAlarmType(): AlarmRecordFilters['type'] {
  const routeType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type

  if (typeof routeType !== 'string')
    return ''

  if (isDashboardAlarmType(routeType))
    return dashboardAlarmTypeToApiAlertType[routeType]

  return apiAlertTypeValues.has(routeType) ? routeType : ''
}

function isDashboardAlarmType(value: string): value is DashboardAlarmType {
  return value in dashboardAlarmTypeToApiAlertType
}

function applyRouteQueryFilters(): void {
  const routeAlarmType = getRouteAlarmType()

  Object.assign(queryForm, {
    ...createEmptyFilters(),
    type: routeAlarmType,
  })
  appliedFilters.value = cloneFilters(queryForm)
}

async function refreshAlertEnums(): Promise<void> {
  try {
    alertEnums.value = await fetchAlertEnums()
  }
  catch {
    alertEnums.value = undefined
  }
}

async function refreshAlertRecords(): Promise<void> {
  const refreshToken = ++alertListRefreshToken
  tableLoading.value = true

  try {
    const response = await fetchAlertPage(buildAlertListQuery())

    if (refreshToken !== alertListRefreshToken)
      return

    tableRows.value = response.items.map(toTableRow)
    totalRecords.value = response.total
  }
  catch {
    if (refreshToken !== alertListRefreshToken)
      return

    tableRows.value = []
    totalRecords.value = 0
  }
  finally {
    if (refreshToken === alertListRefreshToken)
      tableLoading.value = false
  }
}

function buildAlertListQuery(): AlertListQuery {
  const [startTime, endTime] = appliedFilters.value.timeRange

  return {
    page: currentPage.value,
    page_size: pageSize.value,
    alert_type: appliedFilters.value.type || undefined,
    alert_level: appliedFilters.value.level || undefined,
    status: appliedFilters.value.status || undefined,
    start_time: toApiDateTime(startTime),
    end_time: toApiDateTime(endTime),
  }
}

function toApiDateTime(value?: string): string | undefined {
  return value ? value.replace(' ', 'T') : undefined
}

function toTableRow(record: AlertRecord): AlarmRecordRow {
  return {
    id: String(record.id),
    alarmTime: formatDateTime(record.alert_time),
    type: record.alert_type_label || getOptionLabel(record.alert_type, alarmTypeSelectOptions.value),
    level: record.alert_level_label || getOptionLabel(record.alert_level, alarmLevelSelectOptions.value),
    levelType: getLevelType(record.alert_level),
    content: getDisplayText(record.content),
    status: record.status_label || getOptionLabel(record.status, alarmStatusSelectOptions.value),
    statusType: getStatusType(record.status),
    handler: getDisplayText(record.handler),
    handledAt: formatDateTime(record.handle_time),
  }
}

function getOptionLabel(value: string, options: AlertOption[]): string {
  return options.find(option => option.value === value)?.label ?? value
}

function getDisplayText(value: string | null | undefined): string {
  return value?.trim() || '--'
}

function formatDateTime(value: string | null | undefined): string {
  return value ? value.replace('T', ' ') : '--'
}

function getLevelType(level: string): AlarmRecordTagType {
  const typeMap: Record<string, AlarmRecordTagType> = {
    critical: 'danger',
    info: 'info',
    warning: 'warning',
  }

  return typeMap[level] ?? 'info'
}

function getStatusType(status: string): AlarmRecordTagType {
  const typeMap: Record<string, AlarmRecordTagType> = {
    completed: 'success',
    pending: 'danger',
    processing: 'warning',
  }

  return typeMap[status] ?? 'info'
}

function refreshFirstPage(): void {
  if (currentPage.value === 1) {
    void refreshAlertRecords()
    return
  }

  currentPage.value = 1
}

function searchRecords(): void {
  appliedFilters.value = cloneFilters(queryForm)
  refreshFirstPage()
}

function resetRecords(): void {
  Object.assign(queryForm, createEmptyFilters())
  appliedFilters.value = createEmptyFilters()
  refreshFirstPage()
}
</script>

<template>
  <section class="alarm-records-view">
    <div class="alarm-records-view__main-card">
      <section class="alarm-records-query">
        <el-form :model="queryForm" label-position="top">
          <el-form-item :label="t('alarmRecords.filters.type')">
            <el-select
              v-model="queryForm.type"
              clearable
              filterable
              :placeholder="t('alarmRecords.placeholders.type')"
            >
              <el-option
                v-for="option in alarmTypeSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('alarmRecords.filters.level')">
            <el-select v-model="queryForm.level" clearable :placeholder="t('alarmRecords.placeholders.level')">
              <el-option
                v-for="option in alarmLevelSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('alarmRecords.filters.status')">
            <el-select v-model="queryForm.status" clearable :placeholder="t('alarmRecords.placeholders.status')">
              <el-option
                v-for="option in alarmStatusSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="is-time-range" :label="t('alarmRecords.filters.time')">
            <el-date-picker
              v-model="queryForm.timeRange"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              :start-placeholder="t('alarmRecords.placeholders.startTime')"
              :end-placeholder="t('alarmRecords.placeholders.endTime')"
            />
          </el-form-item>

          <div class="alarm-records-query__actions">
            <el-button type="primary" :icon="Search" @click="searchRecords">
              {{ t('alarmRecords.actions.search') }}
            </el-button>
            <el-button :icon="RefreshRight" @click="resetRecords">
              {{ t('alarmRecords.actions.reset') }}
            </el-button>
          </div>
        </el-form>
      </section>

      <section class="alarm-records-list">
        <el-table v-loading="tableLoading" class="alarm-records-list__table" :data="tableRows" border>
          <el-table-column prop="alarmTime" :label="t('alarmRecords.columns.alarmTime')" min-width="165" />
          <el-table-column prop="type" :label="t('alarmRecords.columns.type')" min-width="150" show-overflow-tooltip />
          <el-table-column :label="t('alarmRecords.columns.level')" min-width="96" align="center">
            <template #default="{ row }">
              <el-tag :type="row.levelType" effect="plain">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" :label="t('alarmRecords.columns.content')" min-width="230" show-overflow-tooltip />
          <el-table-column :label="t('alarmRecords.columns.status')" min-width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.statusType" effect="light">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handler" :label="t('alarmRecords.columns.handler')" min-width="105" />
          <el-table-column prop="handledAt" :label="t('alarmRecords.columns.handledAt')" min-width="165" />
        </el-table>

        <footer class="alarm-records-list__pagination">
          <span>{{ t('alarmRecords.summary.total', { total: totalRecords }) }}</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            background
            layout="sizes, prev, pager, next, jumper"
            :page-sizes="pageSizeOptions"
            :total="totalRecords"
          />
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped lang="scss">
.alarm-records-view {
  width: 100%;
  max-width: 100%;
  min-width: 0;

  &__main-card {
    display: grid;
    align-content: start;
    grid-template-rows: auto auto;
    gap: 16px;
    min-width: 0;
    border: 1px solid #dde4ee;
    border-radius: var(--rf-radius-shell);
    background: var(--rf-color-surface);
    box-shadow: var(--rf-shadow-raised);
    padding: 20px;
  }
}

.alarm-records-query,
.alarm-records-list {
  min-width: 0;
  border-radius: var(--rf-radius-panel);
  background: #ffffff;
  box-shadow: var(--rf-shadow-panel);
}

.alarm-records-query {
  padding: 16px 18px 14px;

  :deep(.el-form) {
    display: grid;
    grid-template-columns: minmax(150px, 1fr) minmax(130px, 0.78fr) minmax(130px, 0.78fr) minmax(290px, 1.55fr) auto;
    gap: 12px;
    align-items: end;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    color: #52627a;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 7px;
  }

  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 100%;
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, 82px);
    gap: 8px;

    .el-button {
      width: 100%;
      height: 32px;
      margin: 0;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
    }
  }
}

.alarm-records-list {
  display: grid;
  grid-template-rows: auto auto;
  overflow: hidden;
  padding: 14px;

  &__table {
    --el-table-border-color: #edf2f7;
    --el-table-header-bg-color: #f8fafd;
    --el-table-row-hover-bg-color: #f8fbff;

    width: 100%;
    border-radius: 10px;
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
      min-width: 56px;
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

@media (max-width: 1440px) {
  .alarm-records-view {
    &__main-card {
      gap: 14px;
      padding: 16px;
    }
  }

  .alarm-records-query {
    padding: 14px;

    :deep(.el-form) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    :deep(.is-time-range) {
      grid-column: span 2;
    }

    &__actions {
      align-self: end;
      justify-self: end;
    }
  }

  .alarm-records-list {
    padding: 12px;
  }
}
</style>
