# Development Plan

This document defines the phased frontend development plan for ROBOFLOW.

The current plan focuses on a frontend-only Vue application. Electron integration is intentionally deferred until the core frontend prototype is stable.

## Phase 1: Frontend Scaffold

Goal: create a runnable Vue frontend foundation.

Tasks:

- Initialize a Vue 3 + Vite + TypeScript project.
- Use `pnpm` as the package manager.
- Add Vue Router.
- Add Vue I18n with `zh-CN` as the default locale.
- Add Pinia.
- Add Element Plus.
- Add ECharts.
- Add SCSS support.
- Add Vitest.
- Add `@antfu/eslint-config`.
- Add basic `pnpm` scripts for dev, build, lint, and test.
- Keep the app frontend-only. Do not add Electron yet.

Expected result:

- The app starts locally with `pnpm dev`.
- The app builds with `pnpm build`.
- Linting and testing commands are available.

## Phase 2: Project Structure and Routing

Goal: establish the application shell and route foundation.

Tasks:

- Create the project directory layers defined in `docs/project-structure.md`.
- Add the route table defined in `docs/route-spec.md`.
- Add the default redirect from `/` to `/dashboard`.
- Add the not-found route.
- Add placeholder pages for Dashboard, Realtime Monitor, Device Status, and Parameter Configuration.
- Add lazy-loaded page components.
- Add route meta fields for sidebar generation.

Expected result:

- All required routes render.
- Sidebar navigation can be generated from route metadata.
- Route-level pages remain thin composition surfaces.

## Phase 3: Workbench Layout

Goal: create the stable upper-computer shell.

Tasks:

- Build `WorkbenchLayout`.
- Add the sidebar navigation area.
- Add the top status bar.
- Add the main route content region.
- Add the bottom system status bar.
- Add active sidebar state based on current route.
- Add basic responsive behavior for desktop viewport sizes.

Expected result:

- All pages share the same shell.
- Navigation, top status, and bottom status remain stable across route changes.

## Phase 4: Mock Data and State

Goal: make the UI data-driven before building detailed pages.

Reference: `docs/mock-data-contract.md`

Tasks:

- Create Mock adapters for robot, devices, alarms, tasks, and parameters.
- Create services that hide adapter details.
- Create Pinia stores for app, robot, devices, alarms, tasks, and parameters.
- Add realistic status values for running, standby, warning, alarm, offline, loading, empty, and error states.
- Add simulated refresh behavior where useful.

Expected result:

- Pages and widgets read data from stores or services.
- No route page hardcodes operational data directly.
- Mock state changes can drive visible UI updates.

## Phase 5: Dashboard Page

Goal: rebuild the dashboard route as an operational overview.

Tasks:

- Add robot status summary.
- Add runtime summary.
- Add quick controls.
- Add sorting metrics.
- Add OK and NG metrics.
- Add recognition accuracy.
- Add process flow.
- Add device summary.
- Add alarm summary.
- Add historical task list.

Expected result:

- Dashboard presents the workstation overview clearly.
- Metrics and status panels are driven by Mock state.

## Phase 6: Realtime Monitor Page

Goal: rebuild the realtime route for active operation monitoring.

Tasks:

- Add top status cards for conveyor, camera, robot arm, gripper, and bins.
- Add conveyor monitoring panel.
- Add robot operation log panel.
- Add robot joint status panel.
- Add gripper realtime status panel.
- Add bin capacity panel.
- Keep realtime-like updates centralized in stores or adapters.

Expected result:

- Realtime Monitor shows the current sorting process.
- Live-looking state updates do not rely on scattered widget timers.

## Phase 7: Device Status Page

Goal: rebuild the device route for health and runtime visibility.

Tasks:

- Add device summary metrics.
- Add device health cards.
- Add health distribution chart with ECharts.
- Add device status statistics.
- Add key metric trend chart with ECharts.
- Add recent alarm list.

Expected result:

- Device Status shows equipment health, runtime state, and recent risks.
- Charts use ECharts and follow `docs/ui-guidelines.md`.

## Phase 8: Parameter Configuration Page

Goal: implement the parameter configuration route.

Tasks:

- Add parameter section navigation.
- Use the `section` query rule from `docs/route-spec.md`.
- Add system parameters.
- Add communication parameters.
- Add robot parameters.
- Add vision parameters.
- Add I/O parameters.
- Add safety parameters.
- Add user permission parameters.
- Add validation.
- Add save, reset, and restore-default actions.
- Add unsaved-change handling.
- Add save success and failure feedback.

Expected result:

- Parameter Configuration supports editing, validation, saving, resetting, restoring defaults, and unsaved-change warnings through Mock state.

## Phase 9: Visual Polish and Verification

Goal: make the prototype consistent, stable, and demo-ready.

Tasks:

- Review UI against `docs/ui-guidelines.md`.
- Verify layouts at `1920x1080`.
- Verify layouts at `1366x768`.
- Check status color consistency.
- Check Element Plus form, table, and feedback patterns.
- Check ECharts readability.
- Run lint.
- Run tests when available.
- Run build.

Expected result:

- The frontend prototype is stable enough for review and future Electron planning.

## Deferred: Electron Integration

Electron should be added after the frontend prototype is stable.

Deferred tasks:

- Add Electron main process.
- Add preload bridge.
- Add IPC modules.
- Add Electron-specific adapters.
- Replace Mock adapters with Electron IPC adapters where needed.
- Add EXE packaging.

Do not let pages, widgets, or stores directly depend on Electron APIs. Electron should enter through adapters only.
