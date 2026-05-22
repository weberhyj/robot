# ROBOFLOW

ROBOFLOW is a frontend-only robot upper-computer application for monitoring and operating a robotic sorting workstation.

The current stage focuses on a runnable, demo-ready frontend prototype. Real robot control, PLC communication, camera SDK integration, Electron main process logic, installers, and real configuration persistence are out of scope unless explicitly requested.

## Stack

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Vue I18n
- Element Plus
- ECharts
- SCSS
- Tauri
- pnpm
- Vitest
- @antfu/eslint-config

## Project Rules

Read [AGENTS.md](./AGENTS.md) before changing the project.

It defines durable project rules, frontend standards, architecture rules, and UI rules.

## Documentation

- [Project Structure](./docs/project-structure.md)
- [Route Spec](./docs/route-spec.md)
- [UI Guidelines](./docs/ui-guidelines.md)
- [Data Flow](./docs/data-flow.md)
- [Parameter Configuration Spec](./docs/parameter-config-spec.md)
- [Development Plan](./docs/development-plan.md)

## Downloads

Download the latest public installers from [GitHub Releases](https://github.com/weberhyj/robot/releases/latest).

Release assets include:

- Windows installer: `.exe`
- Ubuntu package: `.deb`

Development builds can also be created manually from GitHub Actions:

- [Package Windows](https://github.com/weberhyj/robot/actions/workflows/package-win.yml)
- [Package Ubuntu](https://github.com/weberhyj/robot/actions/workflows/package-ubuntu.yml)

To publish a new release, push a version tag:

```bash
git tag v0.0.1
git push origin v0.0.1
```

## Frontend Scope

The frontend should open directly into the control console.

The default UI locale is Chinese, configured as `zh-CN` through Vue I18n.

The UI should follow a light industrial dashboard style with clear operational semantics, stable status areas, Element Plus interaction patterns, and ECharts-based visualization.

During the frontend-only stage, use Mock data and local state through stores, services, and adapters. Do not couple pages or widgets directly to transport details.

## Commands

Use `pnpm` for all frontend commands.

Common commands should be defined by the frontend project once the app is initialized:

```txt
pnpm install
pnpm dev
pnpm build
pnpm tauri:dev
pnpm package:win
pnpm test
pnpm lint --fix
```

If a command is not available yet, add the matching script during project setup instead of switching package managers.
