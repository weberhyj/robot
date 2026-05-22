import type { CameraDetectionResult, CameraStreamQuery, GripperControlResponse } from '@/entities/device/types'
import type { PlcRobotStatusSnapshot } from '@/entities/plc-robot/types'
import { buildCameraStreamUrl, fetchBins, fetchCameraStatus, fetchGripperStatus, fetchPlcStatus, fetchRobotStatus, sendGripperClose, sendGripperOpen, sendPlcSoftStart, sendPlcSoftStop, triggerCameraDetection } from '@/adapters/http/plcRobotApi'

export async function getPlcStatusSnapshot(): Promise<PlcRobotStatusSnapshot> {
  return {
    plc: await settle(fetchPlcStatus),
  }
}

export async function getRobotStatusSnapshot(): Promise<PlcRobotStatusSnapshot> {
  return {
    robot: await settle(fetchRobotStatus),
  }
}

export async function getGripperStatusSnapshot(): Promise<PlcRobotStatusSnapshot> {
  return {
    gripper: await settle(fetchGripperStatus),
  }
}

export async function getCameraStatusSnapshot(): Promise<PlcRobotStatusSnapshot> {
  return {
    camera: await settle(fetchCameraStatus),
  }
}

export async function detectCameraOnce(): Promise<CameraDetectionResult> {
  return await triggerCameraDetection()
}

export function getCameraStreamUrl(query: CameraStreamQuery = {}): string {
  return buildCameraStreamUrl(query)
}

export async function getBinStatusSnapshot(): Promise<PlcRobotStatusSnapshot> {
  return {
    bins: await settle(fetchBins),
  }
}

export async function startConveyorSoftly(): Promise<boolean> {
  return await sendPlcSoftStart()
}

export async function stopConveyorSoftly(): Promise<boolean> {
  return await sendPlcSoftStop()
}

export async function openGripperJaw(): Promise<GripperControlResponse> {
  return await sendGripperOpen()
}

export async function closeGripperJaw(position: number): Promise<GripperControlResponse> {
  return await sendGripperClose(position)
}

async function settle<TData>(request: () => Promise<TData>): Promise<TData | undefined> {
  try {
    return await request()
  }
  catch {
    return undefined
  }
}
