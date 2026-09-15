import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiAccountGroupOutline,
  mdiSchoolOutline,
  mdiBriefcaseAccountOutline,
} from "@mdi/js";

export const MENU_PEOPLE: MenuItem[] = [
  {
    id: "people",
    label: "Personas",
    icon: mdiAccountGroupOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "people.teachers",
        label: "Instructores",
        icon: mdiBriefcaseAccountOutline,
        roles: ["ADMIN"],
        route: { name: "teachers.list" },
        module: "teachers",
      },
      {
        id: "people.students",
        label: "Estudiantes",
        icon: mdiSchoolOutline,
        roles: ["ADMIN"],
        route: { name: "students.list" },
        module: "students",
      },
    ],
  },
];
