# Component Conventions

This document defines Vue component conventions for the ROBOFLOW frontend application.

The goal is to keep components focused, typed, predictable, and consistent with the project structure.

## Vue SFC Standard

Use Vue 3 Composition API.

Use TypeScript for Vue components.

Use this SFC order:

```vue
<script setup lang="ts">
</script>

<template>
  <div />
</template>

<style scoped lang="scss">
</style>
```

Do not use Options API unless the existing project explicitly requires it.

Avoid reactive props destructuring unless there is a clear reason.

## Component Categories

Use these component categories consistently:

```txt
Page       Route-level composition surface
Layout     Shared shell or page frame
Widget     Business UI block
Shared UI  Reusable generic component
```

## Page Components

Page components should stay thin.

Page components may:

- Compose widgets.
- Read route params or query values.
- Trigger route-level initialization.
- Set page-level layout decisions.

Page components should not:

- Contain large business templates.
- Hardcode operational data.
- Call Mock adapters directly.
- Call transport APIs directly.
- Own unrelated UI sections.

Recommended naming:

```txt
DashboardPage.vue
RealtimePage.vue
DevicesPage.vue
ParametersPage.vue
```

## Layout Components

Layout components own shared structure.

Use layouts for:

- Sidebar placement
- Top status bar placement
- Main content regions
- Bottom status bar placement
- Common shell behavior

Layouts should not own page-specific business logic.

## Widget Components

Widgets own business UI sections.

Use widgets for:

- Robot status summary
- Device health panels
- Realtime monitor panels
- Alarm panels
- Task history tables
- Parameter configuration panels

Each widget should have one clear responsibility.

Split a widget when:

- It owns three or more distinct UI sections.
- It mixes data orchestration with substantial presentation markup.
- A template block becomes reusable.
- The component becomes difficult to scan.

Recommended naming:

```txt
RobotSummaryCard.vue
DeviceHealthPanel.vue
RealtimeMonitorPanel.vue
ParameterConfigPanel.vue
AlarmListPanel.vue
```

## Shared UI Components

Shared UI components should be generic and reusable across domains.

Good shared UI examples:

- Status badge
- Metric card
- Section header
- Empty state
- Loading state
- Error state

Avoid putting domain-specific robot, device, alarm, or parameter behavior inside shared UI components.

## Props

Use typed props.

Prefer explicit prop contracts:

```ts
interface Props {
  title: string
  value: string | number
  status?: 'normal' | 'warning' | 'error'
}

const props = defineProps<Props>()
```

Props should be:

- Minimal
- Stable
- Domain-appropriate
- Named by meaning, not presentation only

Avoid passing large unrelated objects into a component just because it is convenient.

## Emits

Use typed emits for component events.

Event names should describe user intent.

```ts
const emit = defineEmits<{
  refresh: []
  save: []
  reset: []
  select: [id: string]
}>()
```

Prefer:

```txt
save
reset
refresh
select
confirm
cancel
```

Avoid vague event names:

```txt
click
change
handle
doAction
```

Use native event names only for low-level shared UI components when appropriate.

## v-model

Use `v-model` only for true two-way component contracts.

Good use:

- Form field components
- Filter components
- Tab or section selector components

Avoid using `v-model` to hide complex state mutations.

Prefer explicit props and emits for business actions.

## Composables

Use composables for reusable logic, stateful behavior, or side effects.

Recommended examples:

```txt
useRobotStatus.ts
useDeviceHealth.ts
useParameterDirtyState.ts
useRealtimePolling.ts
useEChart.ts
```

Composable APIs should be small and typed.

A composable should not secretly create unrelated global state.

Clean up timers, subscriptions, and listeners when they are no longer needed.

## Stores in Components

Widgets may read stores directly when they own a business UI section.

Shared UI components should not read Pinia stores.

Page components may coordinate store initialization but should not become data transformation hubs.

Prefer computed values for derived display data.

## Element Plus Components

Prefer Element Plus for common UI interactions.

Use Element Plus directly when the default component fits the use case.

Create a project wrapper only when:

- The same configuration is repeated many times.
- The project needs consistent styling or behavior.
- The wrapper meaning is clear and reusable.

Do not wrap Element Plus components without a concrete reason.

## ECharts Components

Charts should be isolated behind chart components or composables.

Recommended pattern:

```txt
Widget -> Chart component -> useEChart composable
```

Chart components should accept data and options through typed props.

Keep ECharts initialization and disposal out of route pages.

Dispose chart instances when components unmount.

## Styles

Use SCSS for component styles whenever possible.

Prefer scoped styles for component-specific styling.

Use shared style files only for:

- Variables
- Mixins
- Global resets
- Element Plus overrides
- Shared utility classes

Avoid deep selectors unless customizing library internals is necessary.

If deep selectors are required, keep them narrow and documented by context.

## File Organization

For simple components, a single `.vue` file is enough.

For larger widgets, use a folder:

```txt
widgets/device-health/
|-- DeviceHealthPanel.vue
|-- DeviceHealthCard.vue
|-- constants.ts
|-- types.ts
`-- useDeviceHealthView.ts
```

Keep related files near the feature when they are not broadly reusable.

Move code to `shared/` only after it is truly reused across features.

## Comments

Avoid comments that explain what the code obviously does.

Use comments to explain:

- Non-obvious decisions
- Safety-related behavior
- Workarounds
- Integration constraints

Keep comments short and useful.

## Testing

Use Vitest for component-related tests when tests are added.

Use `describe` and `it`.

Prefer testing behavior and rendering states over implementation details.

Useful test targets:

- Status rendering
- Empty state rendering
- Error state rendering
- Form validation behavior
- Event emission
- Store-driven rendering
