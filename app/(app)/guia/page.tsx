import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Contact,
  FileText,
  Filter,
  History,
  Inbox,
  LayoutDashboard,
  PhoneCall,
  ShieldCheck,
  Tags,
  Target,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Guía · SIR CRM' };

/**
 * Guía del CRM — página estática (Server Component) que explica cada módulo
 * desde la perspectiva del usuario y qué métrica del dashboard mueve.
 * Los acentos usan los mismos tokens de color de las gráficas (--chart-N) para
 * ligar visualmente cada módulo con el tablero que alimenta.
 */

interface ModuleDoc {
  icon: LucideIcon;
  name: string;
  color: string;
  does: string;
  moves: string[];
}

const comercial: ModuleDoc[] = [
  {
    icon: Target,
    name: 'Oportunidades',
    color: 'var(--chart-1)',
    does: 'Manejas cada negocio: le pones cliente, monto y probabilidad, y lo empujas por etapas hasta ganarlo o perderlo.',
    moves: [
      'Ventas y Quetzales ganados',
      'Conversión',
      'Forecast ponderado',
      'Propuestas enviadas',
      'Pipeline por etapa',
      'Por cliente / sector / área',
    ],
  },
  {
    icon: Building2,
    name: 'Clientes',
    color: 'var(--chart-1)',
    does: 'Das de alta las empresas cliente y les asignas su sector.',
    moves: ['Oportunidades por cliente', 'Oportunidades por sector'],
  },
  {
    icon: Contact,
    name: 'Contactos',
    color: 'var(--chart-1)',
    does: 'Registras a las personas dentro de cada empresa con quienes hablas.',
    moves: ['Conecta el historial con cada cuenta'],
  },
  {
    icon: Inbox,
    name: 'Solicitudes',
    color: 'var(--chart-1)',
    does: 'Es tu bandeja de leads entrantes: los atiendes y marcas de qué cliente resultaron.',
    moves: ['Nuevos clientes al convertirlas'],
  },
  {
    icon: History,
    name: 'Historial',
    color: 'var(--chart-1)',
    does: 'Anotas cada llamada o correo con contactos de clientes: tipo, dirección y duración.',
    moves: ['Bitácora comercial'],
  },
];

const reclutamiento: ModuleDoc[] = [
  {
    icon: Users,
    name: 'Candidatos',
    color: 'var(--chart-2)',
    does: 'Mantienes la base de personas buscando empleo y su estado.',
    moves: ['Embudo de reclutamiento (al postularlos)'],
  },
  {
    icon: FileText,
    name: 'Aplicaciones',
    color: 'var(--chart-2)',
    does: 'Postulas un candidato a una oportunidad y lo vas avanzando por el embudo.',
    moves: ['Embudo de reclutamiento'],
  },
  {
    icon: CheckCircle2,
    name: 'Colocaciones',
    color: 'var(--chart-2)',
    does: 'Registras la contratación exitosa: quién se colocó, con qué reclutador, honorarios y fecha.',
    moves: ['Colocaciones por reclutador', 'Honorarios por reclutador', 'Tiempo de cierre'],
  },
  {
    icon: PhoneCall,
    name: 'Interacciones',
    color: 'var(--chart-2)',
    does: 'Registras contactos y llamadas con candidatos: tipo, dirección y duración.',
    moves: ['Interacciones por empleado'],
  },
];

/** El recorrido real de un negocio: cada paso es un clic que alimenta el dashboard. */
const journey = [
  { label: 'Cliente', color: 'var(--chart-1)' },
  { label: 'Oportunidad', color: 'var(--chart-1)' },
  { label: 'Propuesta', color: 'var(--chart-3)' },
  { label: 'Ganada', color: 'var(--chart-4)' },
  { label: 'Colocación', color: 'var(--chart-2)' },
  { label: 'Dashboard', color: 'var(--primary)' },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function ModuleCard({ mod }: { mod: ModuleDoc }) {
  const Icon = mod.icon;
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `color-mix(in srgb, ${mod.color} 14%, transparent)`,
              color: mod.color,
            }}
          >
            <Icon className="size-5" />
          </span>
          <h3 className="font-heading text-base font-medium text-foreground">{mod.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{mod.does}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {mod.moves.map((m) => (
            <Chip key={m}>{m}</Chip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  accent,
  lead,
  modules,
}: {
  title: string;
  accent: string;
  lead: string;
  modules: ModuleDoc[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">{lead}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard key={mod.name} mod={mod} />
        ))}
      </div>
    </div>
  );
}

export default function GuiaPage() {
  return (
    <section className="max-w-5xl space-y-8">
      <header className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Guía del CRM
        </h1>
        <p className="text-sm text-muted-foreground">
          Qué hace cada módulo y cómo lo que registras se convierte en las métricas del dashboard.
        </p>
      </header>

      {/* Recorrido — el elemento firma: la cadena real de acción → métrica */}
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-0.5">
            <h2 className="font-heading text-base font-medium text-foreground">
              El recorrido de un negocio
            </h2>
            <p className="text-sm text-muted-foreground">
              SIR mueve dos flujos en paralelo. Cada paso es un clic que hace subir una tarjeta o
              una barra del tablero.
            </p>
          </div>
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {journey.map((step, i) => (
              <li key={step.label} className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: step.color }} />
                  {step.label}
                </span>
                {i < journey.length - 1 && (
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/60" />
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Section
        title="Comercial"
        accent="var(--chart-1)"
        lead="El lado de ventas: conseguir cuentas y cerrar negocios. Es la fuente de casi todas las métricas comerciales."
        modules={comercial}
      />

      <Section
        title="Reclutamiento"
        accent="var(--chart-2)"
        lead="El lado de talento: conseguir candidatos y colocarlos en los negocios que abre Comercial."
        modules={reclutamiento}
      />

      {/* Catálogos y Administración — impacto indirecto, se explican juntos */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--chart-3) 14%, transparent)',
                  color: 'var(--chart-3)',
                }}
              >
                <Tags className="size-5" />
              </span>
              <h3 className="font-heading text-base font-medium text-foreground">
                Catálogos <span className="text-xs font-normal text-muted-foreground">· solo admin</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Defines los valores de referencia: sectores, áreas, etapas del pipeline y tipos de
              contacto. No son métricas, pero son los ejes con los que se agrupan las gráficas.
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              <Chip>Etiquetas del pipeline</Chip>
              <Chip>Sectores y áreas</Chip>
              <Chip>Tipos de contacto</Chip>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--chart-5) 14%, transparent)',
                  color: 'var(--chart-5)',
                }}
              >
                <ShieldCheck className="size-5" />
              </span>
              <h3 className="font-heading text-base font-medium text-foreground">
                Administración <span className="text-xs font-normal text-muted-foreground">· solo admin</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestionas usuarios, roles, permisos y empleados. Importa para las métricas porque los
              empleados son a quienes se atribuye la actividad.
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              <Chip>Oportunidades por responsable</Chip>
              <Chip>Colocaciones por reclutador</Chip>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* El dashboard: lee todo lo anterior */}
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
            }}
          >
            <LayoutDashboard className="size-5" />
          </span>
          <div className="space-y-0.5">
            <h3 className="font-heading text-base font-medium text-foreground">
              El Dashboard no captura nada
            </h3>
            <p className="text-sm text-muted-foreground">
              Solo lee y resume todo lo anterior. Si un tablero sale vacío o bajo, casi siempre es
              porque la acción que lo alimenta no se está registrando.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dos reglas que cambian lo que cada quién ve */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex gap-3 rounded-xl bg-secondary/50 p-4">
          <UserRound className="size-5 shrink-0 text-primary" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Cada quién ve lo suyo</p>
            <p className="text-sm text-muted-foreground">
              Un admin ve todo. El resto ve solo sus propios números, así que dos personas ven el
              mismo dashboard con cifras distintas.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl bg-secondary/50 p-4">
          <Filter className="size-5 shrink-0 text-primary" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Todo se puede filtrar</p>
            <p className="text-sm text-muted-foreground">
              Cada tablero filtra por rango de fechas (días completos, hora de Guatemala) y por
              segmento (cliente, sector, área, etapa, responsable). Cambiar un filtro reconsulta todo.
            </p>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
        <Trophy className="size-4 text-primary" />
        En corto: Comercial genera negocios, Reclutamiento los llena con candidatos y el Dashboard
        mide ambos flujos.
      </p>
    </section>
  );
}
