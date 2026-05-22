<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()
const { t } = useI18n()
</script>

<template>
  <footer class="bottom-system-bar">
    <span>{{ t('systemBar.connection') }}: {{ t(`status.${appStore.connectionStatus}`) }}</span>
    <span>{{ t('systemBar.safety') }}: {{ t(`status.${appStore.safetyStatus}`) }}</span>
    <span>{{ t('systemBar.controlMode') }}: {{ t(`status.${appStore.controlMode}`) }}</span>
    <span>{{ t('systemBar.ip') }}: {{ appStore.ipAddress }}</span>
    <span>{{ t('systemBar.version') }}: {{ appStore.version }}</span>
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
