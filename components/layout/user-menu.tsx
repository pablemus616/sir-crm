'use client'

import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/lib/api/hooks/use-logout'
import type { Me } from '@/lib/auth/types'

function initials(me: Me): string {
  if (me.employee) {
    return `${me.employee.firstName[0] ?? ''}${me.employee.lastName[0] ?? ''}`.toUpperCase()
  }
  return me.username.slice(0, 2).toUpperCase()
}

export function UserMenu({ me }: { me: Me }) {
  const logout = useLogout()
  const displayName = me.employee
    ? `${me.employee.firstName} ${me.employee.lastName}`
    : me.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-2 px-2" />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            {initials(me)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {me.roles.map((r) => r.name).join(', ')}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
