import { z } from 'zod';
import {
  optionalId,
  emptyToUndefined,
  optionalText,
  optionalEmail,
} from '@/lib/schemas/commercial';
import {
  CANDIDATE_STATUSES,
  APPLICATION_STAGES,
  PLACEMENT_STATUSES,
} from '@/lib/api/types/recruitment';

/**
 * Required positive-int id field (mirrors commercial.ts idField). Spanish
 * messages so an unselected combo (undefined -> NaN) shows "Selecciona una
 * opción" instead of zod's default English "Expected number, received nan".
 */
const idField = z.coerce
  .number({ invalid_type_error: 'Selecciona una opción' })
  .int('Selecciona una opción')
  .positive('Selecciona una opción');

/**
 * Optional enum: native <select> empty option submits '' which a bare
 * `.optional()` would REJECT. Preprocess '' / null / undefined → undefined
 * first, then validate the enum optionally.
 */
function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(emptyToUndefined, z.enum(values).optional());
}

/**
 * Optional date (YYYY-MM-DD): a native <input type="date"> left blank submits
 * '' which a bare `.date().optional()` would REJECT (same shape as the optional
 * enum lesson). Preprocess '' / null / undefined → undefined first.
 */
const optionalDate = z.preprocess(emptyToUndefined, z.string().date().optional());

/* ------------------------------------------------------------------ */
/* Candidates                                                          */
/* ------------------------------------------------------------------ */

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  secondName: optionalText,
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  surName: optionalText,
  nationalId: optionalText,
  phoneNumber: optionalText,
  email: optionalEmail,
  birthDate: optionalDate,
  headline: optionalText,
  source: optionalText,
  expectedSalary: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  status: optionalEnum(CANDIDATE_STATUSES),
  notes: optionalText,
});
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export const updateCandidateSchema = createCandidateSchema.partial();
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export const createApplicationSchema = z.object({
  candidateId: idField,
  opportunityId: idField,
  referredByEmployeeId: optionalId,
  stage: optionalEnum(APPLICATION_STAGES),
  source: optionalText,
  notes: optionalText,
});
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const changeApplicationStageSchema = z.object({
  stage: z.enum(APPLICATION_STAGES),
});
export type ChangeApplicationStageInput = z.infer<typeof changeApplicationStageSchema>;

/* ------------------------------------------------------------------ */
/* Placements                                                          */
/* ------------------------------------------------------------------ */

export const createPlacementSchema = z.object({
  applicationId: idField,
  placementDate: z.string().date(),
  startDate: optionalDate,
  endDate: optionalDate,
  endReason: optionalText,
  agreedSalary: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  fee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  status: optionalEnum(PLACEMENT_STATUSES),
});
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;

export const updatePlacementSchema = createPlacementSchema
  .omit({ applicationId: true })
  .partial();
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
