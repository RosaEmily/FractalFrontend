import { routesEvaluationTypes } from "../modules/evaluation-types/router";
import { routesCourseEvaluations } from "../modules/course-evaluations/router";
import { routesStudentEvaluations } from "../modules/student-evaluations/router";
import { routesFinalGrades } from "../modules/final-grades/router";

import type { RouteRecordRaw } from "vue-router";

export const routesEvaluations: RouteRecordRaw[] = [
  {
    path: "evaluations",
    name: "evaluations",
    children: [
      ...routesEvaluationTypes,
      ...routesCourseEvaluations,
      ...routesStudentEvaluations,
      ...routesFinalGrades,
    ],
  },
];
