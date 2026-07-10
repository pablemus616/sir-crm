export interface MeRole {
  id: string
  name: string
}

export interface MeEmployee {
  id: string
  firstName: string
  lastName: string
}

export interface Me {
  id: string
  username: string
  roles: MeRole[]
  employee: MeEmployee | null
  /** Effective permission strings (`module:action`, plus `module:read:own`). */
  permissions: string[]
}
