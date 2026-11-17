const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Catálogo | Líneas de carrera |";

export const routesLearningPaths: RouteRecordRaw[] = [
  {
    path: "learning-paths",
    name: "learningPath",
    children: [
      {
        path: "",
        name: "learningPaths.list",
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
        name: "learningPaths.create",
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
        path: "edit/:id",
        name: "learningPaths.update",
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
