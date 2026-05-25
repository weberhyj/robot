import type {
  BinParameterForm,
  BinParameterItem,
  ChangeRecordItem,
  InstructionItem,
  ParameterDeviceItem,
  ParameterForm,
  SpeedPresetItem,
} from './types'
import binImage from '@/assets/images/devices/bin-a.svg'
import systemImage from '@/assets/images/devices/control-cabinet.svg'
import robotArmImage from '@/assets/images/devices/robot-arm.svg'

export const defaultParameterForm: ParameterForm = {
  robotSpeed: 65,
}

export const defaultBinParameterForm: BinParameterForm = {
  activeBinKey: 'ok01',
  id: 1,
  code: 'BIN_OK_01',
  type: 'ok',
  materialType: 'orange',
  maxCapacity: 2000,
  currentLoad: 0,
  fillRate: 0,
  sizeX: 1200,
  sizeY: 800,
  sizeZ: 600,
  positionX: 1250,
  positionY: 860,
  isCalibrated: false,
  capacityDetectionEnabled: true,
  warningThreshold: 79,
  warningLevel: 'warning',
}

export const parameterDeviceItems: ParameterDeviceItem[] = [
  {
    key: 'robot',
    titleKey: 'parameters.devices.robot',
    image: robotArmImage,
  },
  {
    key: 'bins',
    titleKey: 'parameters.devices.bins',
    image: binImage,
  },
  {
    key: 'system',
    titleKey: 'parameters.devices.system',
    image: systemImage,
  },
]

export const speedPresetItems: SpeedPresetItem[] = [
  { value: 25 },
  { value: 50 },
  { value: 75 },
  { value: 100 },
]

export const binParameterItems: BinParameterItem[] = [
  {
    key: 'ok01',
    id: 1,
    code: 'BIN_OK_01',
    type: 'ok',
    typeLabel: 'OK料箱',
    materialType: 'orange',
    materialTypeLabel: 'orange',
    calibrationLabel: '未标定',
    image: binImage,
    tone: 'blue',
    maxCapacity: 2000,
    currentLoad: 0,
    fillRate: 0,
    sizeX: 1200,
    sizeY: 800,
    sizeZ: 600,
    positionX: 1250,
    positionY: 860,
    isCalibrated: false,
  },
  {
    key: 'ok02',
    id: 2,
    code: 'BIN_OK_02',
    type: 'ok',
    typeLabel: 'OK料箱',
    materialType: 'box',
    materialTypeLabel: 'box',
    calibrationLabel: '已标定',
    image: binImage,
    tone: 'gray',
    maxCapacity: 2000,
    currentLoad: 0,
    fillRate: 0,
    sizeX: 1200,
    sizeY: 800,
    sizeZ: 600,
    positionX: 2480,
    positionY: 860,
    isCalibrated: true,
  },
  {
    key: 'ng01',
    id: 3,
    code: 'BIN_NG_01',
    type: 'ng',
    typeLabel: 'NG料箱',
    materialType: 'apple',
    materialTypeLabel: 'apple',
    calibrationLabel: '已标定',
    image: binImage,
    tone: 'red',
    maxCapacity: 1200,
    currentLoad: 0,
    fillRate: 0,
    sizeX: 1000,
    sizeY: 760,
    sizeZ: 560,
    positionX: 3680,
    positionY: 860,
    isCalibrated: true,
  },
]

export const instructionItems: InstructionItem[] = [
  {
    key: 'scope',
    textKey: 'parameters.instructions.scope',
  },
  {
    key: 'cycle',
    textKey: 'parameters.instructions.cycle',
  },
  {
    key: 'risk',
    textKey: 'parameters.instructions.risk',
  },
  {
    key: 'apply',
    textKey: 'parameters.instructions.apply',
  },
]

export const changeRecordItems: ChangeRecordItem[] = [
  {
    key: 'robot-speed',
    parameterKey: 'parameters.changeRecord.items.robotSpeed',
    originalValue: '50%',
    currentValue: '65%',
    changedAt: '2025-05-20 11:24:30',
    operatorKey: 'parameters.changeRecord.operators.engineer',
    remarkKey: 'parameters.changeRecord.remarks.robotSpeed',
  },
]

export const binChangeRecordItems: ChangeRecordItem[] = [
  {
    key: 'bin-warning-threshold',
    parameterKey: 'parameters.changeRecord.items.capacityWarningThreshold',
    originalValue: '70%',
    currentValue: '79%',
    changedAt: '2025-05-20 14:25:33',
    operatorKey: 'parameters.changeRecord.operators.zhangSan',
    remarkKey: 'parameters.changeRecord.remarks.capacityWarningThreshold',
  },
]
