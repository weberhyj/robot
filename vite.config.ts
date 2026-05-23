import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

function resolveAppVersion(): string {
  const envVersion = process.env.VITE_APP_VERSION?.trim()

  if (envVersion)
    return envVersion

  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
  }
  catch {
    return `v${process.env.npm_package_version ?? '0.0.0'}`
  }
}

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(resolveAppVersion()),
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
