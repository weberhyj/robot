export interface MaterialType {
  id: number
  code: string
  name: string
  description: string | null
  sort_order: number
  enabled: boolean
  created_at: string | null
  updated_at: string | null
}

export interface MaterialTypeQuery {
  enabled_only?: boolean
}

export interface MaterialTypePayload {
  code: string
  name: string
  description?: string | null
  sort_order?: number
  enabled?: boolean
}

export type MaterialTypeUpdatePayload = Partial<MaterialTypePayload>
