import { z } from 'zod';

export const createSectorSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  active: z.boolean().optional(),
});
export type CreateSectorInput = z.infer<typeof createSectorSchema>;

export const createPositionAreaSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  active: z.boolean().optional(),
});
export type CreatePositionAreaInput = z.infer<typeof createPositionAreaSchema>;

export const createContactTypeSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
});
export type CreateContactTypeInput = z.infer<typeof createContactTypeSchema>;

export const createPipelineStageSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  sortOrder: z.coerce.number().int().min(0),
  probability: z.coerce.number().int().min(0).max(100),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
  active: z.boolean().optional(),
});
export type CreatePipelineStageInput = z.infer<typeof createPipelineStageSchema>;
