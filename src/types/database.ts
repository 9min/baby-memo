export interface Family {
  id: string
  code: string
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  device_id: string
  family_id: string
  nickname: string | null
  created_at: string
  updated_at: string
}
