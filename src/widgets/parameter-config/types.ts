export type ParameterDeviceKey = 'robot' | 'bins' | 'system'

export interface ParameterDeviceItem {
  key: ParameterDeviceKey
  titleKey: string
  image: string
}

export interface SpeedPresetItem {
  value: number
}

export interface InstructionItem {
  key: string
  textKey: string
}

export interface ChangeRecordItem {
  key: string
  parameterKey: string
  parameterLabel?: string
  originalValue: string
  currentValue: string
  changedAt: string
  operatorKey: string
  operatorLabel?: string
  remarkKey: string
  remarkLabel?: string
}

export type BinParameterKey = string

export type BinParameterTone = 'blue' | 'gray' | 'red'

export interface BinParameterItem {
  key: BinParameterKey
  id?: number
  isDraft?: boolean
  code: string
  type: string
  typeLabel: string
  materialType: string
  materialTypeLabel: string
  calibrationLabel: string
  image: string
  tone: BinParameterTone
  maxCapacity: number
  currentLoad: number
  fillRate: number
  sizeX: number
  sizeY: number
  sizeZ: number
  positionX: number
  positionY: number
  isCalibrated: boolean
}

export interface ParameterForm {
  robotSpeed: number
}

export interface BinParameterForm {
  activeBinKey: BinParameterKey
  id?: number
  code: string
  type: string
  materialType: string
  maxCapacity: number
  currentLoad: number
  fillRate: number
  sizeX: number
  sizeY: number
  sizeZ: number
  positionX: number
  positionY: number
  isCalibrated: boolean
  capacityDetectionEnabled: boolean
  warningThreshold: number
  warningLevel: string
}
