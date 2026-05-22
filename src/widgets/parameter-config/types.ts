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
  originalValue: string
  currentValue: string
  changedAt: string
  operatorKey: string
  remarkKey: string
}

export type BinParameterKey = 'ok01' | 'ok02' | 'ng01'

export type BinParameterTone = 'blue' | 'gray' | 'red'

export interface BinParameterItem {
  key: BinParameterKey
  code: string
  type: string
  materialType: string
  typeKey: string
  materialTypeKey: string
  calibrationKey: string
  image: string
  tone: BinParameterTone
  maxCapacity: number
  sizeX: number
  sizeY: number
  sizeZ: number
  positionX: number
  positionY: number
}

export interface ParameterForm {
  robotSpeed: number
}

export interface BinParameterForm {
  activeBinKey: BinParameterKey
  code: string
  type: string
  materialType: string
  maxCapacity: number
  sizeX: number
  sizeY: number
  sizeZ: number
  positionX: number
  positionY: number
  capacityDetectionEnabled: boolean
  warningThreshold: number
  warningLevel: string
}
