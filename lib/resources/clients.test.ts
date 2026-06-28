import { describe, it, expect } from 'vitest';
import { clientsResource } from './clients';

describe('clientsResource', () => {
  it('usa el endpoint clients y tiene campo sectorId en el formulario', () => {
    expect(clientsResource.config.endpoint).toBe('clients');
    expect(clientsResource.config.formFields.some((f) => f.name === 'sectorId')).toBe(true);
  });

  it('valida nombre obligatorio vía formSchema', () => {
    expect(() => clientsResource.config.formSchema.parse({ name: '' })).toThrow();
  });

  it('nombre válido pasa el esquema', () => {
    const result = clientsResource.config.formSchema.safeParse({ name: 'Acme Corp' });
    expect(result.success).toBe(true);
  });
});
