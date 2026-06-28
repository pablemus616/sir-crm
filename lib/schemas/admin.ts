import { z } from 'zod';
import { emptyToUndefined } from '@/lib/schemas/commercial';

/**
 * Optional date (YYYY-MM-DD): a native <input type="date"> left blank submits
 * '' which a bare `.date().optional()` would REJECT. Preprocess '' / null /
 * undefined → undefined first (same lesson as recruitment.ts).
 */
const optionalDate = z.preprocess(emptyToUndefined, z.string().date().optional());

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  secondName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  surName: z.string().trim().optional(),
  nationalId: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
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
