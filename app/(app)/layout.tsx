import { getMe } from '@/lib/auth/me'
import { isAdmin } from '@/lib/auth/roles'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe()
  const admin = isAdmin(me)

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <Sidebar admin={admin} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar me={me} admin={admin} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
