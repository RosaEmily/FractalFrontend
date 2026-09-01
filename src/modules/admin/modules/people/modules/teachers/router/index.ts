import ListPage from "../pages/list.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Personas | Instructores |";

/**
 * Sin ruta de creación: `academic/teachers` va con `except: ['create']`.
 * Un instructor nace al crear un usuario con rol TEACHER desde Usuarios.
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
        path: "update/:id",
        name: "teachers.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
