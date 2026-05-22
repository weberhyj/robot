<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import LanguageSwitch from './LanguageSwitch.vue'

const appStore = useAppStore()
const router = useRouter()
const { t } = useI18n()
const now = shallowRef(new Date())

const timer = window.setInterval(() => {
  now.value = new Date()
}, 1000)

const timeText = computed<string>(() => {
  const value = now.value
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const date = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  const seconds = String(value.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
})

const userInitial = computed<string>(() => appStore.userName.slice(0, 1).toUpperCase())

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

function goLogin(): void {
  void router.push('/login')
}

function handleAccountCommand(command: string): void {
  if (command === 'logout')
    goLogin()
}
</script>

<template>
  <header class="top-status-bar">
    <div class="top-status-bar__meta">
      <div class="top-status-bar__system">
        <span class="top-status-bar__system-item is-time">{{ timeText }}</span>
        <LanguageSwitch />
      </div>

      <span class="top-status-bar__divider" aria-hidden="true" />

      <el-dropdown trigger="click" placement="bottom-end" @command="handleAccountCommand">
        <button class="top-status-bar__account" type="button">
          <el-avatar class="top-status-bar__avatar" :size="30">
            {{ userInitial }}
          </el-avatar>
          <span class="top-status-bar__user">
            <strong>{{ appStore.userName }}</strong>
            <small>{{ t(`roles.${appStore.userRole}`) }}</small>
          </span>
          <el-icon class="top-status-bar__account-arrow">
            <ArrowDown />
          </el-icon>
        </button>

        <template #dropdown>
          <el-dropdown-menu class="top-status-bar__account-menu">
            <el-dropdown-item command="logout">
              {{ t('app.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.top-status-bar {
  --topbar-border: #d9e2ef;
  --topbar-border-soft: #e7edf5;
  --topbar-control: #f8fbff;
  --topbar-control-hover: #eef5ff;
  --topbar-ink: #172033;
  --topbar-muted: #68758a;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: transparent;
  gap: 16px;
  padding: 8px 24px 8px 0;

  &__meta {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0;
    min-width: 0;
    min-height: 44px;
    padding: 0;
  }

  &__account {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    padding: 2px 4px 2px 2px;

    &:hover {
      .top-status-bar__avatar {
        border-color: #bcd0ea;
      }

      .top-status-bar__account-arrow {
        color: var(--rf-color-blue);
      }
    }
  }

  &__system {
    display: flex;
    min-width: 0;
    height: 34px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--topbar-border-soft);
    border-radius: 8px;
    background: rgb(248 251 255 / 68%);
    padding: 0 10px;
  }

  &__account {
    padding-right: 2px;
  }

  &__divider {
    width: 1px;
    height: 24px;
    flex: 0 0 auto;
    margin: 0 9px;
    background: var(--topbar-border-soft);
  }

  &__system-item {
    display: inline-flex;
    align-items: center;
    color: var(--topbar-muted);
    font-size: 12px;

    &.is-time {
      min-width: 142px;
      justify-content: center;
      color: var(--topbar-ink);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
    }
  }

  &__avatar {
    border: 1px solid #d7e3f4;
    background: #eef5ff;
    color: var(--rf-color-blue);
    font-weight: 800;
  }

  &__user {
    display: grid;
    min-width: 62px;
    gap: 2px;

    strong {
      color: var(--topbar-ink);
      font-size: 12px;
      line-height: 1.05;
    }

    small {
      color: var(--topbar-muted);
      font-size: 10px;
      line-height: 1;
    }
  }

  &__account-arrow {
    flex: 0 0 auto;
    color: #94a3b8;
    font-size: 12px;
    transition: color 160ms ease;
  }
}

@media (max-width: 1440px) {
  .top-status-bar {
    gap: 12px;
    padding: 7px 16px 7px 0;

    &__meta {
      min-height: 42px;
      padding: 0;
    }

    &__account {
      gap: 7px;
    }

    &__system {
      height: 32px;
      gap: 8px;
      padding: 0 9px;
    }

    &__divider {
      height: 22px;
      margin: 0 7px;
    }

    &__user {
      min-width: 58px;
    }
  }
}
</style>
