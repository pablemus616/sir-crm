import {
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

export type NavAccess = 'auth' | 'admin'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  access: NavAccess
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
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, access: 'auth' }],
  },
  {
    label: 'Comercial',
    access: 'auth',
    items: [
      { label: 'Oportunidades', href: '/opportunities', icon: Target, access: 'auth' },
      { label: 'Clientes', href: '/clients', icon: Building2, access: 'auth' },
      { label: 'Contactos', href: '/client-contacts', icon: Contact, access: 'auth' },
      { label: 'Requests', href: '/contact-requests', icon: Inbox, access: 'auth' },
      { label: 'Historial', href: '/contact-history', icon: History, access: 'auth' },
    ],
  },
  {
    label: 'Reclutamiento',
    access: 'auth',
    items: [
      { label: 'Candidatos', href: '/candidates', icon: Users, access: 'auth' },
      { label: 'Aplicaciones', href: '/applications', icon: FileText, access: 'auth' },
      { label: 'Placements', href: '/placements', icon: CheckCircle2, access: 'auth' },
      { label: 'Interacciones', href: '/candidate-contacts', icon: PhoneCall, access: 'auth' },
    ],
  },
  {
    label: 'Catálogos',
    access: 'admin',
    items: [
      { label: 'Sectores', href: '/sectors', icon: Layers, access: 'admin' },
      { label: 'Áreas', href: '/position-areas', icon: LayoutGrid, access: 'admin' },
      { label: 'Etapas', href: '/pipeline-stages', icon: GitBranch, access: 'admin' },
      { label: 'Tipos de contacto', href: '/contact-types', icon: Tags, access: 'admin' },
    ],
  },
  {
    label: 'Admin',
    access: 'admin',
    items: [
      { label: 'Usuarios', href: '/users', icon: User, access: 'admin' },
      { label: 'Roles', href: '/roles', icon: Shield, access: 'admin' },
      { label: 'Permisos', href: '/permissions', icon: Key, access: 'admin' },
      { label: 'Empleados', href: '/employees', icon: IdCard, access: 'admin' },
    ],
  },
]

const visible = (access: NavAccess, admin: boolean) => access === 'auth' || admin

export function visibleGroups(admin: boolean): NavGroup[] {
  return NAV_GROUPS.filter((g) => visible(g.access, admin))
    .map((g) => ({ ...g, items: g.items.filter((i) => visible(i.access, admin)) }))
    .filter((g) => g.items.length > 0)
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
