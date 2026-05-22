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
  code: 'BIN_OK_01',
  type: 'ok',
  materialType: 'ok01',
  maxCapacity: 2000,
  sizeX: 1200,
  sizeY: 800,
  sizeZ: 600,
  positionX: 1250,
  positionY: 860,
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
    code: 'BIN_OK_01',
    type: 'ok',
    materialType: 'ok01',
    typeKey: 'parameters.binConfig.types.ok',
    materialTypeKey: 'parameters.binConfig.materialTypes.ok01',
    calibrationKey: 'parameters.binConfig.calibration.uncalibrated',
    image: binImage,
    tone: 'blue',
    maxCapacity: 2000,
    sizeX: 1200,
    sizeY: 800,
    sizeZ: 600,
    positionX: 1250,
    positionY: 860,
  },
  {
    key: 'ok02',
    code: 'BIN_OK_02',
    type: 'ok',
    materialType: 'ok02',
    typeKey: 'parameters.binConfig.types.ok',
    materialTypeKey: 'parameters.binConfig.materialTypes.ok02',
    calibrationKey: 'parameters.binConfig.calibration.calibrated',
    image: binImage,
    tone: 'gray',
    maxCapacity: 2000,
    sizeX: 1200,
    sizeY: 800,
    sizeZ: 600,
    positionX: 2480,
    positionY: 860,
  },
  {
    key: 'ng01',
    code: 'BIN_NG_01',
    type: 'ng',
    materialType: 'ng01',
    typeKey: 'parameters.binConfig.types.ng',
    materialTypeKey: 'parameters.binConfig.materialTypes.ng01',
    calibrationKey: 'parameters.binConfig.calibration.calibrated',
    image: binImage,
    tone: 'red',
    maxCapacity: 1200,
    sizeX: 1000,
    sizeY: 760,
    sizeZ: 560,
    positionX: 3680,
    positionY: 860,
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
