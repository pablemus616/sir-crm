'use client'

import Image from 'next/image'
import { NavLinks } from './nav-links'

export function Sidebar({ admin }: { admin: boolean }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Image src="/logo.png" alt="SIR" width={28} height={28} priority className="h-7 w-7" />
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
          SIR CRM
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks admin={admin} />
      </div>
    </aside>
  )
}
