import type { AlarmItem, DeviceItem, SummaryItem } from './types'

export const summaryItems: SummaryItem[] = [
  { label: '实时监控', value: '12', hint: '全部在线接入', tone: 'blue' },
  { label: '运行中', value: '8', hint: '设备执行生产', tone: 'green' },
  { label: '待机中', value: '2', hint: '等待任务下发', tone: 'blue' },
  { label: '报警中', value: '1', hint: '控制柜待处理', tone: 'red' },
  { label: '离线', value: '1', hint: '维护断开连接', tone: 'gray' },
  { label: '健康度', value: '92%', hint: '整体健康评分', tone: 'green' },
]

export const devices: DeviceItem[] = [
  { name: '机器人本体', model: 'RX-6E-A1250', serial: 'RX6EA1250240501', status: 'green', mode: '自动模式', runtime: '1286 h', health: 95, firmware: 'v2.5.1' },
  { name: '传送带', model: 'CTB-500', serial: 'CTB5002405001', status: 'green', mode: '自动模式', runtime: '986 h', health: 90, firmware: 'v1.3.2' },
  { name: '工业相机', model: 'CAM-2000', serial: 'CAM2000240501', status: 'green', mode: '触发模式', runtime: '542 h', health: 88, firmware: 'v3.1.0' },
  { name: '电动夹爪', model: 'GRP-100', serial: 'GRP1002405001', status: 'blue', mode: '手动模式', runtime: '236 h', health: 85, firmware: 'v1.2.0' },
  { name: 'IO 模块', model: 'IOM-1616', serial: 'IOM1616240501', status: 'green', mode: '正常', runtime: '1286 h', health: 94, firmware: 'v2.0.1' },
  { name: '控制柜', model: 'CTRL-3000', serial: 'CTRL3000240501', status: 'red', mode: '自动模式', runtime: '1286 h', health: 65, firmware: 'v1.1.0', badge: '过滤报警' },
]

export const alarms: AlarmItem[] = [
  { title: '控制柜过滤报警', code: 'CTRL-3000', time: '14:25:30', status: '未确认', tone: 'red' },
  { title: '夹爪过载保护', code: 'GRP-100', time: '14:20:15', status: '已确认', tone: 'yellow' },
  { title: '传送带偏移报警', code: 'CTB-500', time: '14:15:42', status: '需升级', tone: 'yellow' },
  { title: '相机帧率波动', code: 'CAM-2000', time: '14:08:27', status: '观察中', tone: 'blue' },
]
