import type { BinStatus, CameraDetectionResult, CameraStatus, CameraStreamQuery, GripperControlResponse, GripperStatus, PlcStatus } from '@/entities/device/types'
import type { RobotStatus } from '@/entities/robot/types'
import type { GraspRecordListResponse, GraspRecordQuery, GraspRecordStatistics, TaskListQuery, TaskListResponse } from '@/entities/task/types'

const fallbackApiBaseUrl = 'http://127.0.0.1:8080'
let runtimeConfigPromise: Promise<RoboflowRuntimeConfig> | undefined

export async function fetchPlcStatus(): Promise<PlcStatus> {
  return requestJson<PlcStatus>('/api/v1/plc/status')
}

export async function sendPlcSoftStart(): Promise<boolean> {
  return requestJson<boolean>('/api/v1/plc/soft_start')
}

export async function sendPlcSoftStop(): Promise<boolean> {
  return requestJson<boolean>('/api/v1/plc/soft_stop')
}

export async function fetchRobotStatus(): Promise<RobotStatus> {
  return requestJson<RobotStatus>('/api/v1/robot/status')
}

export async function fetchGripperStatus(): Promise<GripperStatus> {
  return requestJson<GripperStatus>('/api/v1/gripper/status')
}

export async function sendGripperOpen(): Promise<GripperControlResponse> {
  return requestJson<GripperControlResponse>(buildQueryPath('/api/v1/gripper/control', { action: 'open' }))
}

export async function sendGripperClose(position: number): Promise<GripperControlResponse> {
  return requestJson<GripperControlResponse>(buildQueryPath('/api/v1/gripper/control', { action: 'close', position }))
}

export async function fetchCameraStatus(): Promise<CameraStatus> {
  return requestJson<CameraStatus>('/api/v1/camera/status')
}

export async function triggerCameraDetection(): Promise<CameraDetectionResult> {
  return requestJson<CameraDetectionResult>('/api/v1/camera/detect')
}

export function buildCameraStreamUrl(query: CameraStreamQuery = {}): string {
  return buildDirectApiUrl(buildQueryPath('/api/v1/camera/stream', query))
}

export async function fetchBins(): Promise<BinStatus[]> {
  return requestJson<BinStatus[]>('/api/v1/bin')
}

export async function fetchTaskPage(query: TaskListQuery = {}): Promise<TaskListResponse> {
  return requestJson<TaskListResponse>(buildQueryPath('/api/v1/task', query))
}

export async function fetchTaskGraspRecords(
  taskId: number,
  query: GraspRecordQuery = {},
): Promise<GraspRecordListResponse> {
  return requestJson<GraspRecordListResponse>(buildQueryPath(`/api/v1/task/${taskId}/grasp_records`, query))
}

export async function fetchGraspRecordStatistics(): Promise<GraspRecordStatistics> {
  return requestJson<GraspRecordStatistics>('/api/v1/task/grasp_records/statistics')
}

async function resolveApiBaseUrl(): Promise<string> {
  const runtimeBaseUrl = await resolveRuntimeApiBaseUrl()

  if (runtimeBaseUrl)
    return trimTrailingSlash(runtimeBaseUrl)

  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl)
  }

  if (window.location.protocol === 'file:') {
    return fallbackApiBaseUrl
  }

  return ''
}

async function buildApiUrl(path: string): Promise<string> {
  const apiBaseUrl = await resolveApiBaseUrl()

  return `${apiBaseUrl}${path}`
}

function buildDirectApiUrl(path: string): string {
  return `${resolveDirectApiBaseUrl()}${path}`
}

function resolveDirectApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseUrl)
    return trimTrailingSlash(configuredBaseUrl)

  return fallbackApiBaseUrl
}

async function requestJson<TData>(path: string): Promise<TData> {
  const response = await fetch(await buildApiUrl(path))

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return await response.json() as TData
}

function buildQueryPath(path: string, query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '')
      params.set(key, String(value))
  })

  const queryString = params.toString()

  return queryString ? `${path}?${queryString}` : path
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, '')
}

async function resolveRuntimeApiBaseUrl(): Promise<string | undefined> {
  const runtimeConfig = await getRuntimeConfig()

  return runtimeConfig.apiBaseUrl?.trim()
}

async function getRuntimeConfig(): Promise<RoboflowRuntimeConfig> {
  if (!window.roboflowRuntime)
    return await getTauriRuntimeConfig()

  runtimeConfigPromise ??= window.roboflowRuntime.getConfig().catch(() => ({}))

  return await runtimeConfigPromise
}

async function getTauriRuntimeConfig(): Promise<RoboflowRuntimeConfig> {
  if (!window.__TAURI_INTERNALS__)
    return {}

  runtimeConfigPromise ??= import('@tauri-apps/api/core')
    .then(({ invoke }) => invoke<RoboflowRuntimeConfig>('get_runtime_config'))
    .catch(() => ({}))

  return await runtimeConfigPromise
}
