import { redirect } from 'next/navigation'
import { getMe } from '@/lib/auth/me'
import { isAdmin } from '@/lib/auth/roles'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe()
  if (!isAdmin(me)) redirect('/dashboard')
  return <>{children}</>
}
