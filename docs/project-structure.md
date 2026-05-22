# Project Structure

This document defines the recommended frontend project structure for ROBOFLOW.

The goal is to keep route pages thin, business modules focused, and future EXE integration replaceable through adapters instead of page rewrites.

## Directory Layout

```txt
src/
|-- app/                   # App bootstrap: router, providers, root setup
|   |-- main.ts
|   |-- router.ts
|   |-- App.vue
|   `-- providers.ts
|
|-- layouts/               # Page shells
|   `-- WorkbenchLayout.vue
|
|-- pages/                 # Route-level pages, thin composition layer only
|   |-- dashboard/
|   |-- realtime/
|   |-- devices/
|   `-- parameters/
|
|-- widgets/               # Business UI blocks used by pages
|   |-- app-sidebar/
|   |-- top-status-bar/
|   |-- bottom-system-bar/
|   |-- dashboard-overview/
|   |-- realtime-monitor/
|   |-- device-health/
|   `-- parameter-config/
|
|-- entities/              # Domain models, types, constants
|   |-- robot/
|   |-- device/
|   |-- alarm/
|   |-- task/
|   |-- material/
|   `-- parameter/
|
|-- stores/                # Pinia stores
|   |-- appStore.ts
|   |-- robotStore.ts
|   |-- deviceStore.ts
|   |-- alarmStore.ts
|   |-- taskStore.ts
|   `-- parameterStore.ts
|
|-- services/              # Frontend service layer
|   |-- robotService.ts
|   |-- deviceService.ts
|   |-- alarmService.ts
|   |-- taskService.ts
|   `-- parameterService.ts
|
|-- adapters/              # Mock now, real IPC/HTTP/WebSocket later
|   |-- mock/
|   `-- types.ts
|
|-- shared/                # Cross-feature shared code
|   |-- ui/
|   |-- composables/
|   |-- utils/
|   |-- styles/
|   `-- types/
|
`-- assets/                # Static assets
    |-- images/
    `-- icons/
```

## Layer Responsibilities

### `app/`

Contains application bootstrap code.

Use this layer for:

- Vue app creation
- Router setup
- Global providers
- Root app composition

Do not put page-specific business logic here.

### `layouts/`

Contains page shells shared by multiple routes.

`WorkbenchLayout.vue` should own the global console structure, such as sidebar, top status bar, route content area, and bottom system bar.

### `pages/`

Contains route-level page components.

Pages should stay thin. They should compose widgets and connect route-level state, but should not contain large templates, complex business logic, or transport details.

### `widgets/`

Contains business UI blocks used by pages.

Widgets can combine domain data, UI components, and local interactions. A widget should have one clear responsibility, such as rendering the device health area, realtime monitor area, or parameter configuration area.

### `entities/`

Contains domain-level code.

Use this layer for:

- Shared domain types
- Domain constants
- Status mappings
- Formatting helpers tied to a domain

Do not import page or widget components from this layer.

### `stores/`

Contains Pinia stores.

Stores should hold cross-page state and coordinate service calls. Keep source state minimal and derive display values with computed values when practical.

### `services/`

Contains frontend business services.

Services expose business operations to stores and widgets. They should hide adapter details from the UI layer.

### `adapters/`

Contains transport adapters.

During the frontend-only stage, adapters should call Mock data or simulators. During later EXE integration, real adapters can call Electron IPC, HTTP, or WebSocket without rewriting pages and widgets.

### `shared/`

Contains code that is genuinely reused across features.

Use this layer for:

- Base UI components
- Shared composables
- Generic utilities
- Global styles
- Shared TypeScript helpers

Avoid placing domain-specific code here unless it is truly cross-feature.

### `assets/`

Contains static assets such as images and icons.

## Vue Component Rules

Use Vue 3 Composition API with this SFC order:

```vue
<script setup lang="ts">
</script>

<template>
  <div />
</template>

<style scoped lang="scss">
</style>
```

Keep route pages as composition surfaces. Move substantial UI sections into widgets and reusable logic into composables.

## Naming Rules

- Page components: `DashboardPage.vue`, `RealtimePage.vue`, `DevicesPage.vue`, `ParametersPage.vue`
- Widget components: `RobotSummaryCard.vue`, `DeviceHealthPanel.vue`, `ParameterConfigPanel.vue`
- Composables: `useRobotStatus.ts`, `useDeviceHealth.ts`
- Stores: `robotStore.ts`, `deviceStore.ts`
- Types: `types.ts`
- Constants: `constants.ts`

## Integration Rule

The UI should not directly depend on serial communication, PLC communication, camera SDKs, robot SDKs, or Electron main-process APIs.

Pages and widgets should depend on stores or services. Services may depend on adapters. Adapters are the replaceable boundary between the frontend UI and future runtime integrations.
