import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Personas | Estudiantes |";

/**
 * El alta crea un USUARIO con rol STUDENT: el perfil de estudiante es 1:1 con
 * `users`, así que sin usuario no habría correo ni acceso. El formulario llama
 * a `security/users`, que crea ambos registros de una vez.
 */
export const routesStudents: RouteRecordRaw[] = [
  {
    path: "students",
    name: "students",
    children: [
      {
        path: "",
        name: "students.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "students.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "students.edit",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
