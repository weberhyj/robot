<script setup lang="ts">
import type { Component } from 'vue'
import type { QuickControlMode } from './constants'
import type { NavItem } from './types'
import { Cpu, DataAnalysis, Monitor, Operation, RefreshRight, Setting, VideoPause, VideoPlay, WarningFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { controlModes } from './constants'

const iconMap: Record<string, Component> = {
  Cpu,
  DataAnalysis,
  Monitor,
  Operation,
  Setting,
  WarningFilled,
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const quickControlActionsDisabled = computed(() => appStore.controlMode === 'manual')

const navItems = computed<NavItem[]>(() => router
  .getRoutes()
  .filter((item) => {
    if (!item.meta.navTitleKey || item.meta.hiddenInSidebar || item.path === '/')
      return false

    if (item.meta.manualModeOnly && appStore.controlMode !== 'manual')
      return false

    return true
  })
  .map(item => ({
    path: item.path,
    title: t(String(item.meta.navTitleKey)),
    icon: iconMap[String(item.meta.icon)] ?? DataAnalysis,
    order: Number(item.meta.order ?? 0),
  }))
  .sort((a, b) => a.order - b.order))

async function setControlMode(mode: QuickControlMode): Promise<void> {
  if (appStore.controlMode === mode) {
    if (mode === 'automatic' && route.name === 'ManualPage')
      void router.push({ name: 'DashboardPage' })

    return
  }

  if (mode === 'manual') {
    try {
      await ElMessageBox.confirm(
        t('quickControls.manualModeConfirm.message'),
        t('quickControls.manualModeConfirm.title'),
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

    appStore.setControlMode(mode)
    void router.push({ name: 'ManualPage' })
    return
  }

  appStore.setControlMode(mode)

  if (mode === 'automatic')
    void router.push({ name: 'DashboardPage' })
}
</script>

<template>
  <aside class="app-sidebar">
    <RouterLink class="app-sidebar__brand" to="/dashboard">
      <span class="app-sidebar__logo">R</span>
      <span>
        <strong>{{ t('app.name') }}</strong>
        <small>{{ t('app.brandSubtitle') }}</small>
      </span>
    </RouterLink>

    <nav class="app-sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        class="app-sidebar__item"
        :class="{ 'is-active': route.path === item.path }"
        :to="item.path"
      >
        <el-icon :size="16">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </RouterLink>
    </nav>

    <section class="app-sidebar__quick-controls" :aria-label="t('quickControls.title')">
      <div class="app-sidebar__mode">
        <span class="app-sidebar__control-label">{{ t('quickControls.mode') }}</span>
        <div role="group" :aria-label="t('quickControls.mode')">
          <button
            v-for="mode in controlModes"
            :key="mode"
            type="button"
            :aria-pressed="appStore.controlMode === mode"
            :class="{ 'is-active': appStore.controlMode === mode }"
            @click="setControlMode(mode)"
          >
            {{ t(`quickControls.${mode}`) }}
          </button>
        </div>
      </div>

      <div class="app-sidebar__control-actions">
        <span class="app-sidebar__control-label">{{ t('quickControls.title') }}</span>

        <div class="app-sidebar__actions">
          <el-button type="primary" :icon="VideoPlay" :disabled="quickControlActionsDisabled">
            {{ t('quickControls.start') }}
          </el-button>
          <el-button type="danger" plain :icon="VideoPause" :disabled="quickControlActionsDisabled">
            {{ t('quickControls.stop') }}
          </el-button>
          <el-button :icon="RefreshRight" :disabled="quickControlActionsDisabled">
            {{ t('quickControls.reset') }}
          </el-button>
          <el-button class="app-sidebar__emergency" type="danger" :icon="WarningFilled">
            {{ t('quickControls.emergency') }}
          </el-button>
        </div>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
  display: flex;
  height: 100%;
  flex-direction: column;
  background: transparent;
  padding: 28px 20px;

  &__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--rf-color-text);
    text-decoration: none;

    strong,
    small {
      display: block;
    }

    strong {
      font-size: 18px;
      letter-spacing: 0;
    }

    small {
      margin-top: 2px;
      color: var(--rf-color-text-muted);
      font-size: 12px;
    }
  }

  &__logo {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 8px;
    border: 1px solid #bbdfff;
    background: #e7f1ff;
    color: var(--rf-color-blue);
    font-weight: 800;
  }

  &__nav {
    display: grid;
    gap: 8px;
    margin-top: 24px;
  }

  &__item {
    position: relative;
    display: flex;
    height: 52px;
    align-items: center;
    gap: 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: #40516c;
    font-size: 13px;
    font-weight: 700;
    padding: 0 14px;
    text-decoration: none;
    transition:
      transform 160ms ease,
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;

    &::before {
      position: absolute;
      top: 12px;
      bottom: 12px;
      left: 6px;
      width: 3px;
      border-radius: 999px;
      background: var(--rf-color-blue);
      content: '';
      opacity: 0;
      transform: scaleY(0.45);
      transition:
        opacity 160ms ease,
        transform 160ms ease;
    }

    .el-icon {
      display: grid;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      place-items: center;
      border-radius: 7px;
      background: #f1f5fb;
      transition:
        background-color 160ms ease,
        color 160ms ease;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      transform: translateX(2px);
      border-color: #dcebff;
      background: #f2f7ff;
      color: var(--rf-color-blue);

      .el-icon {
        background: #e8f1ff;
      }
    }

    &.is-active {
      border-color: #dcebff;
      background: #f2f7ff;
      color: var(--rf-color-blue);

      &::before {
        opacity: 1;
        transform: scaleY(1);
      }

      .el-icon {
        background: #e8f1ff;
      }
    }
  }

  &__quick-controls {
    display: grid;
    gap: 12px;
    border: 1px solid #dfe8f5;
    border-radius: 12px;
    background: #fff;
    margin-top: auto;
    padding: 14px;

    .el-button {
      width: 100%;
      height: 34px;
      margin: 0;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
    }
  }

  &__control-actions {
    display: grid;
    gap: 10px;
  }

  &__control-label {
    color: var(--rf-color-text-muted);
    font-size: 11px;
    font-weight: 800;
  }

  &__mode {
    display: grid;
    gap: 7px;

    > div {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3px;
      border-radius: 8px;
      background: #f1f5fb;
      padding: 3px;
    }

    button {
      height: 29px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #5c6d86;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0;
      transition:
        background-color 160ms ease,
        color 160ms ease;

      &:hover {
        color: var(--rf-color-blue);
      }

      &:focus-visible {
        outline: 2px solid rgba(48, 103, 240, 0.28);
        outline-offset: 2px;
      }

      &.is-active {
        background: #fff;
        color: var(--rf-color-blue);
      }
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  &__emergency {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1440px) {
  .app-sidebar {
    padding: 22px 16px;

    &__brand {
      gap: 10px;

      strong {
        font-size: 16px;
      }
    }

    &__nav {
      gap: 7px;
      margin-top: 20px;
    }

    &__item {
      height: 48px;
      padding: 0 12px;

      .el-icon {
        width: 26px;
        height: 26px;
        flex-basis: 26px;
      }
    }

    &__quick-controls {
      gap: 10px;
      margin-top: auto;
      padding: 12px;

      .el-button {
        height: 32px;
      }
    }

    &__mode {
      gap: 6px;
    }

    &__control-actions {
      gap: 9px;
    }
  }
}
</style>
