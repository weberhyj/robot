# Data Flow

This document defines frontend data-flow rules for the ROBOFLOW application.

The goal is to keep UI code independent from transport details and make the frontend-only Mock stage replaceable during later EXE integration.

## Core Flow

Use this data flow by default:

```txt
Page
 -> Widget
 -> Store
 -> Service
 -> Adapter
```

Meaning:

- Pages compose route-level UI.
- Widgets render business UI blocks.
- Stores hold shared state and orchestrate data loading.
- Services expose frontend business operations.
- Adapters handle the actual data source or transport.

## Dependency Direction

Dependencies should flow downward:

```txt
pages -> widgets -> stores -> services -> adapters
```

Allowed examples:

- A page imports widgets.
- A widget imports a store.
- A store imports a service.
- A service imports an adapter.
- An adapter imports Mock data during the frontend-only stage.

Avoid:

- A service importing a page or widget.
- An adapter importing a store.
- A page importing Mock data directly.
- A widget calling Electron IPC, WebSocket, HTTP, serial communication, robot SDKs, camera SDKs, or PLC APIs directly.

## Pages

Pages should be thin composition surfaces.

Pages may:

- Compose widgets.
- Read route params or query values.
- Trigger page-level initialization.
- Provide route-level layout decisions.

Pages should not:

- Own large business templates.
- Hardcode operational data.
- Call Mock adapters directly.
- Call transport APIs directly.
- Contain device protocol logic.

## Widgets

Widgets own business UI sections.

Widgets may:

- Read stores.
- Emit user actions.
- Contain local UI-only state.
- Compose shared UI components.

Widgets should not:

- Own transport details.
- Import Mock data directly.
- Duplicate domain state already owned by stores.
- Contain unrelated UI sections with different responsibilities.

## Stores

Stores hold app state that is shared across pages or widgets.

Stores may:

- Load data through services.
- Hold source state.
- Expose derived state.
- Coordinate refresh and polling behavior.
- Normalize data for widgets.

Stores should not:

- Contain raw transport code.
- Import Vue route components.
- Hold purely local UI state that belongs inside a widget.
- Duplicate data that can be derived with computed values.

## Services

Services expose business operations to stores and widgets.

Services may:

- Call adapters.
- Apply business-level transformations.
- Handle service-level errors.
- Provide stable methods for stores.

Services should not:

- Import Vue components.
- Depend on Element Plus.
- Depend on route state.
- Expose transport-specific details to the UI layer.

## Adapters

Adapters are the boundary between frontend business code and data sources.

During the frontend-only stage, adapters should use Mock data or simulators.

During later integration, adapters may call:

- Electron IPC
- HTTP APIs
- WebSocket streams
- Local runtime bridges

Adapters should hide transport details from services, stores, widgets, and pages.

## Mock Data

Mock data should live under Mock-specific files or adapter folders.

Mock data should be realistic enough to drive UI states, including:

- Running
- Standby
- Warning
- Alarm
- Offline
- Empty state
- Loading state
- Save success
- Save failure

Do not scatter Mock records inside page templates.

## Realtime Updates

Realtime-like data should be simulated through stores or adapters.

Recommended patterns:

- Store-level polling for simple status refresh.
- Adapter-level simulator for device or robot status changes.
- Explicit cleanup when a component or store no longer needs updates.

Avoid creating independent timers in many widgets. Prefer one owner per realtime data domain.

## Error Handling

Errors should be handled close to the layer that can make the best decision.

Recommended handling:

- Adapter: transport failure details.
- Service: business operation failure.
- Store: state transitions and retry state.
- Widget: user-facing display.

UI error messages should be concise and operational.

Examples:

```txt
Failed to load device status.
Failed to save parameters.
Connection interrupted.
```

## Loading and Empty States

Data panels should account for loading, empty, and error states.

Do not assume Mock data is always present.

Use consistent state names where practical:

```txt
idle
loading
success
error
empty
```

## Future EXE Integration

When real EXE integration starts, replace adapters first.

The target migration path is:

```txt
Mock Adapter -> Electron IPC Adapter
Mock Adapter -> HTTP Adapter
Mock Adapter -> WebSocket Adapter
```

Pages and widgets should not need to change for transport replacement.

If UI code needs to change during adapter replacement, treat it as a sign that the data boundary is leaking.
