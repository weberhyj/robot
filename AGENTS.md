# AGENTS.md

## Project Rules

ROBOFLOW is currently a frontend-only robot upper-computer application.

Do not integrate real robots, PLCs, cameras, serial communication, Electron main process logic, installers, auto update, real authentication, or real configuration persistence unless explicitly requested.

The app should open directly into the control console, not a marketing or landing page.

## Frontend Standards

Use the existing frontend stack and conventions. For new setup work, default to:

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Vue I18n
- Element Plus
- ECharts
- SCSS
- pnpm
- Vitest
- @antfu/eslint-config

Use `pnpm` for all frontend commands.

Use Vue I18n for user-facing text. The default locale is `zh-CN`.

Prefer Element Plus and libraries already introduced in the project for new frontend features.

Use ECharts for all charts and data visualization.

Use SCSS for style changes whenever possible. If SCSS is not introduced in a future frontend project, remind the user before writing styles.

Create custom components only when existing project libraries or public components cannot achieve the requested effect.

## Antfu Conventions

Follow the local `antfu` skill for JavaScript and TypeScript conventions unless it conflicts with this file or existing project code.

Apply these conventions by default:

- Keep files focused on a single responsibility.
- Split large files when they handle too many concerns.
- Put shared constants in `constants.ts`.
- Prefer explicit TypeScript return types.
- Avoid complex inline types; extract them into named types or interfaces.
- Avoid unnecessary comments; comments should explain why, not how.
- Use `@antfu/eslint-config` for linting and formatting.
- Use Vitest with `describe` and `it` for tests.
- Run `pnpm run lint --fix` after frontend code changes when available.

Project-specific rules override Antfu conventions. Use `pnpm` directly instead of `ni` or `nr`.

## Type Organization Rules

Keep Vue SFC files focused on view composition, template structure, and small local behavior.

Do not let `.vue` files accumulate interface blocks, source data definitions, or large view-model declarations.

When a Vue SFC needs more than one non-trivial interface, or its `<script setup>` block grows beyond roughly 80 lines, extract module-local types into an adjacent `types.ts`.

Use module-local `types.ts` for types that belong to one page, widget, entity, or feature folder.

Use `src/shared/types/` only for types reused across multiple features, pages, stores, services, or adapters.

Do not move feature-specific display models into `src/shared/types/` just to reduce a component file.

Keep tiny one-off local types inside a component only when they are private to that component and do not make the SFC harder to scan.

When static presentation data, mock rows, or i18n source maps make a component script bulky, move them to an adjacent `data.ts`, `mock.ts`, or feature-local adapter file.

## Architecture Rules

Use a layered frontend structure.

Keep pages, widgets, entities, stores, services, mocks, and shared utilities separated by responsibility.

Pages and widgets must not hardcode business data directly. Use stores, services, or Mock adapters.

Keep UI components decoupled from transport details.

During the frontend-only stage, services may call Mock adapters. During later EXE integration, replace adapters rather than rewriting pages or business components.

Do not let UI components directly depend on serial communication, PLC communication, camera SDKs, robot SDKs, or Electron main-process APIs.

## UI and UX Rules

Keep new UI work consistent with the existing ROBOFLOW dashboard style and Element Plus patterns.

Use a light industrial control-console style with low-saturation backgrounds, clear cards, restrained shadows, and explicit status colors.

Do not use large blocks of explanatory product copy inside the app.

Do not use decorative gradient backgrounds, glassmorphism, or excessive visual effects.

Use cards for meaningful information modules. Do not nest cards inside cards.

Prefer Element Plus interaction patterns for forms, tables, tabs, buttons, popovers, dialogs, and feedback.

Prioritize `1920x1080` and `1366x768` layouts.

Buttons, states, tables, and form fields must have clear industrial software semantics.

Important operations must clearly distinguish normal actions, dangerous actions, and emergency actions.

Dangerous parameters must have clear validation and confirmation feedback.

Use these status color semantics consistently:

- Green: normal, online, complete
- Blue: running, information, current step
- Yellow: warning, pending
- Red: alarm, error, emergency stop
- Gray: offline, disabled, unknown
