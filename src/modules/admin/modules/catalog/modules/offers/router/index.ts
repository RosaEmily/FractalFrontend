import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";
import SessionsPage from "../pages/sessions.vue";
import ManageSessionsPage from "../pages/manage-sessions.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Catálogo | Programas |";

export const routesOffers: RouteRecordRaw[] = [
  {
    path: "offers",
    name: "offer",
    children: [
      {
        path: "",
        name: "offers.list",
        component: ListPage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Lista`,
            },
          },
        },
      },
      {
        path: "create",
        name: "offers.create",
        component: CreatePage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Crear`,
            },
          },
        },
      },
      {
        // Clases generadas del programa: el ojo del listado.
        path: ":id/sessions",
        name: "offers.sessions",
        component: SessionsPage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Clases`,
            },
          },
        },
      },
      {
        /*
         * Alta y actualización de las sesiones del programa. Ruta propia (y no
         * un modo dentro de `sessions`) porque el calendario es de consulta y
         * esto es un formulario: mezclarlos haría que un "volver" ambiguo
         * descarte cambios sin avisar.
         */
        path: ":id/sessions/manage",
        name: "offers.sessions.manage",
        component: ManageSessionsPage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Gestionar clases`,
            },
          },
        },
      },
      {
        path: "edit/:id",
        name: "offers.update",
        component: UpdatePage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Actualizar`,
            },
          },
        },
      },
    ],
  },
];
