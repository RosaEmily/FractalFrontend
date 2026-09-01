import ListPage from "../pages/list.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Personas | Estudiantes |";

/**
 * Sin ruta de creación: la API expone students con `except: ['create']`;
 * un estudiante nace al registrarse un usuario con rol STUDENT.
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
        path: "update/:id",
        name: "students.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
