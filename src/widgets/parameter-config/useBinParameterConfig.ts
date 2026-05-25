import type { BinParameterItem } from './types'
import type { BinCreatePayload, BinEnumOption, BinStatus, BinUpdatePayload } from '@/entities/device/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { createBin, deleteBin, fetchBinEnums, fetchBins, updateBin } from '@/services'
import { binParameterItems, defaultBinParameterForm } from './data'

const fallbackMaterialTypeOptions: BinEnumOption[] = [
  { value: 'orange', label: 'orange' },
  { value: 'box', label: 'box' },
  { value: 'apple', label: 'apple' },
]

export function useBinParameterConfig() {
  const { t } = useI18n()

  const binParameterForm = reactive({ ...defaultBinParameterForm })
  const binItems = shallowRef<BinParameterItem[]>([])
  const binTypeOptions = shallowRef<BinEnumOption[]>([])
  const materialTypeOptions = shallowRef<BinEnumOption[]>([])
  const binListLoaded = shallowRef(false)
  const binListFailed = shallowRef(false)
  const binListLoading = shallowRef(false)
  const binEnumsLoading = shallowRef(false)
  const binSaving = shallowRef(false)
  const binDeletingId = shallowRef<number>()

  const fallbackBinTypeOptions = computed<BinEnumOption[]>(() => [
    { value: 'ok', label: t('parameters.binConfig.types.ok') },
    { value: 'ng', label: t('parameters.binConfig.types.ng') },
  ])

  const resolvedBinTypeOptions = computed<BinEnumOption[]>(() => {
    return binTypeOptions.value.length > 0 ? binTypeOptions.value : fallbackBinTypeOptions.value
  })

  const resolvedMaterialTypeOptions = computed<BinEnumOption[]>(() => {
    return materialTypeOptions.value.length > 0 ? materialTypeOptions.value : fallbackMaterialTypeOptions
  })

  const fallbackBinItems = computed<BinParameterItem[]>(() => {
    return binParameterItems.map(item => ({
      ...item,
      calibrationLabel: getCalibrationLabel(item.isCalibrated),
      materialTypeLabel: getMaterialTypeLabel(item.materialType),
      typeLabel: getBinTypeLabel(item.type),
    }))
  })

  const displayedBinItems = computed<BinParameterItem[]>(() => {
    if (!binListLoaded.value || binListFailed.value)
      return fallbackBinItems.value

    return binItems.value
  })

  onMounted(() => {
    void initializeBinConfig()
  })

  function selectBin(bin: BinParameterItem): void {
    Object.assign(binParameterForm, {
      activeBinKey: bin.key,
      id: bin.id,
      code: bin.code,
      type: bin.type,
      materialType: bin.materialType,
      maxCapacity: bin.maxCapacity,
      currentLoad: bin.currentLoad,
      fillRate: bin.fillRate,
      sizeX: bin.sizeX,
      sizeY: bin.sizeY,
      sizeZ: bin.sizeZ,
      positionX: bin.positionX,
      positionY: bin.positionY,
      isCalibrated: bin.isCalibrated,
    })
  }

  function addBinPlaceholder(): void {
    prepareNewBinDraft()
    ElMessage.info(t('parameters.binConfig.messages.newDraft'))
  }

  function resetBinCapacityRules(): void {
    Object.assign(binParameterForm, {
      warningThreshold: defaultBinParameterForm.warningThreshold,
      warningLevel: defaultBinParameterForm.warningLevel,
    })
    ElMessage.success(t('parameters.binConfig.messages.capacityReset'))
  }

  function resetBinParameterForm(): void {
    const activeBin = displayedBinItems.value.find(item => item.key === binParameterForm.activeBinKey)
    selectBin(activeBin ?? displayedBinItems.value[0] ?? mapDefaultBinFormToItem())
  }

  async function saveBinParameters(): Promise<void> {
    if (binSaving.value)
      return

    if (!binParameterForm.code.trim()) {
      ElMessage.warning(t('parameters.binConfig.messages.nameRequired'))
      return
    }

    if (!binParameterForm.type) {
      ElMessage.warning(t('parameters.binConfig.messages.typeRequired'))
      return
    }

    binSaving.value = true

    try {
      const binId = binParameterForm.id
      const isCreate = binId === undefined
      const savedBin = isCreate
        ? await createBin(buildBinCreatePayload())
        : await updateBin(binId, buildBinUpdatePayload())

      ElMessage.success(t(isCreate ? 'parameters.binConfig.messages.created' : 'parameters.binConfig.messages.updated'))
      await refreshBins(savedBin.id)
    }
    catch (error) {
      console.error('[parameter-config] failed to save bin', error)
      ElMessage.error(t('parameters.binConfig.messages.saveFailed'))
    }
    finally {
      binSaving.value = false
    }
  }

  async function confirmDeleteBin(bin: BinParameterItem): Promise<void> {
    const binId = bin.id

    if (!binId || binDeletingId.value !== undefined)
      return

    try {
      await ElMessageBox.confirm(
        t('parameters.binConfig.messages.deleteConfirm', { name: bin.code }),
        t('parameters.binConfig.messages.deleteTitle'),
        {
          autofocus: false,
          cancelButtonText: t('quickControls.manualModeConfirm.cancel'),
          closeOnClickModal: false,
          confirmButtonText: t('quickControls.manualModeConfirm.confirm'),
          type: 'warning',
        },
      )
    }
    catch {
      return
    }

    binDeletingId.value = binId

    try {
      await deleteBin(binId)
      ElMessage.success(t('parameters.binConfig.messages.deleted'))
      await refreshBins()
    }
    catch (error) {
      console.error('[parameter-config] failed to delete bin', error)
      ElMessage.error(t('parameters.binConfig.messages.deleteFailed'))
    }
    finally {
      binDeletingId.value = undefined
    }
  }

  async function initializeBinConfig(): Promise<void> {
    await refreshBinEnums()
    await refreshBins()
  }

  async function refreshBinEnums(): Promise<void> {
    binEnumsLoading.value = true

    try {
      const enums = await fetchBinEnums()
      binTypeOptions.value = enums.bin_types
      materialTypeOptions.value = enums.material_types
    }
    catch (error) {
      console.error('[parameter-config] failed to fetch bin enums', error)
      binTypeOptions.value = []
      materialTypeOptions.value = []
    }
    finally {
      binEnumsLoading.value = false
    }
  }

  async function refreshBins(preferredBinId?: number): Promise<void> {
    binListLoading.value = true

    try {
      const bins = await fetchBins()
      const nextItems = bins.map(mapBinStatusToParameterItem)
      binItems.value = nextItems
      binListLoaded.value = true
      binListFailed.value = false

      const selectedBin = findSelectableBin(nextItems, preferredBinId)

      if (selectedBin)
        selectBin(selectedBin)
      else
        prepareNewBinDraft()
    }
    catch (error) {
      console.error('[parameter-config] failed to fetch bins', error)
      binListLoaded.value = false
      binListFailed.value = true
    }
    finally {
      binListLoading.value = false
    }
  }

  function findSelectableBin(items: BinParameterItem[], preferredBinId?: number): BinParameterItem | undefined {
    return items.find(item => item.id === preferredBinId)
      ?? items.find(item => item.id === binParameterForm.id)
      ?? items[0]
  }

  function prepareNewBinDraft(): void {
    const type = resolvedBinTypeOptions.value[0]?.value ?? 'ok'
    const materialType = resolvedMaterialTypeOptions.value[0]?.value ?? ''

    Object.assign(binParameterForm, {
      ...defaultBinParameterForm,
      activeBinKey: 'new',
      code: buildNextBinCode(type),
      currentLoad: 0,
      fillRate: 0,
      id: undefined,
      isCalibrated: false,
      materialType,
      type,
    })
  }

  function buildNextBinCode(type: string): string {
    const prefix = type === 'ng' ? 'BIN_NG' : 'BIN_OK'
    const count = displayedBinItems.value.filter(item => item.type === type).length + 1

    return `${prefix}_${String(count).padStart(2, '0')}`
  }

  function buildBinCreatePayload(): BinCreatePayload {
    const payload = buildBinUpdatePayload()

    return {
      bin_type: payload.bin_type ?? 'ok',
      current_load: 0,
      height: payload.height,
      is_calibrated: payload.is_calibrated,
      length: payload.length,
      material_type: payload.material_type,
      name: payload.name ?? '',
      position_x: payload.position_x,
      position_y: payload.position_y,
      total_capacity: payload.total_capacity,
      width: payload.width,
    }
  }

  function buildBinUpdatePayload(): BinUpdatePayload {
    return {
      bin_type: binParameterForm.type,
      height: normalizeNumber(binParameterForm.sizeZ),
      is_calibrated: binParameterForm.isCalibrated,
      length: normalizeNumber(binParameterForm.sizeX),
      material_type: binParameterForm.materialType || null,
      name: binParameterForm.code.trim(),
      position_x: normalizeNumber(binParameterForm.positionX),
      position_y: normalizeNumber(binParameterForm.positionY),
      total_capacity: normalizeNumber(binParameterForm.maxCapacity),
      width: normalizeNumber(binParameterForm.sizeY),
    }
  }

  function mapBinStatusToParameterItem(bin: BinStatus): BinParameterItem {
    const materialType = bin.material_type ?? ''

    return {
      key: String(bin.id),
      id: bin.id,
      code: bin.name,
      type: bin.bin_type,
      typeLabel: getBinTypeLabel(bin.bin_type),
      materialType,
      materialTypeLabel: getMaterialTypeLabel(materialType),
      calibrationLabel: getCalibrationLabel(bin.is_calibrated),
      image: binParameterItems[0].image,
      tone: getBinTone(bin),
      maxCapacity: normalizeNumber(bin.total_capacity),
      currentLoad: normalizeNumber(bin.current_load),
      fillRate: normalizeNumber(bin.fill_rate),
      sizeX: normalizeNumber(bin.length),
      sizeY: normalizeNumber(bin.width),
      sizeZ: normalizeNumber(bin.height),
      positionX: normalizeNumber(bin.position_x),
      positionY: normalizeNumber(bin.position_y),
      isCalibrated: bin.is_calibrated,
    }
  }

  function mapDefaultBinFormToItem(): BinParameterItem {
    return {
      key: defaultBinParameterForm.activeBinKey,
      id: defaultBinParameterForm.id,
      code: defaultBinParameterForm.code,
      type: defaultBinParameterForm.type,
      typeLabel: getBinTypeLabel(defaultBinParameterForm.type),
      materialType: defaultBinParameterForm.materialType,
      materialTypeLabel: getMaterialTypeLabel(defaultBinParameterForm.materialType),
      calibrationLabel: getCalibrationLabel(defaultBinParameterForm.isCalibrated),
      image: binParameterItems[0].image,
      tone: 'blue',
      maxCapacity: defaultBinParameterForm.maxCapacity,
      currentLoad: defaultBinParameterForm.currentLoad,
      fillRate: defaultBinParameterForm.fillRate,
      sizeX: defaultBinParameterForm.sizeX,
      sizeY: defaultBinParameterForm.sizeY,
      sizeZ: defaultBinParameterForm.sizeZ,
      positionX: defaultBinParameterForm.positionX,
      positionY: defaultBinParameterForm.positionY,
      isCalibrated: defaultBinParameterForm.isCalibrated,
    }
  }

  function getBinTypeLabel(value: string): string {
    return resolvedBinTypeOptions.value.find(option => option.value === value)?.label ?? value
  }

  function getMaterialTypeLabel(value: string): string {
    if (!value)
      return '--'

    return resolvedMaterialTypeOptions.value.find(option => option.value === value)?.label ?? value
  }

  function getCalibrationLabel(isCalibrated: boolean): string {
    return t(isCalibrated ? 'parameters.binConfig.calibration.calibrated' : 'parameters.binConfig.calibration.uncalibrated')
  }

  function getBinTone(bin: BinStatus): BinParameterItem['tone'] {
    if (bin.bin_type === 'ng' || bin.name.toUpperCase().includes('NG'))
      return 'red'

    return bin.is_calibrated ? 'gray' : 'blue'
  }

  function normalizeNumber(value: number): number {
    const nextValue = Number(value)

    return Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0
  }

  return {
    addBinPlaceholder,
    binDeletingId,
    binEnumsLoading,
    binListLoading,
    binParameterForm,
    binSaving,
    confirmDeleteBin,
    displayedBinItems,
    resetBinCapacityRules,
    resetBinParameterForm,
    resolvedBinTypeOptions,
    resolvedMaterialTypeOptions,
    saveBinParameters,
    selectBin,
  }
}
