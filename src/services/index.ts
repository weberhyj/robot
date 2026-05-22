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
export { fetchGraspRecordStatistics, fetchTaskGraspRecords, fetchTaskPage } from '@/adapters/http/plcRobotApi'
