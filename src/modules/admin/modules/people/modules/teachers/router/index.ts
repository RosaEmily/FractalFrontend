import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Personas | Instructores |";

/**
 * El alta crea un USUARIO con rol TEACHER: el perfil de instructor es 1:1 con
 * `users`, así que sin usuario no habría correo ni acceso. El formulario llama
 * a `security/users`, que crea ambos registros de una vez.
 */
export const routesTeachers: RouteRecordRaw[] = [
  {
    path: "teachers",
    name: "teachers",
    children: [
      {
        path: "",
        name: "teachers.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "teachers.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "teachers.edit",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
