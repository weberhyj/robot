import type { BinItem, GripperMetric, JointItem, LogRow, StatusCard } from './types'

export const statusCards: StatusCard[] = [
  { title: '传送带', main: '运行', sub: '0.42 m/s', state: '正常', tone: 'green' },
  { title: '识别相机', main: '在线', sub: 'CAM-01 28°C', state: '正常', tone: 'green' },
  { title: '机械臂', main: '执行中', sub: 'P12 / 65%', state: '正常', tone: 'green' },
  { title: '末端夹具', main: '吸附中', sub: '-62 kPa', state: '正常', tone: 'green' },
  { title: 'OK料箱', main: '部分满载', sub: 'A38% B80% C47%', state: '预警', tone: 'yellow' },
  { title: 'NG料箱', main: '可用', sub: '16%', state: '正常', tone: 'green' },
]

export const logs: LogRow[] = [
  { time: '14:30:42', level: '信息', module: '机械臂', action: '到达抓取位 P12', result: '完成', tone: 'green' },
  { time: '14:30:40', level: '信息', module: '夹爪', action: '真空吸附确认', result: '完成', tone: 'green' },
  { time: '14:30:38', level: '信息', module: '视觉', action: '识别金属壳体', result: '完成', tone: 'green' },
  { time: '14:30:34', level: '警告', module: '料箱', action: 'OK料箱容量偏高', result: '预警', tone: 'yellow' },
  { time: '14:30:31', level: '信息', module: '输送带', action: '速度稳定 0.42m/s', result: '完成', tone: 'green' },
  { time: '14:30:28', level: '信息', module: '机械臂', action: '投放至 A-01', result: '完成', tone: 'green' },
]

export const joints: JointItem[] = [
  ['关节 1', '-45.2°'],
  ['关节 2', '23.7°'],
  ['关节 3', '-88.1°'],
  ['关节 4', '91.3°'],
  ['关节 5', '-12.4°'],
  ['关节 6', '45.6°'],
]

export const gripperMetrics: GripperMetric[] = [
  ['夹持力', '32.5 N', 76],
  ['开合位置', '45.2 mm', 90],
  ['温度', '28.5 °C', 48],
  ['电压', '24.1 V', 55],
]

export const bins: BinItem[] = [
  { id: 'A-01', label: 'A类物料', count: 1286, progress: 78, tone: 'blue' },
  { id: 'B-02', label: 'B类物料', count: 946, progress: 62, tone: 'green' },
]
