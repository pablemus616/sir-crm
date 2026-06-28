import { z } from 'zod';
import { optionalId, emptyToUndefined } from '@/lib/schemas/commercial';
import {
  CANDIDATE_STATUSES,
  APPLICATION_STAGES,
  PLACEMENT_STATUSES,
} from '@/lib/api/types/recruitment';

/** Required positive-int id field (mirrors commercial.ts idField). */
const idField = z.coerce.number().int().positive();

/**
 * Optional enum: native <select> empty option submits '' which a bare
 * `.optional()` would REJECT. Preprocess '' / null / undefined → undefined
 * first, then validate the enum optionally.
 */
function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(emptyToUndefined, z.enum(values).optional());
}

/* ------------------------------------------------------------------ */
/* Candidates                                                          */
/* ------------------------------------------------------------------ */

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  secondName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  surName: z.string().trim().optional(),
  nationalId: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  birthDate: z.string().date().optional(),
  headline: z.string().trim().optional(),
  source: z.string().trim().optional(),
  expectedSalary: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  status: optionalEnum(CANDIDATE_STATUSES),
  notes: z.string().trim().optional(),
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
  source: z.string().trim().optional(),
  notes: z.string().trim().optional(),
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
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  endReason: z.string().trim().optional(),
  agreedSalary: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  fee: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  status: optionalEnum(PLACEMENT_STATUSES),
});
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;

export const updatePlacementSchema = createPlacementSchema
  .omit({ applicationId: true })
  .partial();
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
