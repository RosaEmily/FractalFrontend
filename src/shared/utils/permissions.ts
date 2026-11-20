/**
 * Permisos del panel, del lado del cliente.
 *
 * ⚠️ Es solo UX: decide qué se muestra (menú, botones) y a qué pantalla se
 * deja entrar. La autorización de verdad la hace la API en cada petición, así
 * que un valor manipulado aquí no abre nada — como mucho enseña un botón que
 * responderá 403.
 *
 * El backend manda `["*"]` para un ADMIN (la lista completa no cabe en el
 * almacenamiento del navegador) y los nombres exactos para el resto.
 */

/** Comodín de ADMIN: tiene todos los permisos, incluidos los que se agreguen. */
export const ALL_PERMISSIONS = "*";

/** Acepta lo que llegue del perfil y devuelve solo nombres de permiso válidos. */
export const permissionNames = (raw: unknown): string[] =>
  Array.isArray(raw)
    ? raw.filter((name): name is string => typeof name === "string" && name.length > 0)
    : [];

/**
 * ¿Alcanza lo concedido para lo pedido?
 *
 * `required` puede ser uno o varios (basta cualquiera). Sin `required` no se
 * pide nada. Una lista vacía de lo pedido no abre la puerta: ese caso es un
 * error de quien declara la ruta, y se cierra.
 */
export const hasPermission = (
  granted: readonly string[],
  required?: string | readonly string[] | null,
): boolean => {
  if (required === undefined || required === null) return true;

  const needed = typeof required === "string" ? [required] : required;
  if (!needed.length) return false;
  if (granted.includes(ALL_PERMISSIONS)) return true;

  return needed.some((name) => granted.includes(name));
};

/** ¿Tiene alguno? Un usuario del panel sin ningún permiso no tiene nada que ver. */
export const hasAnyPermission = (granted: readonly string[]): boolean =>
  granted.length > 0;
