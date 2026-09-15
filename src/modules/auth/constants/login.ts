/**
 * Las dos puertas de entrada al sistema.
 *
 * Panel y aula comparten el mismo formulario, la misma validación y el mismo
 * manejo de sesión: lo único que cambia es el contenido y a dónde va cada uno.
 * Por eso son datos y no dos componentes — duplicar el formulario obligaría a
 * arreglar cada bug dos veces.
 *
 * `roles` es la lista de roles que pueden entrar por esa puerta. No sustituye
 * a la autorización de la API: evita que alguien termine en una zona donde
 * todas las peticiones le responderían 403.
 */

export type LoginVariantKey = "admin" | "classroom";

export interface LoginStat {
  value: string;
  label: string;
}

export interface LoginVariant {
  /** Zona que se envía al backend: decide qué cookie emite y qué roles admite. */
  zone: LoginVariantKey;
  /** Eyebrow del panel de marca. */
  eyebrow: string;
  /** Titular del panel de marca. */
  headline: string;
  /** Bajada del panel de marca. */
  intro: string;
  /** Capacidades listadas con icono. El aula usa `stats` en su lugar. */
  features?: string[];
  /** Cifras de la academia, alternativa a `features`. */
  stats?: LoginStat[];
  /** Título sobre el formulario. */
  formTitle: string;
  /** Bajada del formulario. */
  formIntro: string;
  /** Ruta a la que se navega tras autenticarse. */
  redirectTo: string;
  /** Roles admitidos por esta puerta. */
  roles: string[];
  /** Mensaje cuando el rol no corresponde a esta puerta. */
  wrongDoorMessage: string;
  /** Enlace que se ofrece junto a ese mensaje. */
  wrongDoorLink: { label: string; to: string };
}

export const LOGIN_VARIANTS: Record<LoginVariantKey, LoginVariant> = {
  admin: {
    zone: "admin",
    eyebrow: "PANEL ADMINISTRATIVO · ACCESO RESTRINGIDO",
    headline: "Gestiona Fractal Studio con la información correcta.",
    intro:
      "Catálogo, cohortes, matrículas, notas y certificados en un solo lugar. Acceso limitado al personal autorizado por el Centro Autodesk ATC.",
    /*
     * Solo se listan funciones que el sistema tiene implementadas:
     * roles/permisos, la bitácora de `support/logs` y el límite de sesiones.
     */
    features: [
      "Roles y permisos granulares por módulo",
      "Bitácora de auditoría de cada cambio",
      "Sesiones simultáneas controladas por cuenta",
    ],
    formTitle: "Bienvenido de vuelta.",
    formIntro: "Ingresa con la cuenta que te asignó administración.",
    redirectTo: "admin-home",
    roles: ["ADMIN", "COORDINATOR", "MANAGER"],
    wrongDoorMessage:
      "Esta cuenta no tiene acceso al panel administrativo. Ingresa por el aula virtual.",
    wrongDoorLink: { label: "Ir al aula virtual", to: "classroom-login" },
  },

  classroom: {
    zone: "classroom",
    eyebrow: "AULA VIRTUAL",
    headline: "Tu formación BIM, en un solo lugar.",
    intro:
      "Clases en vivo con horario fijo, líneas de carrera que avanzan curso a curso, notas ponderadas y certificación Autodesk.",
    stats: [
      { value: "250+", label: "Certificados" },
      { value: "15", label: "Años" },
      { value: "6", label: "Países" },
    ],
    formTitle: "Bienvenido de vuelta.",
    formIntro: "Usa el correo con el que te matriculaste.",
    redirectTo: "classroom-home",
    roles: ["STUDENT", "TEACHER"],
    wrongDoorMessage:
      "Esta cuenta es del personal de Fractal Studio. Ingresa por el panel administrativo.",
    wrongDoorLink: { label: "Ir al panel administrativo", to: "login" },
  },
};

/**
 * El acceso al aula no se registra: lo crea la matrícula. Se muestra al pie
 * del formulario para que nadie busque un enlace de "crear cuenta".
 */
export const CLASSROOM_ACCESS_NOTE =
  "El acceso al aula se crea con tu matrícula y llega a tu correo al confirmarse el pago.";

export const LOGIN_SUPPORT_EMAIL = "soporte@proyectofractal.com";
