<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkAppUpdate, downloadAndInstallAppUpdate, relaunchApp } from '@/services'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()
const { t } = useI18n()
const updateChecking = shallowRef(false)
const updateProgress = shallowRef<number>()

const updateButtonText = computed(() => {
  if (updateProgress.value !== undefined)
    return t('systemBar.update.progress', { progress: updateProgress.value })

  return t('systemBar.update.check')
})

async function checkForUpdates(): Promise<void> {
  if (updateChecking.value)
    return

  updateChecking.value = true
  updateProgress.value = undefined

  try {
    const update = await checkAppUpdate()

    if (!update) {
      ElMessage.success(t('systemBar.update.noUpdate'))
      return
    }

    try {
      await ElMessageBox.confirm(
        t('systemBar.update.confirmMessage', {
          currentVersion: update.currentVersion,
          version: update.version,
        }),
        t('systemBar.update.confirmTitle'),
        {
          autofocus: false,
          cancelButtonText: t('systemBar.update.cancel'),
          closeOnClickModal: false,
          confirmButtonText: t('systemBar.update.confirm'),
          type: 'warning',
        },
      )
    }
    catch {
      return
    }

    await downloadAndInstallAppUpdate(update, (progress) => {
      updateProgress.value = progress
    })
    ElMessage.success(t('systemBar.update.installed'))
    await relaunchApp()
  }
  catch (error) {
    console.error('[updater] failed to check or install update', error)
    ElMessage.error(t('systemBar.update.failedWithReason', { reason: getUpdateErrorMessage(error) }))
  }
  finally {
    updateChecking.value = false
    updateProgress.value = undefined
  }
}

function getUpdateErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return error.message

  if (typeof error === 'string')
    return error

  return t('systemBar.update.unknownReason')
}
</script>

<template>
  <footer class="bottom-system-bar">
    <span>{{ t('systemBar.connection') }}: {{ t(`status.${appStore.connectionStatus}`) }}</span>
    <span>{{ t('systemBar.safety') }}: {{ t(`status.${appStore.safetyStatus}`) }}</span>
    <span>{{ t('systemBar.controlMode') }}: {{ t(`status.${appStore.controlMode}`) }}</span>
    <span>{{ t('systemBar.ip') }}: {{ appStore.ipAddress }}</span>
    <span class="bottom-system-bar__version">
      {{ t('systemBar.version') }}: {{ appStore.version }}
      <el-button text size="small" :loading="updateChecking" @click="checkForUpdates">
        {{ updateButtonText }}
      </el-button>
    </span>
  </footer>
</template>

<style scoped lang="scss">
.bottom-system-bar {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid var(--rf-color-border);
  background: rgb(252 253 254 / 72%);
  color: var(--rf-color-text-muted);
  font-size: 12px;
  padding: 0 28px;
  white-space: nowrap;

  span:first-child,
  span:nth-child(2) {
    color: var(--rf-color-green);
    font-weight: 700;
  }

  &__version {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    :deep(.el-button) {
      height: 22px;
      color: #2563eb;
      font-size: 12px;
      font-weight: 800;
      padding: 0 4px;
    }
  }
}

@media (max-width: 1440px) {
  .bottom-system-bar {
    gap: 14px;
    overflow: hidden;
    font-size: 11px;
    padding: 0 18px;

    span {
      overflow: hidden;
      min-width: 0;
      text-overflow: ellipsis;
    }
  }
}
</style>
