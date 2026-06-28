'use client';

import { ResourceView } from './resource-view';
import { resources, type ResourceKey, type AnyResource } from '@/lib/resources/registry';

/**
 * Client wrapper para páginas de recurso. Recibe solo una key (string
 * serializable) desde el Server Component de la página y resuelve el descriptor
 * en el cliente, evitando pasar funciones a través del límite RSC.
 */
export function ResourcePage({ resourceKey }: { resourceKey: ResourceKey }) {
  const resource: AnyResource = resources[resourceKey];
  return <ResourceView resource={resource} />;
}
