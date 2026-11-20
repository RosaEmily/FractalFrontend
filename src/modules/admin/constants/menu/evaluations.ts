import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiCheckCircleOutline,
  mdiFilterVariant,
  mdiStarOutline,
  mdiSchoolOutline,
  mdiMedalOutline,
} from "@mdi/js";

export const MENU_EVALUATIONS: MenuItem[] = [
  {
    id: "evaluations",
    label: "Evaluaciones",
    icon: mdiCheckCircleOutline,
    children: [
      {
        id: "evaluations.types",
        label: "Tipos de evaluación",
        icon: mdiFilterVariant,
        route: { name: "evaluationTypes.list" },
        module: "evaluationTypes",
      },
      {
        id: "evaluations.courses",
        label: "Evaluaciones",
        icon: mdiStarOutline,
        route: { name: "courseEvaluations.list" },
        module: "courseEvaluations",
      },
      {
        id: "evaluations.grades",
        label: "Notas",
        icon: mdiSchoolOutline,
        route: { name: "studentEvaluations.list" },
        module: "studentEvaluations",
      },
      {
        id: "evaluations.final",
        label: "Notas finales",
        icon: mdiMedalOutline,
        route: { name: "finalGrades.list" },
        module: "finalGrades",
      },
    ],
  },
];
