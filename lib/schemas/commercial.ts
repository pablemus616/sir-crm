import { z } from 'zod';

const idField = z.coerce.number().int().positive();

export const emptyToUndefined = (v: unknown) =>
  v === '' || v === null || v === undefined ? undefined : v;

/** Optional ID field: empty string / null / undefined → undefined; otherwise coerced to positive int. */
export const optionalId = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().positive().optional(),
);

/** Optional numeric field: empty string / null / undefined → undefined; otherwise coerced to number. */
export const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional());

/**
 * Optional free-text field. GET rows return `null` for unset nullable columns
 * and create forms submit '' for blanks; a bare `.optional()` rejects both
 * ("Expected string, received null"). Preprocess '' / null / undefined →
 * undefined so create omits the key and edit round-trips a null row.
 */
export const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());

/**
 * Optional email field. Same null/'' tolerance as optionalText, but a provided
 * value must be a valid email. Collapsing '' → undefined also keeps the POST
 * body clean (backend `@IsOptional() @IsEmail()` rejects an empty string).
 */
export const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email('Correo inválido').optional(),
);

export const createOpportunitySchema = z.object({
  clientId: idField,
  responsibleEmployeeId: idField,
  pipelineStageId: idField,
  areaId: optionalId,
  clientContactId: optionalId,
  originContactRequestId: optionalId,
  title: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  headcount: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional()),
  amount: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  currency: optionalText,
  source: optionalText,
  expectedCloseDate: z.string().date().optional(),
});
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

export const changeStageSchema = z.object({
  pipelineStageId: idField,
  probability: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(100).optional(),
  ),
  lostReason: optionalText,
});
export type ChangeStageInput = z.infer<typeof changeStageSchema>;

export const sendProposalSchema = z.object({
  amount: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
});
export type SendProposalInput = z.infer<typeof sendProposalSchema>;

export const followUpSchema = z.object({
  nextFollowUpAt: z.string().datetime(),
});
export type FollowUpInput = z.infer<typeof followUpSchema>;

export const loseOpportunitySchema = z.object({
  lostReason: optionalText,
});
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;

export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  sector: optionalText,
  sectorId: optionalId,
  employeeSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createClientContactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  phoneNumber: optionalText,
  email: optionalEmail,
  clientId: idField,
});
export type CreateClientContactInput = z.infer<typeof createClientContactSchema>;

export const handleContactRequestSchema = z.object({
  resultingClientId: optionalId,
});
export type HandleContactRequestInput = z.infer<typeof handleContactRequestSchema>;

export const createContactHistorySchema = z.object({
  contactId: idField,
  contactType: idField,
  contactTime: z.string().datetime(),
  callLength: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
  contactDesc: optionalText,
  phoneNumberDialed: optionalText,
  direction: z.enum(['inbound', 'outbound']).optional(),
  opportunityId: optionalId,
});
export type CreateContactHistoryInput = z.infer<typeof createContactHistorySchema>;
