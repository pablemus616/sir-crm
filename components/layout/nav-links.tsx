'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { visibleGroups } from '@/lib/auth/nav'

export function NavLinks({
  admin,
  onNavigate,
}: {
  admin: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const groups = visibleGroups(admin)

  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
                    : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary'
                }
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
