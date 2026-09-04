export interface MenuLayout {
  /** Nombre de la ruta destino (se pasa a router.push({ name })). */
  to?: string;
  label: string;
  redirect?: boolean;
  name: string;
  /** Texto auxiliar a la derecha del ítem (ej. "Información personal"). */
  hint?: string;
  /** Clase de PrimeIcons del ítem. */
  icon?: string;
  /** Query params para la ruta destino (ej. abrir un tab concreto). */
  query?: Record<string, string>;
}
