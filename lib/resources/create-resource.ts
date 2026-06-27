import type { TypeOf, ZodType } from "zod";
import { createResourceClient } from "@/lib/api/resource-client";
import { createResourceHooks } from "@/lib/api/hooks";
import type { ResourceConfig, ResourceDescriptor } from "./types";

export function createResource<T, S extends ZodType>(
  config: ResourceConfig<T, S>,
): ResourceDescriptor<T, S> {
  const client = createResourceClient<T, TypeOf<S>, Partial<TypeOf<S>>>(config.endpoint);
  const hooks = createResourceHooks<T, TypeOf<S>, Partial<TypeOf<S>>>(config.key, client);
  return { config, client, hooks };
}
