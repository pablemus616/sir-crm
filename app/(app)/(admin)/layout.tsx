import { redirect } from 'next/navigation'
import { getMe } from '@/lib/auth/me'
import { canReadAny } from '@/lib/auth/permissions'

const ADMIN_AREA = [
  'users',
  'roles',
  'permissions',
  'employees',
  'sectors',
  'position-areas',
  'pipeline-stages',
  'contact-types',
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe()
  if (!canReadAny(me, ADMIN_AREA)) redirect('/dashboard')
  return <>{children}</>
}
