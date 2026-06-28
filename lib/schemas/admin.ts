import { z } from 'zod';
import { emptyToUndefined } from '@/lib/schemas/commercial';

/**
 * Optional date (YYYY-MM-DD): a native <input type="date"> left blank submits
 * '' which a bare `.date().optional()` would REJECT. Preprocess '' / null /
 * undefined → undefined first (same lesson as recruitment.ts).
 */
const optionalDate = z.preprocess(emptyToUndefined, z.string().date().optional());

/**
 * Optional free-text field. GET /employees/:id returns `null` for unset
 * `nullable` columns and the create form submits '' for blanks; a bare
 * `.optional()` rejects both. Preprocess '' / null / undefined → undefined so
 * create omits the key and edit round-trips a null row.
 */
const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  secondName: optionalText,
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  surName: optionalText,
  nationalId: optionalText,
  phoneNumber: optionalText,
  email: z.preprocess(emptyToUndefined, z.string().email('Correo inválido').optional()),
  birthDate: optionalDate,
  hireDate: optionalDate,
  salary: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const createPermissionSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
});
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;

/**
 * Roles. El backend solo acepta `name` al crear/editar; la asignación M:N de
 * permisos se hace por sub-rutas dedicadas (un permiso por llamada), no aquí.
 */
export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial();
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
