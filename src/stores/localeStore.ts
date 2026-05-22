import type { AppLocale } from '@/app/i18n'
import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { DEFAULT_LOCALE, i18n, messages } from '@/app/i18n'

const LOCALE_STORAGE_KEY = 'roboflow-locale'

function isAppLocale(value: string | null): value is AppLocale {
  return value !== null && value in messages
}

function readInitialLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return isAppLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE
}

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = shallowRef<AppLocale>(readInitialLocale())

  i18n.global.locale.value = currentLocale.value

  const localeOptions = computed(() => [
    { label: '中文', value: 'zh-CN' as const },
    { label: 'English', value: 'en-US' as const },
  ])

  const currentLocaleLabel = computed<string>(() => {
    return localeOptions.value.find(item => item.value === currentLocale.value)?.label ?? '中文'
  })

  function setLocale(locale: AppLocale): void {
    currentLocale.value = locale
    i18n.global.locale.value = locale

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  }

  return {
    currentLocale,
    currentLocaleLabel,
    localeOptions,
    setLocale,
  }
})
