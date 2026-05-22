import 'vue-router'

export interface AppRouteMeta {
  titleKey?: string
  navTitleKey?: string
  icon?: string
  order?: number
  requiresAuth?: boolean
  hiddenInSidebar?: boolean
  manualModeOnly?: boolean
  requiresManualMode?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {}
}
