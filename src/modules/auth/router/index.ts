import AuthPage from "../pages/AuthPage.vue";
import LayoutMain from "@/modules/layouts/main.vue";
import type { RouteRecordRaw } from "vue-router";

/*
 * Dos puertas al mismo formulario.
 *
 * Panel y aula son públicos que no se cruzan: el alumno no debería leer sobre
 * bitácoras de auditoría, y el aula necesita decir que la cuenta la crea la
 * matrícula. Lo que cambia es el contenido, no la lógica de sesión, así que
 * comparten componente y se distinguen por `meta.loginVariant`.
 */
export const routesAuth: RouteRecordRaw[] = [
  {
    path: "/",
    component: LayoutMain,
    meta: {
      guestOnly: true,
    },
    children: [
      {
        path: "login",
        name: "login",
        component: AuthPage,
        meta: {
          loginVariant: "admin",
          page: {
            base: {
              title: "Acceso al panel",
            },
          },
        },
      },
      {
        path: "aula/login",
        name: "classroom-login",
        component: AuthPage,
        meta: {
          loginVariant: "classroom",
          page: {
            base: {
              title: "Aula virtual",
            },
          },
        },
      },
    ],
  },
];
