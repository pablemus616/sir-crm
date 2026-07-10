import {
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Contact,
  FileText,
  GitBranch,
  History,
  IdCard,
  Inbox,
  Key,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  PhoneCall,
  Shield,
  Tags,
  Target,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Me } from './types'
import { canRead } from './permissions'

export type NavAccess = 'auth' | 'admin'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  access: NavAccess
  /** Permission module gating this item. Undefined = visible to any auth user. */
  module?: string
}

export interface NavGroup {
  label: string
  access: NavAccess
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'General',
    access: 'auth',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, access: 'auth', module: 'dashboard' },
      { label: 'Guía', href: '/guia', icon: BookOpen, access: 'auth' },
    ],
  },
  {
    label: 'Comercial',
    access: 'auth',
    items: [
      { label: 'Oportunidades', href: '/opportunities', icon: Target, access: 'auth', module: 'opportunities' },
      { label: 'Clientes', href: '/clients', icon: Building2, access: 'auth', module: 'clients' },
      { label: 'Contactos', href: '/client-contacts', icon: Contact, access: 'auth', module: 'client-contacts' },
      { label: 'Requests', href: '/contact-requests', icon: Inbox, access: 'auth', module: 'contact-requests' },
      { label: 'Historial', href: '/contact-history', icon: History, access: 'auth', module: 'contact-history' },
    ],
  },
  {
    label: 'Reclutamiento',
    access: 'auth',
    items: [
      { label: 'Candidatos', href: '/candidates', icon: Users, access: 'auth', module: 'candidates' },
      { label: 'Aplicaciones', href: '/applications', icon: FileText, access: 'auth', module: 'applications' },
      { label: 'Placements', href: '/placements', icon: CheckCircle2, access: 'auth', module: 'placements' },
      { label: 'Interacciones', href: '/candidate-contacts', icon: PhoneCall, access: 'auth', module: 'candidate-contacts' },
    ],
  },
  {
    label: 'Catálogos',
    access: 'admin',
    items: [
      { label: 'Sectores', href: '/sectors', icon: Layers, access: 'admin', module: 'sectors' },
      { label: 'Áreas', href: '/position-areas', icon: LayoutGrid, access: 'admin', module: 'position-areas' },
      { label: 'Etapas', href: '/pipeline-stages', icon: GitBranch, access: 'admin', module: 'pipeline-stages' },
      { label: 'Tipos de contacto', href: '/contact-types', icon: Tags, access: 'admin', module: 'contact-types' },
    ],
  },
  {
    label: 'Admin',
    access: 'admin',
    items: [
      { label: 'Usuarios', href: '/users', icon: User, access: 'admin', module: 'users' },
      { label: 'Roles', href: '/roles', icon: Shield, access: 'admin', module: 'roles' },
      { label: 'Permisos', href: '/permissions', icon: Key, access: 'admin', module: 'permissions' },
      { label: 'Empleados', href: '/employees', icon: IdCard, access: 'admin', module: 'employees' },
    ],
  },
]

type MeLike = Pick<Me, 'roles' | 'permissions'>

const itemVisible = (item: NavItem, me: MeLike): boolean =>
  item.module ? canRead(me, item.module) : true

/** Groups (and their items) the given user is allowed to see, by permission. */
export function visibleGroups(me: MeLike): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => itemVisible(i, me)),
  })).filter((g) => g.items.length > 0)
}

export function labelForHref(pathname: string): string {
  const first = `/${pathname.split('/').filter(Boolean)[0] ?? ''}`
  for (const group of NAV_GROUPS) {
    const match = group.items.find((i) => i.href === first)
    if (match) return match.label
  }
  return 'Inicio'
}

// Marca Briefcase como usado para enlaces futuros de detalle comercial.
export const FALLBACK_ICON = Briefcase
