'use client'

import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { labelForHref } from '@/lib/auth/nav'
import type { Me } from '@/lib/auth/types'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

export function Topbar({ me, admin }: { me: Me; admin: boolean }) {
  const pathname = usePathname()
  const current = labelForHref(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <MobileNav admin={admin} />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <a
              href="/dashboard"
              className="transition-colors hover:text-foreground text-muted-foreground text-sm"
            >
              SIR CRM
            </a>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {/* Slot del command palette (⌘K) — se cablea en Fase 8 */}
        <div className="hidden items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground lg:flex">
          <Search className="size-4" />
          <span>Buscar…</span>
          <kbd className="ml-2 rounded bg-muted px-1.5 text-xs">⌘K</kbd>
        </div>
        <UserMenu me={me} />
      </div>
    </header>
  )
}
