import type { ResourceDescriptor } from './types';
import { clientsResource } from './clients';
import { clientContactsResource } from './client-contacts';
import { candidatesResource } from './candidates';
import { sectorsResource } from './sectors';
import { positionAreasResource } from './position-areas';
import { pipelineStagesResource } from './pipeline-stages';
import { contactTypesResource } from './contact-types';
import { rolesResource } from './roles';
import { permissionsResource } from './permissions';
import { employeesResource } from './employees';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyResource = ResourceDescriptor<any, any>;

/**
 * Registro de descriptores. Un Server Component NO puede pasar un descriptor
 * (contiene funciones: client/hooks) como prop a un Client Component sin romper
 * la serialización RSC. Las páginas pasan solo la KEY (string serializable) y el
 * wrapper cliente (ResourcePage) resuelve el descriptor desde aquí.
 */
export const resources = {
  clients: clientsResource,
  'client-contacts': clientContactsResource,
  candidates: candidatesResource,
  sectors: sectorsResource,
  'position-areas': positionAreasResource,
  'pipeline-stages': pipelineStagesResource,
  'contact-types': contactTypesResource,
  roles: rolesResource,
  permissions: permissionsResource,
  employees: employeesResource,
} satisfies Record<string, AnyResource>;

export type ResourceKey = keyof typeof resources;
