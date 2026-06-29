'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/auth/login-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: LoginInput) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'same-origin',
    })
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    if (!res.ok) {
      toast.error(body?.message ?? 'No se pudo iniciar sesión')
      return
    }
    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 space-y-1 text-center">
        <Image src="/logo.png" alt="SIR" width={64} height={64} priority className="mx-auto mb-2 h-16 w-16" />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
          SIR CRM
        </h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
