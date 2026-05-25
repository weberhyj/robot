export {
  closeGripperJaw,
  detectCameraOnce,
  getBinStatusSnapshot,
  getCameraStatusSnapshot,
  getCameraStreamUrl,
  getGripperStatusSnapshot,
  getPlcStatusSnapshot,
  getRobotStatusSnapshot,
  openGripperJaw,
  startConveyorSoftly,
  stopConveyorSoftly,
} from './plcRobotService'
export { checkAppUpdate, downloadAndInstallAppUpdate, relaunchApp } from './updateService'
export {
  createBin,
  deleteBin,
  fetchAlertEnums,
  fetchAlertPage,
  fetchBinEnums,
  fetchBins,
  fetchGraspRecordStatistics,
  fetchTaskGraspRecords,
  fetchTaskPage,
  updateBin,
} from '@/adapters/http/plcRobotApi'
