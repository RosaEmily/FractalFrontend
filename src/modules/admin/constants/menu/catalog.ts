import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiBookOpenPageVariantOutline,
  mdiPlayCircleOutline,
  mdiSignDirection,
  mdiTagOutline,
} from "@mdi/js";

/**
 * "Catálogo" en el diseño es solo lo que se enseña (plantillas): cursos,
 * líneas de carrera y etiquetas. Programas vive en "Programación" porque es
 * la cohorte (cuándo y con quién), y Monedas pasó a "Sistema".
 */
export const MENU_CATALOG: MenuItem[] = [
  {
    id: "catalog",
    label: "Catálogo",
    icon: mdiBookOpenPageVariantOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "catalog.courses",
        label: "Cursos",
        icon: mdiPlayCircleOutline,
        roles: ["ADMIN"],
        route: {
          name: "courses.list",
        },
        module: "courses",
      },
      {
        id: "catalog.learningPaths",
        label: "Líneas de carrera",
        icon: mdiSignDirection,
        roles: ["ADMIN"],
        route: {
          name: "learningPaths.list",
        },
        module: "learningPaths",
      },
      {
        id: "catalog.tags",
        label: "Etiquetas",
        icon: mdiTagOutline,
        roles: ["ADMIN"],
        route: {
          name: "tags.list",
        },
        module: "tags",
      },
    ],
  },
];
