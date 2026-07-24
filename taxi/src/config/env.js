/** Base del backend para imágenes (/static/uploads/...). En producción = URL de Railway. */
export const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || '';

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${STATIC_BASE_URL}${path}`;
}
