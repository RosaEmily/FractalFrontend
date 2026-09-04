/**
 * Pantallas de estado a pantalla completa (400–504).
 *
 * Los textos son los del diseño palabra por palabra: explican **qué pasó y qué
 * hacer**, sin jerga de HTTP. El `tone` decide el color del badge y del código:
 * `neutral` para lo que es culpa de la ruta, `accent` para lo que el usuario
 * puede resolver, `danger` para los fallos de servidor.
 */
export type ErrorTone = "neutral" | "accent" | "danger";

export type ErrorIcon = "warning" | "lock" | "search" | "method" | "clock" | "conflict" | "trash" | "server";

export interface ErrorState {
  code: string;
  tone: ErrorTone;
  icon: ErrorIcon;
  title: string;
  sub: string;
  cta: string;
  secondary?: string;
  /** Segundos tras los que se reintenta solo. Solo el 429 lo usa. */
  autoRedirect?: number;
}

export const ERROR_CODES: Record<number, ErrorState> = {
  400: {
    code: "400", tone: "neutral", icon: "warning",
    title: "Solicitud incorrecta",
    sub: "Los datos enviados no tienen el formato esperado. Revisa el formulario e inténtalo de nuevo.",
    cta: "Volver",
  },
  401: {
    code: "401", tone: "accent", icon: "lock",
    title: "Tu sesión expiró",
    sub: "Por seguridad cerramos tu sesión después de un tiempo de inactividad. Vuelve a iniciar sesión para continuar.",
    cta: "Iniciar sesión",
  },
  403: {
    code: "403", tone: "accent", icon: "lock",
    title: "No tienes acceso a esta página",
    sub: "Tu cuenta no tiene el permiso necesario para ver este contenido. Si crees que es un error, escribe a soporte.",
    cta: "Ir al inicio",
    secondary: "Escribir a soporte",
  },
  404: {
    code: "404", tone: "neutral", icon: "search",
    title: "Página no encontrada",
    sub: "La ruta que buscas no existe o cambió de lugar. Revisa la dirección o vuelve al inicio.",
    cta: "Ir al inicio",
  },
  405: {
    code: "405", tone: "neutral", icon: "method",
    title: "Método no permitido",
    sub: "Esta acción no está disponible desde aquí. Si llegaste con un enlace guardado, puede estar desactualizado.",
    cta: "Ir al inicio",
  },
  408: {
    code: "408", tone: "accent", icon: "clock",
    title: "La solicitud tardó demasiado",
    sub: "Tu conexión o el servidor no respondieron a tiempo. Revisa tu internet e inténtalo de nuevo.",
    cta: "Reintentar",
  },
  409: {
    code: "409", tone: "accent", icon: "conflict",
    title: "Hay un conflicto con este registro",
    sub: "Alguien más modificó esta información mientras la editabas. Recarga para ver la versión más reciente.",
    cta: "Recargar",
  },
  410: {
    code: "410", tone: "neutral", icon: "trash",
    title: "Este contenido ya no existe",
    sub: "Se eliminó de forma permanente y no va a volver a estar disponible en esta dirección.",
    cta: "Ir al inicio",
  },
  422: {
    code: "422", tone: "accent", icon: "warning",
    title: "No pudimos procesar tus datos",
    sub: "Algunos campos no pasan las validaciones del servidor. Revisa los mensajes marcados en el formulario.",
    cta: "Volver al formulario",
  },
  429: {
    code: "429", tone: "accent", icon: "clock",
    title: "Demasiadas solicitudes",
    sub: "Hiciste varios intentos en poco tiempo. Espera un momento antes de volver a intentarlo.",
    cta: "Reintentar",
    autoRedirect: 20,
  },
  500: {
    code: "500", tone: "danger", icon: "server",
    title: "Algo salió mal de nuestro lado",
    sub: "Tuvimos un error inesperado en el servidor. Ya quedó registrado; intenta de nuevo en unos minutos.",
    cta: "Reintentar", secondary: "Ir al inicio",
  },
  502: {
    code: "502", tone: "danger", icon: "server",
    title: "Respuesta inválida del servidor",
    sub: "Uno de nuestros servicios no respondió correctamente. Es momentáneo; prueba de nuevo en un rato.",
    cta: "Reintentar", secondary: "Ir al inicio",
  },
  503: {
    code: "503", tone: "danger", icon: "server",
    title: "Servicio no disponible",
    sub: "Estamos en mantenimiento o con alta demanda en este momento. Vuelve a intentarlo en unos minutos.",
    cta: "Reintentar", secondary: "Ir al inicio",
  },
  504: {
    code: "504", tone: "danger", icon: "server",
    title: "El servidor no respondió a tiempo",
    sub: "La solicitud tardó más de lo esperado. Puede ser tu conexión o carga en nuestros servidores.",
    cta: "Reintentar", secondary: "Ir al inicio",
  },
};

/** Los de servidor muestran un ID de referencia para pasarlo a soporte. */
export const SERVER_CODES = [500, 502, 503, 504];

export const SUPPORT_WHATSAPP = "https://wa.me/51987654321";
