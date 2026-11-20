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
    children: [
      {
        id: "people.teachers",
        label: "Instructores",
        icon: mdiBriefcaseAccountOutline,
        route: { name: "teachers.list" },
        module: "teachers",
      },
      {
        id: "people.students",
        label: "Estudiantes",
        icon: mdiSchoolOutline,
        route: { name: "students.list" },
        module: "students",
      },
    ],
  },
];
