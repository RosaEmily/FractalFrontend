/**
 * Códigos de error de la API (`App\Shared\Enums\ErrorCode` en fractal-api).
 * Solo se declaran los que el front necesita distinguir por código; para el
 * resto basta con el mensaje que devuelve la API.
 */
export const ErrorCode = {
  /** Token faltante, inválido o expirado → hay que reiniciar sesión. */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** Sesión válida, pero sin el rol necesario. NO debe cerrar la sesión. */
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  /** Cupo de sesiones simultáneas agotado. También viaja como 403. */
  MAX_SESSIONS_EXCEEDED: "MAX_SESSIONS_EXCEEDED",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
