# Route Spec

This document defines routing conventions for the ROBOFLOW frontend application.

The route table should be the single source of truth for page entry points, sidebar navigation metadata, and route-level titles.

## Naming Rules

Use English route paths.

Use lowercase kebab-case for paths.

Use PascalCase ending with `Page` for route names.

Use lazy imports for route page components.

Keep route-level page components thin. Page components should compose widgets and should not contain large business implementations.

## Required Routes

```txt
/                  Redirect to /dashboard
/dashboard          Dashboard
/realtime           Realtime Monitor
/devices            Device Status
/parameters         Parameter Configuration
/not-found          Not Found
/:pathMatch(.*)*    Redirect to /not-found
```

## Route Meta

Each navigation route should define a `meta` object.

Recommended route meta fields:

```ts
interface AppRouteMeta {
  titleKey?: string
  navTitleKey?: string
  icon: string
  order: number
  requiresAuth?: boolean
  hiddenInSidebar?: boolean
}
```

Field meanings:

- `titleKey`: i18n key for the route-level document or page title.
- `navTitleKey`: i18n key for text displayed in the sidebar.
- `icon`: icon key used by the sidebar.
- `order`: sidebar ordering value.
- `requiresAuth`: reserved for later authentication.
- `hiddenInSidebar`: hide redirect, detail, or utility routes from sidebar navigation.

## Route Definitions

Use this shape for route definitions:

```ts
const route = {
  path: '/dashboard',
  name: 'DashboardPage',
  component: () => import('@/pages/dashboard/DashboardPage.vue'),
  meta: {
    titleKey: 'routes.dashboard',
    navTitleKey: 'routes.dashboard',
    icon: 'Gauge',
    order: 10,
    requiresAuth: false,
  },
}
```

## Sidebar Generation

The sidebar should be generated from the router configuration when practical.

Sidebar items should include routes that:

- Have a `meta.navTitleKey`.
- Do not set `meta.hiddenInSidebar` to `true`.
- Are not redirect-only routes.
- Are sorted by `meta.order`.

## Parameter Page Sections

Do not create separate routes for first-version parameter sections.

Use a query parameter for the current parameter section:

```txt
/parameters?section=system
/parameters?section=communication
/parameters?section=robot
/parameters?section=vision
/parameters?section=io
/parameters?section=safety
/parameters?section=users
```

The parameter page should validate the `section` query.

If the section is missing or invalid, default to `system`.

## Detail Pages

Do not add detail routes until the UI needs a standalone page state.

Prefer in-page panels, drawers, tabs, or query parameters for simple subviews.

If a detail route becomes necessary later, use this pattern:

```txt
/devices/:deviceId
/tasks/:taskId
/alarms/:alarmId
```

Detail routes should usually set `hiddenInSidebar: true`.

## Redirect and 404 Rules

The root path `/` should redirect to `/dashboard`.

Unknown routes should redirect to `/not-found`.

The not-found page should use the same application shell unless a full-screen error state is explicitly requested.

## Title Rules

Route title translations should be concise and product-facing.

Avoid technical labels in visible navigation text.

Keep route title keys stable because they may later be used by breadcrumbs, tabs, page headers, and document titles.
