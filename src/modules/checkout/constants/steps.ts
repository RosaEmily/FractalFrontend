/**
 * Pasos del checkout.
 *
 * `card` no es un paso propio: es la pantalla de cobro del método elegido, y
 * comparte indicador con `method` (ver CheckoutStepBar). `success` y `rejected`
 * quedan fuera de la barra porque el flujo ya terminó.
 */
export const CHECKOUT_STEPS = [
  { key: "cart", label: "Carrito" },
  { key: "auth", label: "Cuenta" },
  { key: "buyer", label: "Datos" },
  { key: "method", label: "Pago" },
] as const;

export type CheckoutStep =
  | "cart"
  | "auth"
  | "buyer"
  | "method"
  | "card"
  | "success"
  | "rejected";
