import { createI18n } from 'vue-i18n'
import enUS from '@/locales/en-US'
import zhCN from '@/locales/zh-CN'

export const DEFAULT_LOCALE = 'zh-CN'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export type AppLocale = keyof typeof messages

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})

export function translate(key: string): string {
  return i18n.global.t(key)
}
