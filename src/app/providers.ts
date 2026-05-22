import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { i18n } from './i18n'
import router from './router'
import 'element-plus/dist/index.css'

export function installProviders(app: App<Element>): void {
  app.use(createPinia())
  app.use(i18n)
  app.use(router)
  app.use(ElementPlus)
}
