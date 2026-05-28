import type { MaterialTypeForm } from './types'
import type { MaterialType, MaterialTypePayload } from '@/entities/material/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { createMaterial, deleteMaterial, fetchMaterials, updateMaterial } from '@/services'

interface UseMaterialTypeConfigOptions {
  afterChange?: () => Promise<void>
}

const defaultMaterialTypeForm: MaterialTypeForm = {
  code: '',
  description: '',
  enabled: true,
  name: '',
  sortOrder: 0,
}

export function useMaterialTypeConfig(options: UseMaterialTypeConfigOptions = {}) {
  const { t } = useI18n()

  const materialDialogVisible = shallowRef(false)
  const materialList = shallowRef<MaterialType[]>([])
  const materialListLoading = shallowRef(false)
  const materialSaving = shallowRef(false)
  const materialDeletingId = shallowRef<number>()
  const materialTypeForm = reactive<MaterialTypeForm>({ ...defaultMaterialTypeForm })
  const isEditingMaterialType = computed(() => materialTypeForm.id !== undefined)

  async function openMaterialManager(): Promise<void> {
    materialDialogVisible.value = true
    startCreateMaterialType()
    await refreshMaterials()
  }

  async function refreshMaterials(): Promise<void> {
    materialListLoading.value = true

    try {
      materialList.value = await fetchMaterials()
    }
    catch (error) {
      console.error('[parameter-config] failed to fetch material types', error)
      materialList.value = []
      ElMessage.error(t('parameters.binConfig.materialManager.messages.loadFailed'))
    }
    finally {
      materialListLoading.value = false
    }
  }

  function startCreateMaterialType(): void {
    delete materialTypeForm.id
    Object.assign(materialTypeForm, defaultMaterialTypeForm)
  }

  function startEditMaterialType(material: MaterialType): void {
    Object.assign(materialTypeForm, {
      code: material.code,
      description: material.description ?? '',
      enabled: material.enabled,
      id: material.id,
      name: material.name,
      sortOrder: material.sort_order,
    })
  }

  async function saveMaterialType(): Promise<void> {
    if (materialSaving.value)
      return

    if (!materialTypeForm.code.trim()) {
      ElMessage.warning(t('parameters.binConfig.materialManager.messages.codeRequired'))
      return
    }

    if (!materialTypeForm.name.trim()) {
      ElMessage.warning(t('parameters.binConfig.materialManager.messages.nameRequired'))
      return
    }

    materialSaving.value = true

    try {
      const materialId = materialTypeForm.id
      const savedMaterial = materialId === undefined
        ? await createMaterial(buildMaterialTypePayload())
        : await updateMaterial(materialId, buildMaterialTypePayload())

      ElMessage.success(t(materialId === undefined
        ? 'parameters.binConfig.materialManager.messages.created'
        : 'parameters.binConfig.materialManager.messages.updated'))

      await refreshAfterChange()
      startEditMaterialType(savedMaterial)
    }
    catch (error) {
      console.error('[parameter-config] failed to save material type', error)
      ElMessage.error(t('parameters.binConfig.materialManager.messages.saveFailed'))
    }
    finally {
      materialSaving.value = false
    }
  }

  async function confirmDeleteMaterialType(material: MaterialType): Promise<void> {
    if (materialDeletingId.value !== undefined)
      return

    try {
      await ElMessageBox.confirm(
        t('parameters.binConfig.materialManager.messages.deleteConfirm', { name: material.name }),
        t('parameters.binConfig.materialManager.messages.deleteTitle'),
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

    materialDeletingId.value = material.id

    try {
      await deleteMaterial(material.id)
      ElMessage.success(t('parameters.binConfig.materialManager.messages.deleted'))
      await refreshAfterChange()

      if (materialTypeForm.id === material.id)
        startCreateMaterialType()
    }
    catch (error) {
      console.error('[parameter-config] failed to delete material type', error)
      ElMessage.error(t('parameters.binConfig.materialManager.messages.deleteFailed'))
    }
    finally {
      materialDeletingId.value = undefined
    }
  }

  async function refreshAfterChange(): Promise<void> {
    await Promise.all([
      refreshMaterials(),
      options.afterChange?.(),
    ])
  }

  function buildMaterialTypePayload(): MaterialTypePayload {
    return {
      code: materialTypeForm.code.trim(),
      description: materialTypeForm.description.trim() || null,
      enabled: materialTypeForm.enabled,
      name: materialTypeForm.name.trim(),
      sort_order: normalizeSortOrder(materialTypeForm.sortOrder),
    }
  }

  function normalizeSortOrder(value: number): number {
    const nextValue = Number(value)

    return Number.isFinite(nextValue) ? Math.max(0, Math.trunc(nextValue)) : 0
  }

  return {
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
  }
}
