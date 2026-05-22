/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface RoboflowRuntimeConfig {
  readonly apiBaseUrl?: string
}

interface Window {
  readonly __TAURI_INTERNALS__?: unknown
  readonly roboflowRuntime?: {
    getConfig: () => Promise<RoboflowRuntimeConfig>
  }
}
