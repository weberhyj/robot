# Mock Data Contract

This document records the current frontend-only data contract for ROBOFLOW.

The project has no backend or device interface yet. Until real APIs or Electron IPC are available, pages should keep using Mock data through typed modules. This document is the reference for stabilizing field names, status enums, and future adapter boundaries.

## Current State

- `src/entities/*/types.ts` currently contains placeholders.
- Most concrete Mock structures live in `src/widgets/*/types.ts`.
- Most concrete Mock values live in `src/widgets/*/data.ts`.
- `src/adapters/mock/index.ts` is currently empty.
- Future API or IPC integration should replace Mock adapters and services, not page templates.

## Source Files

| Area                    | Types                                     | Mock values                                                        |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| Dashboard               | `src/widgets/dashboard-overview/types.ts` | `src/widgets/dashboard-overview/data.ts`                           |
| Alarm records           | `src/widgets/alarm-records/types.ts`      | `src/widgets/alarm-records/data.ts`                                |
| Parameter configuration | `src/widgets/parameter-config/types.ts`   | `src/widgets/parameter-config/data.ts`                             |
| Manual control          | `src/widgets/manual-control/types.ts`     | inline state in `src/widgets/manual-control/ManualControlView.vue` |
| App shell               | `src/stores/appStore.ts`                  | store initial state                                                |

## App Shell

`AppSystemState`

| Field              | Type                                        | Notes                                        |
| ------------------ | ------------------------------------------- | -------------------------------------------- |
| `connectionStatus` | `connected` / `disconnected`                | Bottom system bar connection state.          |
| `safetyStatus`     | `normal` / `warning` / `emergency`          | Bottom system bar safety state.              |
| `controlMode`      | `automatic` / `manual` / `maintenance`      | Controls manual route visibility and access. |
| `ipAddress`        | string                                      | Display only for now.                        |
| `version`          | string                                      | Display only for now.                        |
| `userName`         | string                                      | Top account display.                         |
| `userRole`         | `administrator` / `operator` / `maintainer` | Top account role display.                    |

Route rules:

- Normal sidebar entries: dashboard, alarms, parameters.
- Realtime and devices routes exist but are hidden from sidebar.
- Manual route is visible and accessible only when `controlMode === 'manual'`.

## Dashboard

### Workstation Summary

Current implementation keeps workstation status local to `DashboardOverview.vue`.

| Field     | Type                   | Notes                                                     |
| --------- | ---------------------- | --------------------------------------------------------- |
| `status`  | `running` / `stopped`  | Displayed as running or stopped icon.                     |
| `runtime` | string                 | Example: `08:26:34`.                                      |
| `mode`    | `automatic` / `manual` | Displayed as small text beside running state when needed. |

### Metrics

`MetricSource`

| Field       | Type                                | Notes                     |
| ----------- | ----------------------------------- | ------------------------- |
| `key`       | string                              | Stable metric id.         |
| `labelKey`  | i18n key                            | Metric label.             |
| `value`     | string                              | Display value.            |
| `unitKey`   | i18n key, optional                  | Unit label.               |
| `hintKey`   | i18n key                            | Secondary text.           |
| `tone`      | `blue` / `green` / `red`            | Status color.             |
| `breakdown` | `MetricBreakdownSource[]`, optional | Used by OK A/B breakdown. |

Current metrics:

- Sorting total
- OK count with A/B breakdown
- NG count
- Recognition accuracy
- Average duration

### Device Status Cards

`DeviceStatusSource`

| Field       | Type                                         | Notes                                 |
| ----------- | -------------------------------------------- | ------------------------------------- |
| `nameKey`   | i18n key                                     | Device name.                          |
| `code`      | string                                       | Device code.                          |
| `image`     | asset path                                   | Display image.                        |
| `statusKey` | i18n key                                     | Source status.                        |
| `labelKey`  | i18n key                                     | Field label, currently device status. |
| `valueKey`  | i18n key                                     | Display status or bin value.          |
| `tone`      | `green` / `blue` / `yellow` / `red` / `gray` | Status color.                         |
| `details`   | `DeviceStatusDetailSource[]`, optional       | Used by bin summary.                  |

Device status enum target:

| Device        | Allowed statuses                 |
| ------------- | -------------------------------- |
| Conveyor      | Standby, Running, Error, Offline |
| Robot arm     | Standby, Running, Error, Offline |
| Gripper       | Enabled, Running, Error, Offline |
| Vision camera | Online, Offline                  |
| Bins          | Capacity summary by A/B/NG       |

Alarm glow rule:

- Conveyor, robot arm, and gripper cards should show red warning glow when their status is Error.

### Device Detail Dialog

`DeviceDetailSource`

| Field       | Type                                                 | Notes                        |
| ----------- | ---------------------------------------------------- | ---------------------------- |
| `code`      | string                                               | Device code.                 |
| `type`      | `robot` / `camera` / `conveyor` / `gripper` / `bins` | Controls dialog layout.      |
| `nameKey`   | i18n key                                             | Dialog title device name.    |
| `image`     | asset path                                           | Device image.                |
| `statusKey` | i18n key                                             | Runtime status.              |
| `tone`      | status tone                                          | Status color.                |
| `fields`    | `DeviceDetailFieldSource[]`                          | General parameters.          |
| `joints`    | `RobotJointSource[]`, optional                       | Robot joint table.           |
| `tcpPose`   | `DeviceDetailFieldSource[]`, optional                | Robot TCP pose.              |
| `tcpWrench` | `DeviceDetailFieldSource[]`, optional                | Robot TCP force/torque.      |
| `bins`      | `BinCapacitySource[]`, optional                      | A/B/NG bin capacity details. |

Robot detail fields:

- Device image
- Device code
- Runtime status
- TCP pose: X, Y, Z, Rx, Ry, Rz
- TCP force/torque: Mx, My, Mz, Fx, Fy, Fz
- Joint table: joint, position, torque, motor current, motor/MCU temperature

Camera detail fields:

- Device image
- Device code
- Runtime status
- Current frame rate
- Current resolution

Conveyor detail fields:

- Device image
- Device code
- Runtime status
- Max load
- Running speed

Gripper detail fields:

- Device image
- Device code
- Runtime status
- Current close percentage
- Max stroke
- Close speed

Bin detail fields:

- A/B/NG category
- Total capacity
- Current loaded count
- Fill rate percentage
- Capacity progress bar

### Alarms On Dashboard

`AlarmSource`

| Field         | Type                                | Notes                                         |
| ------------- | ----------------------------------- | --------------------------------------------- |
| `key`         | string                              | Stable row key.                               |
| `alarmType`   | `AlarmType`                         | Used to navigate to alarm records with query. |
| `time`        | string                              | Time only in dashboard card.                  |
| `levelKey`    | i18n key                            | Display level.                                |
| `contentKey`  | i18n key                            | Alarm content.                                |
| `statusKey`   | i18n key                            | Display status.                               |
| `unconfirmed` | boolean                             | Drives unconfirmed style/count.               |
| `tone`        | `green` / `blue` / `yellow` / `red` | Status color.                                 |

Click behavior:

- Clicking a dashboard alarm item navigates to alarm records with `?type=<alarmType>`.

### Historical Tasks

`TaskSource`

| Field       | Type     | Notes                  |
| ----------- | -------- | ---------------------- |
| `id`        | string   | Task id.               |
| `nameKey`   | i18n key | Task name.             |
| `start`     | string   | Start time.            |
| `end`       | string   | End time.              |
| `total`     | string   | Sorting count.         |
| `okNg`      | string   | OK / NG display.       |
| `rate`      | string   | Good rate percentage.  |
| `statusKey` | i18n key | Task status.           |
| `done`      | boolean  | Success/failure style. |

Display rule:

- Dashboard shows up to 4 task rows.
- Detail action opens grasp record dialog.

### Grasp Records

`GraspRecordSource`

| Field          | Type     | Notes                   |
| -------------- | -------- | ----------------------- |
| `id`           | string   | Record id.              |
| `taskId`       | string   | Related task id.        |
| `time`         | string   | Record time.            |
| `materialKey`  | i18n key | Material category.      |
| `x`            | string   | X coordinate.           |
| `y`            | string   | Y coordinate.           |
| `theta`        | string   | Rotation angle.         |
| `confidence`   | string   | Recognition confidence. |
| `targetBinKey` | i18n key | Drop bin.               |
| `duration`     | string   | Operation duration.     |
| `resultKey`    | i18n key | Result text.            |
| `success`      | boolean  | Result style.           |

Dialog table columns:

- Time
- Material
- Coordinate X/Y/theta
- Confidence
- Drop bin
- Duration
- Result

## Alarm Records

`AlarmType`

- `cameraConnectionTimeout`
- `cameraRecognitionError`
- `robotConnectionTimeout`
- `robotError`
- `gripperGraspError`
- `conveyorError`
- `plcConnectionTimeout`
- `binCapacityWarning`
- `binCapacityFull`

`AlarmLevel`

- `critical`
- `warning`
- `info`

`AlarmProcessStatus`

- `unhandled`
- `processing`
- `completed`

`AlarmRecordSource`

| Field        | Type                 | Notes                      |
| ------------ | -------------------- | -------------------------- |
| `id`         | string               | Alarm id.                  |
| `alarmTime`  | string               | Full alarm time.           |
| `type`       | `AlarmType`          | Filterable alarm type.     |
| `level`      | `AlarmLevel`         | Filterable alarm level.    |
| `contentKey` | i18n key             | Alarm content.             |
| `status`     | `AlarmProcessStatus` | Filterable process status. |
| `handler`    | string               | Handler name or `-`.       |
| `handledAt`  | string               | Handled time or `-`.       |

Filter fields:

- Alarm type
- Alarm level
- Process status
- Date-time range

Pagination:

- Page sizes: 10, 20, 50

## Parameter Configuration

`ParameterDeviceKey`

- `robot`
- `bins`
- `system`

`ParameterForm`

| Field        | Type   | Notes                             |
| ------------ | ------ | --------------------------------- |
| `robotSpeed` | number | Robot speed percentage, 0 to 100. |

`BinParameterForm`

| Field                      | Type                     | Notes                                |
| -------------------------- | ------------------------ | ------------------------------------ |
| `activeBinKey`             | `ok01` / `ok02` / `ng01` | Active bin item.                     |
| `code`                     | string                   | Bin code.                            |
| `type`                     | string                   | Bin type, such as OK or NG.          |
| `materialType`             | string                   | Bound material type.                 |
| `maxCapacity`              | number                   | Max capacity in pieces.              |
| `sizeX`                    | number                   | Bin length, mm.                      |
| `sizeY`                    | number                   | Bin width, mm.                       |
| `sizeZ`                    | number                   | Bin height, mm.                      |
| `positionX`                | number                   | Placement X, mm.                     |
| `positionY`                | number                   | Placement Y, mm.                     |
| `capacityDetectionEnabled` | boolean                  | Whether capacity warning is enabled. |
| `warningThreshold`         | number                   | Warning threshold percentage.        |
| `warningLevel`             | string                   | Warning level.                       |

Bin capacity rule:

- Full threshold was removed from UI.
- Warning threshold is the only configurable capacity rule.
- Current default warning threshold: 79%.

Actions:

- Restore recommendation
- Save draft
- Apply parameters
- Reset bin capacity defaults

## Manual Control

Manual page currently keeps state inside `ManualControlView.vue`.

Device cards:

| Device   | Fields                                                                       |
| -------- | ---------------------------------------------------------------------------- |
| Conveyor | Device code, current status, current speed                                   |
| Camera   | Device code, current status, current frame rate                              |
| Gripper  | Device code, adjustable max stroke, current status, current close percentage |

Gripper rules:

- Max stroke: 10 cm
- Close percentage range: 0% to 100%
- Display stroke = close percentage / 100 \* 10 cm

Recognition result dialog:

| Field              | Notes                        |
| ------------------ | ---------------------------- |
| Recognition status | Success/failure display.     |
| Item category      | Current recognized category. |
| Confidence         | Percentage.                  |
| Item position      | X/Y/Z.                       |
| Recognition time   | Full timestamp.              |

Sorting execution result order:

- Material loading / Item category
- Material transfer / Bin
- Material recognition / Confidence
- Material grasp / Start time
- Material sorting / End time

## Future Adapter Boundary

When APIs or Electron IPC are available, introduce adapter methods around these domains:

```ts
interface DashboardAdapter {
  getSummary: () => Promise<DashboardSummary>
  getDeviceStatuses: () => Promise<DeviceStatusSource[]>
  getDeviceDetail: (code: string) => Promise<DeviceDetailSource>
  getRecentAlarms: () => Promise<AlarmSource[]>
  getHistoricalTasks: () => Promise<TaskSource[]>
  getGraspRecords: (taskId: string, page: number, pageSize: number) => Promise<PagedResult<GraspRecordSource>>
}

interface AlarmAdapter {
  searchAlarms: (filters: AlarmRecordFilters, page: number, pageSize: number) => Promise<PagedResult<AlarmRecordSource>>
}

interface ParameterAdapter {
  getParameterState: () => Promise<ParameterState>
  saveDraft: (payload: ParameterState) => Promise<void>
  applyParameters: (payload: ParameterState) => Promise<void>
  restoreDefaults: (scope: ParameterDeviceKey) => Promise<ParameterState>
}

interface ManualControlAdapter {
  startConveyor: () => Promise<void>
  stopConveyor: () => Promise<void>
  resetConveyorFault: () => Promise<void>
  triggerRecognition: () => Promise<RecognitionResult>
  setGripperClosePercent: (percent: number) => Promise<void>
  openGripper: () => Promise<void>
  closeGripper: () => Promise<void>
  runSortingFlow: () => Promise<SortingFlowResult>
}
```

`PagedResult<T>`

```ts
interface PagedResult<T> {
  items: T[]
  total: number
}
```

## Refactor Target Before Real Integration

Before connecting real APIs or IPC, move these structures into shared domain layers:

1. Move stable domain types from `widgets/*/types.ts` into `src/entities/*/types.ts`.
2. Move Mock values from `widgets/*/data.ts` into `src/adapters/mock`.
3. Add services in `src/services` that call adapters.
4. Keep pages and widgets reading data from stores/services.
5. Add tests for route rules, filter behavior, dialog open behavior, and parameter form transforms.
