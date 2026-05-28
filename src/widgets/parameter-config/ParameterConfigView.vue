<script setup lang="ts">
import type { ChangeRecordItem, ParameterDeviceKey } from './types'
import { Box, Delete, Edit, InfoFilled, Minus, Plus, RefreshRight, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  changeRecordItems,
  defaultParameterForm,
  instructionItems,
  parameterDeviceItems,
  speedPresetItems,
} from './data'
import { useBinParameterConfig } from './useBinParameterConfig'
import { useMaterialTypeConfig } from './useMaterialTypeConfig'

const { t } = useI18n()

const activeDevice = shallowRef<ParameterDeviceKey>('robot')
const parameterForm = reactive({ ...defaultParameterForm })
const {
  addBinPlaceholder,
  binChangeRecordRows,
  binDeletingId,
  binEnumsLoading,
  binListLoading,
  binParameterForm,
  binSaving,
  capacityLoading,
  capacitySaving,
  changeRecordCurrentPage,
  changeRecordLoading,
  changeRecordPageSize,
  changeRecordPageSizeOptions,
  changeRecordTotal,
  confirmDeleteBin,
  displayedBinItems,
  isEditingNewBin,
  resetBinCapacityRules,
  resetBinParameterForm,
  refreshBinEnums,
  resolvedBinTypeOptions,
  resolvedMaterialTypeOptions,
  saveBinParameters,
  selectBin,
} = useBinParameterConfig()
const {
  confirmDeleteMaterialType,
  isEditingMaterialType,
  materialDeletingId,
  materialDialogVisible,
  materialList,
  materialListLoading,
  materialSaving,
  materialTypeForm,
  openMaterialManager,
  refreshMaterials,
  saveMaterialType,
  startCreateMaterialType,
  startEditMaterialType,
} = useMaterialTypeConfig({ afterChange: refreshBinEnums })

const activeDeviceItem = computed(() => {
  return parameterDeviceItems.find(item => item.key === activeDevice.value) ?? parameterDeviceItems[0]
})

const changeRecordRows = computed<ChangeRecordItem[]>(() => activeDevice.value === 'bins' ? binChangeRecordRows.value : changeRecordItems)

const changeRecordTableLoading = computed(() => activeDevice.value === 'bins' && changeRecordLoading.value)

const isCapacityDisabled = computed(() => capacityLoading.value || capacitySaving.value || !binParameterForm.capacityDetectionEnabled)

function selectDevice(device: ParameterDeviceKey): void {
  activeDevice.value = device
}

function setRobotSpeed(value: number): void {
  parameterForm.robotSpeed = Math.min(100, Math.max(0, value))
}

function changeRobotSpeed(step: number): void {
  setRobotSpeed(parameterForm.robotSpeed + step)
}

function getPresetDashArray(value: number): string {
  const progress = Math.min(100, Math.max(0, value))
  return `${progress} 100`
}

function resetParameterDraft(): void {
  Object.assign(parameterForm, defaultParameterForm)
  resetBinParameterForm()
  ElMessage.success(t('parameters.messages.reset'))
}

function saveParameterDraft(): void {
  ElMessage.success(t('parameters.messages.saveDraft'))
}

async function applyParameters(): Promise<void> {
  if (activeDevice.value === 'bins') {
    await saveBinParameters()
    return
  }

  ElMessage.success(t('parameters.messages.apply'))
}
</script>

<template>
  <section class="parameter-config">
    <div class="parameter-config__main-card">
      <section class="parameter-panel device-picker" :aria-label="t('parameters.devicePicker.title')">
        <header class="parameter-panel__header device-picker__header">
          <div class="parameter-panel__title">
            <span aria-hidden="true" />
            <h2>{{ t('parameters.devicePicker.title') }}</h2>
          </div>

          <div class="device-picker__actions" role="group" :aria-label="t('parameters.actions.group')">
            <el-button size="small" :icon="RefreshRight" @click="resetParameterDraft">
              {{ t('parameters.actions.reset') }}
            </el-button>
            <el-button size="small" type="primary" plain @click="saveParameterDraft">
              {{ t('parameters.actions.saveDraft') }}
            </el-button>
            <el-button size="small" type="primary" :loading="activeDevice === 'bins' && (binSaving || capacitySaving)" @click="applyParameters">
              {{ t('parameters.actions.apply') }}
            </el-button>
          </div>
        </header>

        <div class="device-picker__grid">
          <button
            v-for="device in parameterDeviceItems"
            :key="device.key"
            class="device-picker__item"
            :class="{ 'is-active': activeDevice === device.key }"
            type="button"
            :aria-pressed="activeDevice === device.key"
            @click="selectDevice(device.key)"
          >
            <img :src="device.image" :alt="t(device.titleKey)">
            <strong>{{ t(device.titleKey) }}</strong>
          </button>
        </div>
      </section>

      <div v-if="activeDevice !== 'bins'" class="parameter-config__body">
        <section class="parameter-panel speed-panel">
          <header class="parameter-panel__header">
            <span aria-hidden="true" />
            <h2>{{ t('parameters.speedPanel.title', { device: t(activeDeviceItem.titleKey) }) }}</h2>
          </header>

          <div class="speed-panel__control">
            <div class="speed-panel__topline">
              <span>{{ t('parameters.speedPanel.speedLabel') }}</span>
            </div>

            <el-slider
              v-model="parameterForm.robotSpeed"
              class="speed-panel__slider"
              :min="0"
              :max="100"
              :step="1"
            />

            <div class="speed-panel__scale">
              <span>0%</span>
              <span>100%</span>
            </div>

            <div class="speed-panel__adjuster" :aria-label="t('parameters.speedPanel.adjuster')">
              <el-button :icon="Minus" @click="changeRobotSpeed(-5)" />
              <el-input-number
                v-model="parameterForm.robotSpeed"
                :min="0"
                :max="100"
                :step="5"
                controls-position="right"
              />
              <span>%</span>
              <el-button :icon="Plus" @click="changeRobotSpeed(5)" />
            </div>
          </div>

          <div class="speed-panel__presets">
            <button
              v-for="preset in speedPresetItems"
              :key="preset.value"
              type="button"
              :class="{ 'is-active': parameterForm.robotSpeed === preset.value }"
              @click="setRobotSpeed(preset.value)"
            >
              <svg class="speed-panel__preset-icon" aria-hidden="true" focusable="false" viewBox="0 0 20 20">
                <circle class="speed-panel__preset-track" cx="10" cy="10" r="6.5" pathLength="100" />
                <circle
                  class="speed-panel__preset-progress"
                  cx="10"
                  cy="10"
                  r="6.5"
                  pathLength="100"
                  :stroke-dasharray="getPresetDashArray(preset.value)"
                  transform="rotate(-90 10 10)"
                />
              </svg>
              {{ preset.value }}%
            </button>
          </div>

          <p class="speed-panel__hint">
            <el-icon :size="16">
              <InfoFilled />
            </el-icon>
            {{ t('parameters.speedPanel.hint') }}
          </p>
        </section>

        <aside class="parameter-panel instruction-panel">
          <header class="parameter-panel__header">
            <span aria-hidden="true" />
            <h2>{{ t('parameters.instructions.title') }}</h2>
          </header>

          <div class="instruction-panel__image">
            <img :src="activeDeviceItem.image" :alt="t(activeDeviceItem.titleKey)">
          </div>

          <ul>
            <li v-for="item in instructionItems" :key="item.key">
              {{ t(item.textKey) }}
            </li>
          </ul>
        </aside>
      </div>

      <section v-else class="parameter-panel bin-config-panel">
        <header class="parameter-panel__header">
          <span aria-hidden="true" />
          <h2>{{ t('parameters.binConfig.title') }}</h2>
        </header>

        <div class="bin-config-panel__layout">
          <aside v-loading="binListLoading" class="bin-config-panel__section bin-config-panel__list">
            <div class="bin-config-panel__section-header">
              <h3>{{ t('parameters.binConfig.listTitle') }}</h3>
              <el-button size="small" :icon="Plus" :disabled="binSaving" @click="addBinPlaceholder">
                {{ t('parameters.binConfig.addBin') }}
              </el-button>
            </div>

            <p v-if="isEditingNewBin" class="bin-config-panel__draft-hint">
              <el-icon :size="15">
                <InfoFilled />
              </el-icon>
              <span>{{ t('parameters.binConfig.messages.newDraftHint') }}</span>
            </p>

            <div
              v-for="bin in displayedBinItems"
              :key="bin.key"
              class="bin-config-panel__bin-item"
              :class="[`is-${bin.tone}`, { 'is-active': binParameterForm.activeBinKey === bin.key, 'is-draft': bin.isDraft }]"
              role="button"
              tabindex="0"
              :aria-pressed="binParameterForm.activeBinKey === bin.key"
              @click="selectBin(bin)"
              @keydown.enter.prevent="selectBin(bin)"
              @keydown.space.prevent="selectBin(bin)"
            >
              <img :src="bin.image" :alt="bin.code">
              <span>
                <strong>{{ bin.code }}</strong>
                <small :class="{ 'is-draft': bin.isDraft }">
                  {{ bin.isDraft ? t('parameters.binConfig.draftTag') : bin.calibrationLabel }}
                </small>
              </span>
              <em>{{ bin.typeLabel }}</em>
              <b aria-hidden="true">&gt;</b>
              <el-button
                class="bin-config-panel__delete"
                size="small"
                text
                type="danger"
                :icon="Delete"
                :aria-label="t('parameters.binConfig.deleteBin')"
                :disabled="!bin.id || binSaving"
                :loading="binDeletingId === bin.id"
                @click.stop="confirmDeleteBin(bin)"
              />
            </div>

            <p v-if="displayedBinItems.length === 0" class="bin-config-panel__empty">
              {{ t('parameters.binConfig.empty') }}
            </p>
          </aside>

          <section class="bin-config-panel__section bin-config-panel__basic">
            <div class="bin-config-panel__section-header">
              <h3>{{ t('parameters.binConfig.basicTitle') }}</h3>
            </div>

            <div class="bin-config-panel__form-grid">
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.name') }}</span>
                <el-input v-model="binParameterForm.code" size="small" />
              </label>
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.type') }}</span>
                <el-select v-model="binParameterForm.type" size="small" :loading="binEnumsLoading">
                  <el-option
                    v-for="option in resolvedBinTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </label>
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.maxCapacity') }}</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.maxCapacity" size="small" :min="0" :controls="false" />
                  <span>{{ t('parameters.binConfig.units.pieces') }}</span>
                </div>
              </label>
              <label class="bin-config-panel__field">
                <span class="bin-config-panel__field-label">
                  <span>{{ t('parameters.binConfig.fields.materialType') }}</span>
                  <el-button size="small" text type="primary" @click.prevent="openMaterialManager">
                    {{ t('parameters.binConfig.materialManager.entry') }}
                  </el-button>
                </span>
                <el-select v-model="binParameterForm.materialType" size="small" :loading="binEnumsLoading">
                  <el-option
                    v-for="option in resolvedMaterialTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </label>
            </div>

            <h4>{{ t('parameters.binConfig.fields.size') }}</h4>
            <div class="bin-config-panel__form-grid is-three">
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.length') }}</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.sizeX" size="small" :min="0" :controls="false" />
                  <span>mm</span>
                </div>
              </label>
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.width') }}</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.sizeY" size="small" :min="0" :controls="false" />
                  <span>mm</span>
                </div>
              </label>
              <label class="bin-config-panel__field">
                <span>{{ t('parameters.binConfig.fields.height') }}</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.sizeZ" size="small" :min="0" :controls="false" />
                  <span>mm</span>
                </div>
              </label>
            </div>

            <h4>{{ t('parameters.binConfig.fields.position') }}</h4>
            <div class="bin-config-panel__form-grid">
              <label class="bin-config-panel__field">
                <span>X</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.positionX" size="small" :precision="1" :controls="false" />
                  <span>mm</span>
                </div>
              </label>
              <label class="bin-config-panel__field">
                <span>Y</span>
                <div class="bin-config-panel__unit-input">
                  <el-input-number v-model="binParameterForm.positionY" size="small" :precision="1" :controls="false" />
                  <span>mm</span>
                </div>
              </label>
            </div>
          </section>

          <section v-loading="capacityLoading" class="bin-config-panel__section bin-config-panel__capacity">
            <div class="bin-config-panel__section-header">
              <h3>
                <el-icon :size="17">
                  <Box />
                </el-icon>
                {{ t('parameters.binConfig.capacityTitle') }}
              </h3>
              <label class="bin-config-panel__switch">
                <span>{{ t('parameters.binConfig.enableDetection') }}</span>
                <el-switch v-model="binParameterForm.capacityDetectionEnabled" size="small" :disabled="capacitySaving" />
              </label>
            </div>

            <div class="bin-config-panel__thresholds">
              <article class="bin-threshold is-warning">
                <div class="bin-threshold__heading">
                  <el-icon class="bin-threshold__icon" :size="22">
                    <WarningFilled />
                  </el-icon>
                  <strong>{{ t('parameters.binConfig.thresholds.warningTitle') }}</strong>
                  <span>{{ t('parameters.binConfig.thresholds.warningTrigger', { value: binParameterForm.warningThreshold }) }}</span>
                </div>

                <div class="bin-threshold__controls">
                  <div class="bin-threshold__slider">
                    <small>{{ t('parameters.binConfig.thresholds.setting') }}</small>
                    <el-slider
                      v-model="binParameterForm.warningThreshold"
                      :disabled="isCapacityDisabled"
                      :min="0"
                      :max="100"
                      :show-tooltip="false"
                    />
                    <div><span>0%</span><span>100%</span></div>
                  </div>
                  <label>
                    <span>{{ t('parameters.binConfig.thresholds.value') }}</span>
                    <el-select v-model="binParameterForm.warningThreshold" size="small" :disabled="isCapacityDisabled">
                      <el-option label="70%" :value="70" />
                      <el-option label="79%" :value="79" />
                      <el-option label="80%" :value="80" />
                      <el-option label="90%" :value="90" />
                    </el-select>
                  </label>
                  <label>
                    <span>{{ t('parameters.binConfig.thresholds.level') }}</span>
                    <el-select v-model="binParameterForm.warningLevel" size="small" :disabled="isCapacityDisabled">
                      <el-option :label="t('parameters.binConfig.levels.critical')" value="critical" />
                      <el-option :label="t('parameters.binConfig.levels.warning')" value="warning" />
                      <el-option :label="t('parameters.binConfig.levels.info')" value="info" />
                    </el-select>
                  </label>
                </div>
              </article>
            </div>

            <div class="bin-config-panel__capacity-footer">
              <p>
                <el-icon :size="15">
                  <InfoFilled />
                </el-icon>
                {{ t('parameters.binConfig.thresholds.tip') }}
              </p>
              <el-button size="small" :icon="RefreshRight" :loading="capacitySaving" @click="resetBinCapacityRules">
                {{ t('parameters.binConfig.restoreDefault') }}
              </el-button>
            </div>
          </section>
        </div>
      </section>

      <el-dialog
        v-model="materialDialogVisible"
        class="material-manager-dialog"
        width="860px"
        align-center
        :teleported="false"
      >
        <template #header>
          <strong class="material-manager-dialog__title">{{ t('parameters.binConfig.materialManager.title') }}</strong>
        </template>

        <div class="material-manager-dialog__body">
          <section class="material-manager-dialog__form">
            <header>
              <h3>
                {{ t(isEditingMaterialType ? 'parameters.binConfig.materialManager.editTitle' : 'parameters.binConfig.materialManager.createTitle') }}
              </h3>
              <el-button v-if="isEditingMaterialType" size="small" :icon="Plus" @click="startCreateMaterialType">
                {{ t('parameters.binConfig.materialManager.actions.new') }}
              </el-button>
            </header>

            <div class="material-manager-dialog__form-grid">
              <label>
                <span>{{ t('parameters.binConfig.materialManager.fields.code') }}</span>
                <el-input v-model="materialTypeForm.code" size="small" />
              </label>
              <label>
                <span>{{ t('parameters.binConfig.materialManager.fields.name') }}</span>
                <el-input v-model="materialTypeForm.name" size="small" />
              </label>
              <label>
                <span>{{ t('parameters.binConfig.materialManager.fields.sortOrder') }}</span>
                <el-input-number v-model="materialTypeForm.sortOrder" size="small" :min="0" :precision="0" :controls="false" />
              </label>
              <label class="material-manager-dialog__switch">
                <span>{{ t('parameters.binConfig.materialManager.fields.enabled') }}</span>
                <el-switch v-model="materialTypeForm.enabled" size="small" />
              </label>
              <label class="is-wide">
                <span>{{ t('parameters.binConfig.materialManager.fields.description') }}</span>
                <el-input v-model="materialTypeForm.description" size="small" :rows="2" type="textarea" />
              </label>
            </div>

            <el-button type="primary" size="small" :loading="materialSaving" @click="saveMaterialType">
              {{ t(isEditingMaterialType ? 'parameters.binConfig.materialManager.actions.save' : 'parameters.binConfig.materialManager.actions.create') }}
            </el-button>
          </section>

          <section class="material-manager-dialog__table">
            <header>
              <h3>{{ t('parameters.binConfig.materialManager.listTitle') }}</h3>
              <el-button size="small" :icon="RefreshRight" :loading="materialListLoading" @click="refreshMaterials">
                {{ t('parameters.binConfig.materialManager.actions.refresh') }}
              </el-button>
            </header>

            <el-table v-loading="materialListLoading" :data="materialList" size="small" border>
              <el-table-column prop="code" :label="t('parameters.binConfig.materialManager.fields.code')" min-width="120" />
              <el-table-column prop="name" :label="t('parameters.binConfig.materialManager.fields.name')" min-width="120" />
              <el-table-column prop="description" :label="t('parameters.binConfig.materialManager.fields.description')" min-width="160">
                <template #default="{ row }">
                  {{ row.description || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="sort_order" :label="t('parameters.binConfig.materialManager.fields.sortOrder')" width="92" align="center" />
              <el-table-column prop="enabled" :label="t('parameters.binConfig.materialManager.fields.enabled')" width="96" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                    {{ t(row.enabled ? 'parameters.binConfig.materialManager.status.enabled' : 'parameters.binConfig.materialManager.status.disabled') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('parameters.binConfig.materialManager.fields.actions')" width="144" align="center">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" :icon="Edit" @click="startEditMaterialType(row)">
                    {{ t('parameters.binConfig.materialManager.actions.edit') }}
                  </el-button>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    :icon="Delete"
                    :loading="materialDeletingId === row.id"
                    @click="confirmDeleteMaterialType(row)"
                  >
                    {{ t('parameters.binConfig.materialManager.actions.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-dialog>

      <section class="parameter-panel change-record">
        <header class="parameter-panel__header">
          <span aria-hidden="true" />
          <h2>{{ t('parameters.changeRecord.title') }}</h2>
        </header>

        <el-table v-loading="changeRecordTableLoading" class="change-record__table" :data="changeRecordRows" size="small" border>
          <el-table-column prop="parameterKey" :label="t('parameters.changeRecord.columns.parameter')" min-width="160">
            <template #default="{ row }">
              {{ row.parameterLabel ?? t(row.parameterKey) }}
            </template>
          </el-table-column>
          <el-table-column prop="originalValue" :label="t('parameters.changeRecord.columns.originalValue')" min-width="130" />
          <el-table-column prop="currentValue" :label="t('parameters.changeRecord.columns.currentValue')" min-width="130" />
          <el-table-column prop="changedAt" :label="t('parameters.changeRecord.columns.changedAt')" min-width="180" />
          <el-table-column prop="operatorKey" :label="t('parameters.changeRecord.columns.operator')" min-width="140">
            <template #default="{ row }">
              {{ row.operatorLabel ?? t(row.operatorKey) }}
            </template>
          </el-table-column>
          <el-table-column prop="remarkKey" :label="t('parameters.changeRecord.columns.remark')" min-width="220">
            <template #default="{ row }">
              {{ row.remarkLabel ?? t(row.remarkKey) }}
            </template>
          </el-table-column>
        </el-table>

        <footer v-if="activeDevice === 'bins'" class="change-record__pagination">
          <span>{{ t('parameters.changeRecord.total', { total: changeRecordTotal }) }}</span>
          <el-pagination
            v-model:current-page="changeRecordCurrentPage"
            v-model:page-size="changeRecordPageSize"
            background
            layout="sizes, prev, pager, next, jumper"
            :page-sizes="changeRecordPageSizeOptions"
            :total="changeRecordTotal"
          />
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped lang="scss">
.parameter-config {
  min-width: 0;

  &__main-card {
    display: grid;
    align-content: start;
    gap: 18px;
    min-height: calc(100vh - 154px);
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(320px, 0.98fr);
    gap: 18px;
  }
}

.parameter-panel {
  border: 1px solid #dde6f1;
  border-radius: 12px;
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--rf-shadow-panel);
  padding: 10px 22px 15px;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 32px;
    margin-bottom: 10px;

    > span {
      width: 4px;
      height: 18px;
      flex: 0 0 4px;
      border-radius: 999px;
      background: #10a8ff;
    }

    h2 {
      margin: 0;
      color: #172033;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0;
      line-height: 1.2;
    }
  }

  &__title {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;

    > span {
      width: 4px;
      height: 18px;
      flex: 0 0 4px;
      border-radius: 999px;
      background: #10a8ff;
    }
  }
}

.device-picker {
  padding-bottom: 15px;

  &__header {
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-left: auto;

    :deep(.el-button) {
      height: 32px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      margin-left: 0;
      padding: 0 12px;
    }

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  &__item {
    position: relative;
    display: flex;
    height: 66px;
    min-width: 0;
    align-items: center;
    gap: 13px;
    border: 1px solid #dfe7f2;
    border-radius: 8px;
    background: #f8fafd;
    color: #223047;
    padding: 0 15px;
    text-align: left;
    transition:
      border-color 160ms var(--rf-ease-out),
      box-shadow 160ms var(--rf-ease-out),
      background-color 160ms var(--rf-ease-out),
      transform 160ms var(--rf-ease-out);

    &:hover,
    &.is-active {
      border-color: #65a3ff;
      background: #f4f8ff;
      box-shadow: 0 12px 24px -20px rgb(37 99 235 / 54%);
      transform: translateY(-1px);
    }

    img {
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
      object-fit: contain;
    }

    strong {
      overflow: hidden;
      color: inherit;
      font-size: 14px;
      font-weight: 900;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.speed-panel {
  min-height: 338px;
  padding: 10px 22px 15px;

  &__control {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 174px;
    column-gap: 48px;
    row-gap: 0;
    align-items: center;
    padding: 8px 0 0 18px;
  }

  &__topline {
    display: contents;

    span {
      grid-column: 1;
      color: #172033;
      font-size: 14px;
      font-weight: 800;
    }
  }

  &__slider {
    grid-column: 1;
    margin-top: 4px;

    :deep(.el-slider__runway) {
      height: 8px;
      border-radius: 999px;
      background: #dce6f2;
    }

    :deep(.el-slider__bar) {
      height: 8px;
      border-radius: 999px;
      background: #1479ff;
    }

    :deep(.el-slider__button) {
      width: 19px;
      height: 19px;
      border: 4px solid #fff;
      background: #1479ff;
      box-shadow: 0 4px 12px rgb(20 121 255 / 34%);
    }
  }

  &__scale {
    display: flex;
    grid-column: 1;
    justify-content: space-between;
    margin-top: -12px;
    color: #74849a;
    font-size: 13px;
    font-weight: 800;
  }

  &__adjuster {
    display: grid;
    grid-row: 2 / span 2;
    grid-column: 2;
    grid-template-columns: 38px 56px 40px 38px;
    align-items: center;
    overflow: hidden;
    border: 1px solid #dce6f2;
    border-radius: 10px;
    background: #fff;

    .el-button {
      height: 38px;
      border: 0;
      border-radius: 0;
      color: #5f6f86;
      margin: 0;
    }

    :deep(.el-input-number) {
      width: 56px;
    }

    :deep(.el-input-number__decrease),
    :deep(.el-input-number__increase) {
      display: none;
    }

    :deep(.el-input__wrapper) {
      height: 38px;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
    }

    :deep(.el-input__inner) {
      color: #172033;
      font-size: 15px;
      font-weight: 900;
      text-align: center;
    }

    > span {
      display: grid;
      height: 38px;
      place-items: center;
      border-right: 1px solid #dce6f2;
      border-left: 1px solid #dce6f2;
      color: #7a8aa0;
      font-size: 14px;
      font-weight: 900;
    }
  }

  &__presets {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-top: 28px;
    padding: 0 16px 0 14px;

    button {
      display: flex;
      height: 48px;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 1px solid #dfe7f2;
      border-radius: 8px;
      background: #fff;
      color: #415168;
      font-size: 14px;
      font-weight: 900;
      transition:
        border-color 160ms var(--rf-ease-out),
        color 160ms var(--rf-ease-out),
        background-color 160ms var(--rf-ease-out);

      &:hover,
      &.is-active {
        border-color: #9fc5ff;
        background: #f5f9ff;
        color: #1479ff;
      }

      .speed-panel__preset-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        overflow: visible;
      }

      .speed-panel__preset-track,
      .speed-panel__preset-progress {
        fill: none;
        stroke-width: 2.4;
      }

      .speed-panel__preset-track {
        stroke: #d9e8fb;
      }

      .speed-panel__preset-progress {
        stroke: #1479ff;
        stroke-linecap: round;
      }
    }
  }

  &__hint {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 520px;
    border-radius: 8px;
    background: #edf5ff;
    color: #697a91;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.6;
    margin: 18px 0 0 14px;
    padding: 8px 13px;

    .el-icon {
      color: #4f8fff;
    }
  }
}

.bin-config-panel {
  min-height: 338px;
  padding: 10px 22px 15px;

  &__layout {
    display: grid;
    grid-template-columns: minmax(248px, 0.78fr) minmax(360px, 1.16fr) minmax(410px, 1.24fr);
    gap: 16px;
  }

  &__section {
    min-width: 0;
    border: 1px solid #e2eaf4;
    border-radius: 10px;
    background: #fff;
    padding: 14px 16px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 32px;
    margin-bottom: 16px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #172033;
      font-size: 14px;
      font-weight: 900;
      line-height: 1;
      margin: 0;
    }

    .el-button {
      height: 30px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      margin-left: 0;
    }

    .el-icon {
      color: #397dff;
    }
  }

  &__list {
    display: grid;
    align-content: start;
    gap: 12px;
  }

  &__draft-hint {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    border: 1px solid #c7dcff;
    border-radius: 8px;
    background: #f2f7ff;
    color: #4f6688;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.45;
    margin: -6px 0 0;
    padding: 8px 10px;

    .el-icon {
      flex: 0 0 auto;
      color: #397dff;
      margin-top: 1px;
    }
  }

  &__bin-item {
    display: grid;
    min-height: 82px;
    grid-template-columns: 58px minmax(0, 1fr) auto 14px 28px;
    align-items: center;
    gap: 12px;
    border: 1px solid #e1e9f4;
    border-radius: 8px;
    background: #fff;
    color: #223047;
    cursor: pointer;
    padding: 10px 12px;
    text-align: left;
    transition:
      border-color 160ms var(--rf-ease-out),
      background-color 160ms var(--rf-ease-out),
      box-shadow 160ms var(--rf-ease-out),
      transform 160ms var(--rf-ease-out);

    &:hover,
    &.is-active {
      border-color: #82b4ff;
      background: #f7fbff;
      box-shadow: 0 16px 26px -22px rgb(37 99 235 / 56%);
      transform: translateY(-1px);
    }

    &.is-draft {
      border-color: #5f9fff;
      background: linear-gradient(180deg, #f7fbff 0%, #fff 100%);
      box-shadow:
        0 0 0 1px rgb(95 159 255 / 18%),
        0 18px 28px -24px rgb(37 99 235 / 62%);
      animation: bin-draft-pop 260ms var(--rf-ease-out);
    }

    &.is-gray {
      img {
        filter: grayscale(1) opacity(0.72);
      }

      em {
        background: #f2f5f8;
        color: #6f7f92;
      }
    }

    &.is-red {
      img {
        filter: hue-rotate(135deg) saturate(1.55);
      }

      em {
        background: #fff0f0;
        color: #f04444;
      }
    }

    img {
      width: 52px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 10px 14px rgb(45 85 140 / 13%));
    }

    span {
      display: grid;
      min-width: 0;
      gap: 7px;
    }

    strong {
      overflow: hidden;
      color: #1f2d43;
      font-size: 14px;
      font-weight: 900;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #2dbb7f;
      font-size: 13px;
      font-weight: 900;
      line-height: 1;

      &.is-draft {
        color: #2563eb;
      }
    }

    em {
      border-radius: 7px;
      background: #eef8f2;
      color: #24aa72;
      font-size: 12px;
      font-style: normal;
      font-weight: 900;
      line-height: 1;
      padding: 6px 8px;
      white-space: nowrap;
    }

    b {
      color: #7aa8ee;
      font-size: 20px;
      font-weight: 500;
      line-height: 1;
    }
  }

  &__delete {
    justify-self: end;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    margin-left: 0;

    :deep(.el-icon) {
      color: #ef4444;
    }
  }

  &__empty {
    display: grid;
    min-height: 82px;
    place-items: center;
    border: 1px dashed #d8e2ee;
    border-radius: 8px;
    color: #7b8ca2;
    font-size: 13px;
    font-weight: 800;
    margin: 0;
  }

  &__form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 16px;

    &.is-three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
  }

  &__field {
    display: grid;
    min-width: 0;
    gap: 7px;

    > span {
      color: #64748a;
      font-size: 12px;
      font-weight: 900;
      line-height: 1;
    }
  }

  &__field-label {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.el-button) {
      height: 20px;
      flex: 0 0 auto;
      font-size: 12px;
      font-weight: 900;
      padding: 0;
    }
  }

  h4 {
    color: #223047;
    font-size: 13px;
    font-weight: 900;
    line-height: 1;
    margin: 18px 0 10px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 34px;
    border-radius: 7px;
    box-shadow: 0 0 0 1px #dfe7f2 inset;
  }

  :deep(.el-input-number) {
    width: 100%;
  }

  :deep(.el-input-number .el-input__inner) {
    text-align: left;
  }

  &__unit-input {
    display: grid;
    overflow: hidden;
    grid-template-columns: minmax(0, 1fr) 42px;
    align-items: center;
    border: 1px solid #dfe7f2;
    border-radius: 7px;
    background: #fff;

    :deep(.el-input__wrapper) {
      min-height: 32px;
      box-shadow: none;
    }

    > span {
      display: grid;
      height: 34px;
      place-items: center;
      border-left: 1px solid #dfe7f2;
      background: #f7f9fc;
      color: #6d7c91;
      font-size: 12px;
      font-weight: 800;
    }
  }

  &__capacity {
    display: grid;
    align-content: start;
  }

  &__switch {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #63758c;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  &__thresholds {
    display: grid;
    gap: 14px;
  }

  &__capacity-footer {
    display: grid;
    gap: 10px;
    margin-top: 14px;

    p {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      background: #edf5ff;
      color: #68798f;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.5;
      margin: 0;
      padding: 9px 11px;
    }

    .el-icon {
      flex: 0 0 auto;
      color: #3b82ff;
    }

    .el-button {
      justify-self: end;
      height: 30px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
    }
  }
}

.material-manager-dialog {
  :deep(.el-dialog) {
    overflow: hidden;
    border-radius: 10px;
  }

  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #edf2f7;
    padding: 16px 18px 14px;
  }

  :deep(.el-dialog__body) {
    padding: 16px 18px 18px;
  }

  &__title {
    color: #172033;
    font-size: 16px;
    font-weight: 900;
    line-height: 1;
  }

  &__body {
    display: grid;
    grid-template-columns: 278px minmax(0, 1fr);
    gap: 16px;
    min-width: 0;
  }

  &__form,
  &__table {
    min-width: 0;
    border-radius: 9px;
    background: #f8fafd;
    padding: 13px;

    > header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 30px;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        color: #172033;
        font-size: 14px;
        font-weight: 900;
        line-height: 1;
      }

      .el-button {
        height: 28px;
        margin-left: 0;
        border-radius: 7px;
        font-size: 12px;
        font-weight: 800;
      }
    }
  }

  &__form {
    align-content: start;
    display: grid;
    gap: 12px;

    > .el-button {
      justify-self: end;
      height: 30px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 800;
    }
  }

  &__form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px 12px;

    label {
      display: grid;
      min-width: 0;
      gap: 7px;

      > span {
        color: #64748a;
        font-size: 12px;
        font-weight: 900;
        line-height: 1;
      }
    }

    .is-wide {
      grid-column: 1 / -1;
    }

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      border-radius: 7px;
      box-shadow: 0 0 0 1px #dfe7f2 inset;
    }

    :deep(.el-input-number) {
      width: 100%;
    }

    :deep(.el-input-number .el-input__inner) {
      text-align: left;
    }
  }

  &__switch {
    align-content: start;

    :deep(.el-switch) {
      height: 28px;
    }
  }

  &__table {
    :deep(.el-table) {
      overflow: hidden;
      border-radius: 8px;
      font-size: 12px;
    }

    :deep(.el-table__cell) {
      color: #506078;
      font-weight: 800;
      padding: 7px 0;
    }

    :deep(th.el-table__cell) {
      color: #6c7b8f;
      font-size: 12px;
      font-weight: 900;
    }

    :deep(.el-button) {
      margin-left: 0;
      padding: 0 3px;
    }
  }
}

@keyframes bin-draft-pop {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bin-config-panel__bin-item.is-draft {
    animation: none;
  }
}

.bin-threshold {
  display: grid;
  gap: 16px;
  padding: 10px 0;

  &__icon {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 999px;
    background: #fff4e7;
    color: #ff9500;
  }

  &__heading {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;

    strong {
      flex: 0 0 auto;
      color: #172033;
      font-size: 14px;
      font-weight: 900;
      line-height: 1.1;
      white-space: nowrap;
    }

    span {
      min-width: 0;
      color: #7b8ca2;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.35;
      white-space: nowrap;
    }
  }

  &__controls {
    display: grid;
    grid-template-columns: minmax(168px, 1fr) 96px 96px;
    align-items: end;
    gap: 12px;
  }

  &__slider {
    display: grid;
    gap: 2px;
    min-width: 0;

    small {
      color: #6c7b8f;
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
    }

    :deep(.el-slider) {
      --el-slider-main-bg-color: #ff9f0a;
      --el-slider-runway-bg-color: #e3ebf5;

      height: 28px;
    }

    :deep(.el-slider__runway) {
      height: 5px;
    }

    :deep(.el-slider__button) {
      width: 14px;
      height: 14px;
      border-width: 3px;
    }

    div {
      display: flex;
      justify-content: space-between;
      color: #7b8ca2;
      font-size: 11px;
      font-weight: 800;
      line-height: 1;
      margin-top: -7px;
    }
  }

  label {
    display: grid;
    min-width: 0;
    gap: 6px;

    > span {
      color: #6c7b8f;
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
    }
  }

  :deep(.el-select__wrapper) {
    min-height: 32px;
    border-radius: 7px;
  }
}

.instruction-panel {
  min-height: 338px;
  padding: 10px 22px 15px;

  &__image {
    display: grid;
    height: 118px;
    place-items: center;
    margin-top: -8px;

    img {
      width: 138px;
      height: 112px;
      object-fit: contain;
      filter: drop-shadow(0 14px 20px rgb(55 86 128 / 12%));
      opacity: 0.72;
    }
  }

  ul {
    display: grid;
    gap: 10px;
    color: #5e7088;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.5;
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
  }

  li {
    position: relative;
    padding-left: 18px;

    &::before {
      position: absolute;
      top: 0.72em;
      left: 0;
      width: 5px;
      height: 5px;
      border-radius: 999px;
      background: #1479ff;
      content: '';
      transform: translateY(-50%);
    }
  }
}

.change-record {
  padding: 10px 22px 15px;

  &__table {
    --el-table-border-color: #e3ebf5;
    --el-table-header-bg-color: #f5f8fc;
    --el-table-row-hover-bg-color: #f8fbff;

    overflow: hidden;
    border-radius: 8px;
    font-size: 12px;

    :deep(.el-table__cell) {
      color: #506078;
      font-weight: 800;
      padding: 8px 0;
    }

    :deep(th.el-table__cell) {
      color: #6c7b8f;
      font-size: 12px;
      font-weight: 900;
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 12px;
    color: #64748a;
    font-size: 12px;
    font-weight: 800;
  }
}

@media (max-width: 1440px) {
  .parameter-config {
    &__main-card {
      gap: 14px;
      min-height: calc(100vh - 136px);
    }

    &__body {
      gap: 14px;
      grid-template-columns: minmax(0, 2fr) minmax(294px, 0.92fr);
    }
  }

  .parameter-panel {
    padding: 10px 22px 15px;
  }

  .device-picker__grid {
    gap: 14px;
  }

  .device-picker__actions {
    gap: 6px;

    :deep(.el-button) {
      padding: 0 10px;
    }
  }

  .device-picker__item {
    height: 58px;
    gap: 10px;
    padding: 0 12px;

    img {
      width: 32px;
      height: 32px;
      flex-basis: 32px;
    }
  }

  .speed-panel {
    min-height: 304px;
    padding: 10px 22px 15px;

    &__control {
      grid-template-columns: minmax(0, 1fr) 166px;
      column-gap: 36px;
      row-gap: 0;
      padding-left: 10px;
    }

    &__presets {
      gap: 12px;
      margin-top: 22px;
      padding: 0 8px;
    }

    &__hint {
      margin-left: 8px;
    }
  }

  .bin-config-panel {
    min-height: 304px;
    padding: 10px 22px 15px;

    &__layout {
      grid-template-columns: minmax(214px, 0.72fr) minmax(304px, 1fr) minmax(334px, 1.1fr);
      gap: 12px;
    }

    &__section {
      padding: 12px;
    }

    &__section-header {
      margin-bottom: 12px;
    }

    &__bin-item {
      min-height: 74px;
      grid-template-columns: 46px minmax(0, 1fr) auto 12px 26px;
      gap: 10px;
      padding: 9px 10px;

      img {
        width: 42px;
        height: 36px;
      }

      strong {
        font-size: 13px;
      }

      small,
      em {
        font-size: 12px;
      }

      em {
        padding: 5px 7px;
      }
    }

    &__delete {
      width: 26px;
      height: 26px;
    }

    &__form-grid {
      gap: 12px;

      &.is-three {
        gap: 10px;
      }
    }

    h4 {
      margin: 16px 0 9px;
    }
  }

  .bin-threshold {
    gap: 14px;
    padding: 6px 0;

    &__icon {
      width: 30px;
      height: 30px;
    }

    &__heading {
      gap: 8px;

      strong {
        font-size: 13px;
      }
    }

    &__controls {
      grid-template-columns: minmax(152px, 1fr) 84px 84px;
      gap: 10px;
    }
  }

  .instruction-panel {
    min-height: 304px;
    padding: 10px 22px 15px;

    &__image {
      height: 96px;

      img {
        width: 116px;
        height: 90px;
      }
    }
  }
}
</style>
