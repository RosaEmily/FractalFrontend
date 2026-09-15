import type { RouteRecordRaw } from "vue-router";

/*
 * Checkout: quinto módulo raíz, junto a landing, auth, admin y classroom.
 *
 * El carrito es público —se puede armar sin cuenta—, pero desde el paso de
 * datos hacia adelante hace falta sesión de AULA: la matrícula se crea contra
 * la ficha de estudiante del token. Por eso `meta.roles` es STUDENT y no ADMIN:
 * un administrador no tiene ficha y no puede comprarse un programa.
 */
export const routesCheckout: RouteRecordRaw[] = [
  {
    path: "/checkout",
    children: [
      {
        path: "",
        name: "checkout-cart",
        component: () => import("../pages/cart.vue"),
        meta: { page: { base: { title: "Carrito" } } },
      },
      {
        path: "cuenta",
        name: "checkout-auth",
        component: () => import("../pages/auth.vue"),
        meta: { page: { base: { title: "Cuenta · Checkout" } } },
      },
      {
        path: "datos",
        name: "checkout-buyer",
        component: () => import("../pages/buyer.vue"),
        meta: {
          auth: true,
          roles: ["STUDENT"],
          page: { base: { title: "Datos · Checkout" } },
        },
      },
      {
        path: "pago",
        name: "checkout-method",
        component: () => import("../pages/method.vue"),
        meta: {
          auth: true,
          roles: ["STUDENT"],
          page: { base: { title: "Pago · Checkout" } },
        },
      },
      {
        /*
         * El cobro por método: tarjeta, QR de billetera o pasarela externa. Es
         * pantalla propia y no un paso más de la barra porque comparte
         * indicador con "Pago" — el usuario no avanzó, solo eligió cómo.
         */
        path: "pagar",
        name: "checkout-pay",
        component: () => import("../pages/pay.vue"),
        meta: {
          auth: true,
          roles: ["STUDENT"],
          page: { base: { title: "Pagar · Checkout" } },
        },
      },
      {
        path: "rechazado",
        name: "checkout-rejected",
        component: () => import("../pages/rejected.vue"),
        meta: {
          auth: true,
          roles: ["STUDENT"],
          page: { base: { title: "Pago no completado" } },
        },
      },
      {
        path: "confirmacion",
        name: "checkout-success",
        component: () => import("../pages/success.vue"),
        meta: {
          auth: true,
          roles: ["STUDENT"],
          page: { base: { title: "Matrícula registrada" } },
        },
      },
    ],
  },
];
