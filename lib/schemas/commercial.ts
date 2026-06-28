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

export const createOpportunitySchema = z.object({
  clientId: idField,
  responsibleEmployeeId: idField,
  pipelineStageId: idField,
  areaId: optionalId,
  clientContactId: optionalId,
  originContactRequestId: optionalId,
  title: z.string().trim().min(1).optional(),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  headcount: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional()),
  amount: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  currency: z.string().trim().optional(),
  source: z.string().trim().optional(),
  expectedCloseDate: z.string().date().optional(),
});
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

export const changeStageSchema = z.object({
  pipelineStageId: idField,
  probability: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(100).optional(),
  ),
  lostReason: z.string().trim().optional(),
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
  lostReason: z.string().trim().optional(),
});
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;

export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  sector: z.string().trim().optional(),
  sectorId: optionalId,
  employeeSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createClientContactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  phoneNumber: z.string().trim().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
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
  contactDesc: z.string().trim().optional(),
  phoneNumberDialed: z.string().trim().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  opportunityId: optionalId,
});
export type CreateContactHistoryInput = z.infer<typeof createContactHistorySchema>;
