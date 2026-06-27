import { getMe } from '@/lib/auth/me'

export default async function DashboardPage() {
  const me = await getMe()
  const name = me.employee ? me.employee.firstName : me.username

  return (
    <section className="space-y-2">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
        Hola, {name}
      </h1>
      <p className="text-muted-foreground">
        Bienvenido al CRM de SIR. El tablero de métricas se construye en la siguiente fase.
      </p>
    </section>
  )
}
