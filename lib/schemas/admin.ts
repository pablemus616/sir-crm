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

/* ------------------------------------------------------------------ */
/* Users                                                              */
/* ------------------------------------------------------------------ */

/**
 * Required positive-int id (mirrors recruitment.ts idField). Mensajes en español
 * para que un combo sin elegir (undefined → NaN) muestre "Selecciona un empleado"
 * en lugar del default en inglés de zod.
 */
const employeeIdField = z.coerce
  .number({ invalid_type_error: 'Selecciona un empleado' })
  .int('Selecciona un empleado')
  .positive('Selecciona un empleado');

/**
 * Alta de usuario. `password` es OBLIGATORIA al crear (asimetría con la edición).
 * El backend NO acepta email ni roleIds aquí; la asignación M:N de roles se hace
 * por sub-rutas dedicadas (un rol por llamada).
 */
export const createUserSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  employeeId: employeeIdField,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Edición de usuario. Todos los campos opcionales. `password` se preprocesa de
 * '' → undefined: dejar la contraseña en blanco al editar NO la cambia (el
 * backend solo la re-hashea si llega presente). Así el body omite la clave.
 */
export const updateUserSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio').optional(),
  password: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  employeeId: z.preprocess(emptyToUndefined, employeeIdField.optional()),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
