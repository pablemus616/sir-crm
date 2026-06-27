import { NextResponse } from 'next/server'
import { serverRequest, type ServerFetchOptions } from '@/lib/api/server-fetch'

// Methods that may carry a JSON body to the backend
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH'])

/**
 * Generic BFF proxy — forwards browser requests to {SIR_API_URL}/<...path>
 * with Bearer auth + automatic refresh/rotate on 401 (one retry).
 *
 * The backend's {ok, message, data} envelope and HTTP status code are relayed
 * AS-IS to the client; no unwrapping happens here. clientFetch (Task 2.4) is
 * responsible for interpreting the envelope.
 *
 * Next 16: ctx.params is a Promise — must be awaited.
 */
async function handle(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params
  const segments = path.join('/')
  const search = new URL(request.url).search
  const target = `/${segments}${search}`

  const init: ServerFetchOptions = { method: request.method }

  if (METHODS_WITH_BODY.has(request.method)) {
    init.body = await request.json().catch(() => undefined)
  }

  const { status, envelope } = await serverRequest(target, init)

  if (!envelope) {
    return NextResponse.json(
      { ok: false, message: 'Respuesta inválida del servidor' },
      { status },
    )
  }

  return NextResponse.json(envelope, { status })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
