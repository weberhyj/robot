import type { DownloadEvent, Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { check } from '@tauri-apps/plugin-updater'

export type UpdateProgressHandler = (progress: number | undefined) => void

export async function checkAppUpdate(): Promise<Update | null> {
  if (!window.__TAURI_INTERNALS__)
    throw new Error('Tauri updater is only available in the desktop app.')

  return await check({ timeout: 15000 })
}

export async function downloadAndInstallAppUpdate(
  update: Update,
  onProgress: UpdateProgressHandler,
): Promise<void> {
  let downloadedBytes = 0
  let contentLength: number | undefined

  await update.downloadAndInstall((event) => {
    const progress = calculateUpdateProgress(event, downloadedBytes, contentLength)

    if (event.event === 'Started') {
      downloadedBytes = 0
      contentLength = event.data.contentLength
    }

    if (event.event === 'Progress')
      downloadedBytes += event.data.chunkLength

    onProgress(progress)
  })
}

export async function relaunchApp(): Promise<void> {
  await relaunch()
}

function calculateUpdateProgress(
  event: DownloadEvent,
  downloadedBytes: number,
  contentLength: number | undefined,
): number | undefined {
  if (event.event === 'Started')
    return event.data.contentLength ? 0 : undefined

  if (event.event === 'Finished')
    return 100

  if (!contentLength)
    return undefined

  return Math.min(99, Math.round(((downloadedBytes + event.data.chunkLength) / contentLength) * 100))
}
