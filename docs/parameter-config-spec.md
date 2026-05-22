# Parameter Configuration Spec

This document defines the frontend specification for the ROBOFLOW parameter configuration page.

The parameter page should provide a safe, clear, and predictable way to edit system and equipment settings during the frontend-only stage.

## Scope

The first version should cover these parameter groups:

- System
- Communication
- Robot
- Vision
- I/O
- Safety
- User Permissions

Do not integrate real configuration file persistence yet.

During the frontend-only stage, parameter changes should use local state, stores, services, and Mock adapters.

## Page Structure

Use one route for the parameter page.

Use a category navigation area for parameter groups.

Use a main form area for the selected group.

Use a persistent action area for form-level actions when practical.

Recommended page regions:

```txt
Parameter category navigation
Selected group title and description
Form content
Save / Reset / Restore defaults actions
Unsaved changes state
```

## Section Query

The active parameter section should be represented by a query value:

```txt
/parameters?section=system
/parameters?section=communication
/parameters?section=robot
/parameters?section=vision
/parameters?section=io
/parameters?section=safety
/parameters?section=users
```

If `section` is missing or invalid, default to `system`.

Changing sections should preserve valid unsaved-state behavior.

## Parameter Groups

### System

System parameters may include:

- Workstation name
- Language
- Time format
- Auto start preference
- Log retention days
- Theme preference if needed

### Communication

Communication parameters may include:

- Robot controller host
- Robot controller port
- Camera host
- PLC host
- Connection timeout
- Retry count
- Heartbeat interval

### Robot

Robot parameters may include:

- Default operation mode
- Speed limit
- Acceleration limit
- Home position behavior
- Coordinate limits
- Tool selection

### Vision

Vision parameters may include:

- Camera ID
- Exposure value
- Recognition threshold
- Model version
- Trigger mode
- Image save preference

### I/O

I/O parameters may include:

- Input point mappings
- Output point mappings
- Enabled state
- Signal name
- Signal polarity
- Debounce time

### Safety

Safety parameters may include:

- Emergency lock behavior
- Maximum robot speed
- Maximum gripper pressure
- Alarm threshold
- Safety reset requirement
- Operation timeout

### User Permissions

User permission parameters may include:

- Role name
- Page access
- Operation permission
- Dangerous action permission
- Parameter edit permission

Do not implement real authentication unless explicitly requested.

## Form Controls

Prefer Element Plus form controls.

Recommended control mapping:

```txt
Boolean value        Switch
Text value           Input
Number value         InputNumber
Enum value           Select
Continuous range     Slider or InputNumber
Multi-choice access  Checkbox group
Long text            Textarea
```

Use units directly near numeric fields when applicable.

Examples:

```txt
ms
s
mm
mm/s
%
kPa
days
```

## Validation Rules

Parameter forms should validate before saving.

Recommended validation categories:

- Required field validation
- Numeric range validation
- Integer-only validation
- IP or host validation where needed
- Port range validation
- Percentage range validation
- Timeout range validation
- Permission selection validation

Validation messages should be concise and operational.

Examples:

```txt
Host is required.
Port must be between 1 and 65535.
Speed must not exceed the safety limit.
Threshold must be between 0 and 100.
```

## Dangerous Parameters

Dangerous parameters are settings that may affect safety, motion, device control, or operational reliability.

Examples:

- Emergency lock behavior
- Speed limit
- Acceleration limit
- Coordinate limits
- Gripper pressure
- Safety reset requirement
- Dangerous action permissions

Dangerous parameter changes should be visually marked and require confirmation before saving when practical.

Confirmation copy should be clear and specific.

Avoid vague warnings such as:

```txt
This may be dangerous.
```

Prefer specific warnings such as:

```txt
Changing the speed limit may affect robot motion safety.
```

## Actions

The parameter page should support these actions:

- Save
- Reset current edits
- Restore defaults for the current section
- Switch parameter section

Action meanings:

- `Save`: validate and persist the current section to local state or Mock adapter.
- `Reset current edits`: discard unsaved changes for the current section.
- `Restore defaults`: replace the current section with default values and mark it as changed.
- `Switch parameter section`: move to another group while preserving unsaved-change rules.

## Unsaved Changes

The page should detect unsaved changes for each parameter section.

When unsaved changes exist, make the state visible near the action area.

When leaving the page or switching sections, warn the user if the change would discard edits.

Do not silently lose unsaved edits.

## Save Feedback

Saving should produce clear user feedback.

Recommended states:

```txt
idle
saving
saved
failed
```

Success message example:

```txt
Parameters saved.
```

Failure message example:

```txt
Failed to save parameters.
```

## Mock Behavior

During the frontend-only stage, Mock behavior should support:

- Loading existing parameter values
- Saving edited values
- Resetting edits
- Restoring defaults
- Simulating save failure when needed for UI testing

Mock data should not be hardcoded inside the page template.

## Layout Rules

Keep the parameter page consistent with the ROBOFLOW dashboard style.

Use compact sections and readable forms.

Avoid placing too many unrelated fields in one uninterrupted column.

Group related fields under clear section headings.

Keep dangerous settings visually distinct but not visually noisy.

## Out of Scope

The first frontend version does not include:

- Real authentication
- Real configuration file persistence
- Real device parameter writes
- Electron IPC integration
- PLC communication
- Robot SDK integration
- Camera SDK integration
