<script setup lang="ts">
import type { AppLocale } from '@/app/i18n'
import { useLocaleStore } from '@/stores/localeStore'

const localeStore = useLocaleStore()

function setLocale(locale: AppLocale): void {
  localeStore.setLocale(locale)
}
</script>

<template>
  <div
    class="language-switch"
    role="group"
    :aria-label="localeStore.currentLocaleLabel"
  >
    <svg
      class="language-switch__icon"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
      <path d="M5.6 6.2a13.2 13.2 0 0 0 12.8 0" />
      <path d="M5.6 17.8a13.2 13.2 0 0 1 12.8 0" />
    </svg>
    <button
      class="language-switch__option"
      :class="{ 'is-active': localeStore.currentLocale === 'zh-CN' }"
      type="button"
      :aria-pressed="localeStore.currentLocale === 'zh-CN'"
      @click="setLocale('zh-CN')"
    >
      &#20013;
    </button>
    <span class="language-switch__divider">|</span>
    <button
      class="language-switch__option"
      :class="{ 'is-active': localeStore.currentLocale === 'en-US' }"
      type="button"
      :aria-pressed="localeStore.currentLocale === 'en-US'"
      @click="setLocale('en-US')"
    >
      EN
    </button>
  </div>
</template>

<style scoped lang="scss">
.language-switch {
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 9px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-family: inherit;
  padding: 0 2px;

  &__icon {
    width: 21px;
    height: 21px;
    flex: 0 0 auto;
    color: #64748b;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
  }

  &__divider {
    color: #64748b;
    font-size: 14px;
    line-height: 1;
    white-space: nowrap;
  }

  &__option {
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    padding: 0;
    white-space: nowrap;

    &:hover {
      color: #334155;
    }

    &.is-active {
      color: #2563eb;
      font-weight: 800;
    }
  }

  &__divider {
    color: #cbd5e1;
    font-weight: 500;
  }
}

@media (max-width: 1440px) {
  .language-switch {
    height: 30px;
    gap: 8px;
  }
}
</style>
