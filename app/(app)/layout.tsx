import { getMe } from '@/lib/auth/me'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe()

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <Sidebar me={me} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar me={me} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
