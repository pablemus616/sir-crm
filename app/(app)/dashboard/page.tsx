import { Suspense } from 'react';
import { getMe } from '@/lib/auth/me';
import { DashboardContent } from './dashboard-content';

export const metadata = { title: 'Dashboard — SIR CRM' };

/**
 * DashboardPage — Server Component raíz del dashboard.
 *
 * `await props.searchParams` fuerza rendering dinámico ligado al request,
 * evitando el error "Missing Suspense boundary with useSearchParams" en
 * Next 16 cuando los componentes cliente descendientes usan useSearchParams.
 * El contenido cliente se envuelve además en <Suspense> explícito como
 * segunda capa de protección para el prerender.
 */
export default async function DashboardPage(props: PageProps<'/dashboard'>) {
  await props.searchParams;
  const me = await getMe();
  const name = me.employee ? me.employee.firstName : me.username;

  return (
    <section className="space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Hola, {name}. Aquí tienes el resumen de actividad.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Cargando métricas…</p>
        }
      >
        <DashboardContent />
      </Suspense>
    </section>
  );
}
