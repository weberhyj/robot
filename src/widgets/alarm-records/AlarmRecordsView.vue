<script setup lang="ts">
import type { AlarmLevel, AlarmProcessStatus, AlarmRecordFilters, AlarmRecordRow, AlarmRecordSource, AlarmType } from './types'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { alarmLevelOptions, alarmRecordSources, alarmStatusOptions, alarmTypeOptions } from './data'

const { t } = useI18n()
const route = useRoute()

const pageSizeOptions = [10, 20, 50]
const queryForm = reactive<AlarmRecordFilters>({
  type: '',
  level: '',
  status: '',
  timeRange: [],
})
const appliedFilters = ref<AlarmRecordFilters>(createEmptyFilters())
const currentPage = ref(1)
const pageSize = ref(10)

const alarmTypeSelectOptions = computed(() => alarmTypeOptions.map(value => ({
  label: t(`alarmRecords.types.${value}`),
  value,
})))
const alarmLevelSelectOptions = computed(() => alarmLevelOptions.map(value => ({
  label: t(`alarmRecords.levels.${value}`),
  value,
})))
const alarmStatusSelectOptions = computed(() => alarmStatusOptions.map(value => ({
  label: t(`alarmRecords.statuses.${value}`),
  value,
})))

const filteredSources = computed(() => alarmRecordSources.filter(record => matchFilters(record, appliedFilters.value)))
const totalRecords = computed(() => filteredSources.value.length)
const tableRows = computed<AlarmRecordRow[]>(() => filteredSources.value
  .slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  .map(toTableRow))

watch(
  () => route.query.type,
  () => {
    applyRouteQueryFilters()
  },
  { immediate: true },
)

function createEmptyFilters(): AlarmRecordFilters {
  return {
    type: '',
    level: '',
    status: '',
    timeRange: [],
  }
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

  return alarmTypeOptions.includes(routeType as AlarmType)
    ? routeType as AlarmType
    : ''
}

function applyRouteQueryFilters(): void {
  const routeAlarmType = getRouteAlarmType()

  Object.assign(queryForm, {
    ...createEmptyFilters(),
    type: routeAlarmType,
  })
  appliedFilters.value = cloneFilters(queryForm)
  currentPage.value = 1
}

function matchFilters(record: AlarmRecordSource, filters: AlarmRecordFilters): boolean {
  const [startTime, endTime] = filters.timeRange

  return (!filters.type || record.type === filters.type)
    && (!filters.level || record.level === filters.level)
    && (!filters.status || record.status === filters.status)
    && (!startTime || record.alarmTime >= startTime)
    && (!endTime || record.alarmTime <= endTime)
}

function toTableRow(record: AlarmRecordSource): AlarmRecordRow {
  return {
    id: record.id,
    alarmTime: record.alarmTime,
    type: t(`alarmRecords.types.${record.type}`),
    level: t(`alarmRecords.levels.${record.level}`),
    levelType: getLevelType(record.level),
    content: t(record.contentKey),
    status: t(`alarmRecords.statuses.${record.status}`),
    statusType: getStatusType(record.status),
    handler: record.handler,
    handledAt: record.handledAt,
  }
}

function getLevelType(level: AlarmLevel): AlarmRecordRow['levelType'] {
  const typeMap: Record<AlarmLevel, AlarmRecordRow['levelType']> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info',
  }

  return typeMap[level]
}

function getStatusType(status: AlarmProcessStatus): AlarmRecordRow['statusType'] {
  const typeMap: Record<AlarmProcessStatus, AlarmRecordRow['statusType']> = {
    unhandled: 'danger',
    processing: 'warning',
    completed: 'success',
  }

  return typeMap[status]
}

function searchRecords(): void {
  appliedFilters.value = cloneFilters(queryForm)
  currentPage.value = 1
}

function resetRecords(): void {
  Object.assign(queryForm, createEmptyFilters())
  appliedFilters.value = createEmptyFilters()
  currentPage.value = 1
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
        <el-table class="alarm-records-list__table" :data="tableRows" border>
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
