import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import WorkbenchLayout from '@/layouts/WorkbenchLayout.vue'
import { useAppStore } from '@/stores/appStore'
import { translate } from './i18n'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/pages/login/LoginPage.vue'),
    meta: {
      titleKey: 'routes.login',
      requiresAuth: false,
      hiddenInSidebar: true,
    },
  },
  {
    path: '/',
    component: WorkbenchLayout,
    redirect: '/login',
    children: [
      {
        path: 'dashboard',
        name: 'DashboardPage',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: {
          titleKey: 'routes.dashboard',
          navTitleKey: 'routes.dashboard',
          icon: 'DataAnalysis',
          order: 10,
          requiresAuth: false,
        },
      },
      {
        path: 'realtime',
        name: 'RealtimePage',
        component: () => import('@/pages/realtime/RealtimePage.vue'),
        meta: {
          titleKey: 'routes.realtime',
          navTitleKey: 'routes.realtime',
          icon: 'Monitor',
          order: 20,
          requiresAuth: false,
          hiddenInSidebar: true,
        },
      },
      {
        path: 'devices',
        name: 'DevicesPage',
        component: () => import('@/pages/devices/DevicesPage.vue'),
        meta: {
          titleKey: 'routes.devices',
          navTitleKey: 'routes.devices',
          icon: 'Cpu',
          order: 30,
          requiresAuth: false,
          hiddenInSidebar: true,
        },
      },
      {
        path: 'alarms',
        name: 'AlarmRecordsPage',
        component: () => import('@/pages/alarms/AlarmRecordsPage.vue'),
        meta: {
          titleKey: 'routes.alarms',
          navTitleKey: 'routes.alarms',
          icon: 'WarningFilled',
          order: 35,
          requiresAuth: false,
        },
      },
      {
        path: 'parameters',
        name: 'ParametersPage',
        component: () => import('@/pages/parameters/ParametersPage.vue'),
        meta: {
          titleKey: 'routes.parameters',
          navTitleKey: 'routes.parameters',
          icon: 'Setting',
          order: 40,
          requiresAuth: false,
        },
      },
      {
        path: 'manual',
        name: 'ManualPage',
        component: () => import('@/pages/manual/ManualPage.vue'),
        meta: {
          titleKey: 'routes.manual',
          navTitleKey: 'routes.manual',
          icon: 'Operation',
          order: 50,
          requiresAuth: false,
          manualModeOnly: true,
          requiresManualMode: true,
        },
      },
      {
        path: 'not-found',
        name: 'NotFoundPage',
        component: () => import('@/pages/not-found/NotFoundPage.vue'),
        meta: {
          titleKey: 'routes.notFound',
          requiresAuth: false,
          hiddenInSidebar: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const appStore = useAppStore()

  if (to.meta.requiresManualMode && appStore.controlMode !== 'manual') {
    return {
      name: 'DashboardPage',
      replace: true,
    }
  }
})

router.afterEach((to) => {
  const title = typeof to.meta.titleKey === 'string' ? translate(to.meta.titleKey) : 'ROBOFLOW'
  document.title = `${title} - ROBOFLOW`
})

export default router
