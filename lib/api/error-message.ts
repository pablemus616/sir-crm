/**
 * Traduce mensajes de error del backend (en inglés) a copy en español para los
 * toasts. El backend responde 409/400 con mensajes como 'Username already exists';
 * clientFetch los reenvía como Error(message). Aquí los mapeamos a frases en
 * español conocidas y, si no reconocemos el mensaje, devolvemos el original
 * (que suele ser legible) o el `fallback` cuando ni siquiera es un Error.
 */
export function toSpanishError(e: unknown, fallback = 'Ocurrió un error.'): string {
  if (!(e instanceof Error)) return fallback;

  const msg = e.message;

  if (msg.includes('Username already exists')) {
    return 'El nombre de usuario ya existe.';
  }
  if (msg.includes('Permission already exists')) {
    return 'Ya existe un permiso con ese nombre.';
  }
  if (msg.includes('Role already exists')) {
    return 'Ya existe un rol con ese nombre.';
  }
  if (msg.includes('already exists') && msg.includes('Application')) {
    return 'Ya existe una aplicación para ese candidato y esa oportunidad.';
  }
  if (msg.includes('already exists')) {
    return 'Ya existe un registro con esos datos.';
  }

  return msg;
}
