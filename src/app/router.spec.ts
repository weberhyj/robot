// @vitest-environment jsdom

import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { routes } from './router'

function getWorkbenchChildren(): RouteRecordRaw[] {
  const workbenchRoute = routes.find(route => route.path === '/')

  return workbenchRoute?.children ?? []
}

describe('router navigation metadata', () => {
  it('opens the login page from the default entry', () => {
    const workbenchRoute = routes.find(route => route.path === '/')

    expect(workbenchRoute?.redirect).toBe('/login')
  })

  it('keeps retired first-level pages out of the sidebar', () => {
    const hiddenPaths = new Set(
      getWorkbenchChildren()
        .filter(route => route.meta?.hiddenInSidebar)
        .map(route => route.path),
    )

    expect(hiddenPaths).toContain('realtime')
    expect(hiddenPaths).toContain('devices')
  })

  it('keeps the visible sidebar focused on current production entries', () => {
    const visiblePaths = getWorkbenchChildren()
      .filter(route => route.meta?.navTitleKey && !route.meta.hiddenInSidebar && !route.meta.manualModeOnly)
      .map(route => route.path)

    expect(visiblePaths).toEqual(['dashboard', 'alarms', 'parameters'])
  })

  it('guards manual control behind manual mode only', () => {
    const manualRoute = getWorkbenchChildren().find(route => route.path === 'manual')

    expect(manualRoute?.meta?.manualModeOnly).toBe(true)
    expect(manualRoute?.meta?.requiresManualMode).toBe(true)
  })
})
