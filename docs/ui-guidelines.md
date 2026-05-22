# UI Guidelines

This document defines the visual and interaction guidelines for the ROBOFLOW frontend application.

The UI should feel like a professional industrial control console: calm, readable, precise, and built for repeated operation.

## Visual Direction

Use a light industrial dashboard style.

Prefer:

- Low-saturation page backgrounds
- White or near-white content panels
- Clear card boundaries
- Soft shadows
- Compact spacing
- Explicit status colors
- Dense but readable data layouts

Avoid:

- Marketing-style hero sections
- Decorative gradient backgrounds
- Glassmorphism
- Large blocks of explanatory copy
- Overly playful motion
- Nested cards
- Visual effects that reduce operational clarity

## Layout

Use a unified workbench shell across main pages.

The shell should keep these global areas visually stable:

- Left sidebar navigation
- Top status bar
- Main route content
- Bottom system status bar

Prioritize these viewport sizes:

- `1920x1080`
- `1366x768`

Use fixed or predictable dimensions for critical console elements such as sidebars, status bars, metric cards, controls, tables, and chart panels.

Do not allow dynamic labels, hover states, or loading text to shift the main layout.

## Spacing

Use compact but breathable spacing.

Recommended spacing scale:

```txt
4px    Tiny gaps, icon alignment
8px    Compact internal spacing
12px   Form and control grouping
16px   Card padding and grid gaps
20px   Dense section spacing
24px   Major page groups
```

Avoid using the same padding everywhere. Give dense operational panels tighter spacing and summary areas slightly more room.

## Cards and Panels

Use cards for meaningful information modules.

Good card use:

- Robot status summary
- Device health card
- Alarm list
- Task history table
- Chart panel
- Parameter section

Avoid:

- Cards inside cards
- Repeated decorative card grids with no operational purpose
- Large empty cards used only for layout

Recommended card style:

```txt
Background: near-white
Border: subtle neutral border
Radius: 8px or less
Shadow: soft and restrained
Padding: 16px to 20px for normal panels
```

## Status Colors

Use status colors consistently.

```txt
Green   Normal, online, complete, healthy
Blue    Running, information, current step
Yellow  Warning, pending, attention required
Red     Alarm, error, emergency stop, dangerous action
Gray    Offline, disabled, unknown, inactive
```

Status color should never be the only indicator. Pair it with text, icon, label, or numeric state.

Use red only for real errors, alarms, emergency states, or destructive operations.

## Typography

Use clear hierarchy through size and weight.

Recommended usage:

```txt
Page title:        22px to 26px, strong weight
Section title:     16px to 18px, strong weight
Metric value:      24px to 34px, strong weight
Body text:         13px to 14px
Helper text:       12px to 13px
Table text:        12px to 14px
```

Avoid oversized typography inside compact panels.

Keep labels short and operational.

## Element Plus Usage

Prefer Element Plus components for common UI patterns.

Use Element Plus for:

- Buttons
- Forms
- Inputs
- Selects
- Switches
- Tabs
- Tables
- Popovers
- Tooltips
- Drawers
- Dialogs
- Messages
- Notifications

Customize Element Plus with SCSS when needed, but keep behavior and interaction patterns familiar.

Create custom components only when Element Plus or existing project components cannot produce the requested effect cleanly.

## Buttons and Actions

Button hierarchy should match operation risk.

Recommended semantics:

```txt
Primary    Main positive action, such as start or save
Default    Secondary action, such as reset, refresh, or view details
Warning    Risky but recoverable operation
Danger     Stop, emergency stop, delete, or destructive change
Text       Low-emphasis navigation or inline action
```

Emergency stop must be visually distinct from normal stop.

Dangerous actions should require clear confirmation when they can affect safety, configuration, or operation state.

## Forms

Use Element Plus form patterns for parameter configuration.

Parameter forms should support:

- Clear labels
- Units where needed
- Required state
- Range validation
- Inline validation messages
- Save feedback
- Reset behavior
- Unsaved change warnings

Use appropriate controls:

```txt
Switch      Boolean options
Input       Text values
InputNumber Numeric values
Select      Enumerated options
Slider      Continuous ranges when precision is not critical
Tabs        Parameter categories
```

Dangerous parameters should provide extra confirmation or warning text near the action, not hidden in a distant message.

## Tables

Use tables for dense operational records.

Tables should be compact, readable, and scannable.

Recommended table behavior:

- Fixed header when the table is tall
- Consistent column alignment
- Right-align numeric values when useful
- Use status tags for state fields
- Keep row actions short
- Avoid wrapping important identifiers

Do not overload tables with decorative icons.

## Charts

Use ECharts for all charts and data visualization.

Charts should support operational reading, not decoration.

Recommended chart rules:

- Use restrained colors from the status palette.
- Keep axis labels legible.
- Avoid unnecessary 3D effects.
- Avoid animated effects that distract from status reading.
- Include units in labels, tooltips, or titles.
- Keep legends short and stable.
- Use consistent colors for the same metric across pages.

Use charts for:

- Device health distribution
- Runtime trends
- Throughput trends
- OK and NG ratio
- Alarm trends
- Key metric history

## Icons

Use icons to improve scanning, not as decoration.

Prefer icon libraries already introduced in the project.

Navigation and action icons should be stable and predictable.

Use tooltips for icon-only buttons when the action is not obvious.

## Motion

Keep motion subtle and functional.

Good motion use:

- Status refresh feedback
- Panel expand or collapse
- Drawer entry and exit
- Loading transitions

Avoid:

- Decorative looping motion
- Layout-shifting animation
- Bouncy or playful easing
- Motion that distracts from alarms or live status

## Empty, Loading, and Error States

Every data panel should have clear loading, empty, and error states.

Use concise operational language.

Examples:

```txt
Loading device status...
No alarms
Failed to load parameters
Connection interrupted
```

Do not use casual or humorous copy in operational states.

## Copywriting

Visible text should be short, concrete, and operational.

Prefer:

- Connected
- Running
- Standby
- Alarm
- Save
- Reset
- Restore defaults

Avoid long explanations in panels. Put detailed documentation in external docs, not inside the control console.

## Accessibility

Do not rely on color alone to communicate state.

Make interactive elements keyboard reachable when practical.

Use readable contrast for text, status badges, and chart labels.

Use clear focus styles for buttons, inputs, tabs, and table actions.

## Responsive Behavior

The primary target is desktop operation.

For narrower screens:

- Preserve the global status areas.
- Keep critical safety controls visible.
- Allow tables and charts to scroll horizontally when needed.
- Avoid squeezing dense operational data until it becomes unreadable.

Do not optimize for small mobile screens unless explicitly requested.
