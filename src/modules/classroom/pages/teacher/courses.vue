<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import teacherService, {
  TEACHER_COURSE_STATE,
} from "../../services/teacher.service";
import type { TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaProgress,
} from "../../components/ui";
import { formatDate } from "../../utils/format";

const router = useRouter();

const courses = ref<TeacherCourseDTO[]>([]);
const loading = ref(true);

const stateOf = (course: TeacherCourseDTO) =>
  TEACHER_COURSE_STATE[course.state] ?? { label: course.state, tone: "neutral" };

/**
 * Un curso en marcha lleva a sus clases; uno cerrado, a su acta. Es lo que el
 * docente quiere hacer en cada caso.
 */
const open = (course: TeacherCourseDTO) => {
  router.push({
    name:
      course.state === "completed"
        ? "classroom-teacher-finals"
        : "classroom-teacher-sessions",
    query: { course: course.id },
  });
};

onMounted(async () => {
  const { data } = await safeRequest(() => teacherService.courses());
  courses.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="MIS CURSOS"
      title="Mis cursos"
      sub="Los cursos que dictas, con su avance de clases y el estado del cuadro de evaluación."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <div v-else-if="courses.length" class="grid gap-3.5 xl:grid-cols-2">
      <AulaCard v-for="course in courses" :key="course.id" hover @click="open(course)">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span
              class="font-mono text-adm-xs text-secondary-400 tracking-[0.06em] uppercase"
            >
              {{ course.offer_prefix ?? course.offer_name }}
            </span>
            <p
              class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1 truncate"
            >
              {{ course.course_name }}
            </p>
            <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
              {{ course.offer_name }}
            </p>
          </div>
          <AulaPill :tone="stateOf(course).tone as never" size="sm">
            {{ stateOf(course).label }}
          </AulaPill>
        </div>

        <div class="grid grid-cols-3 gap-3 mt-4">
          <div>
            <span
              class="font-mono text-adm-xs text-secondary-400 uppercase block"
            >
              Alumnos
            </span>
            <span class="font-display text-adm-lg font-bold text-secondary-900">
              {{ course.students_count }}
            </span>
          </div>
          <div>
            <span
              class="font-mono text-adm-xs text-secondary-400 uppercase block"
            >
              Clases
            </span>
            <span class="font-display text-adm-lg font-bold text-secondary-900">
              <template v-if="course.sessions_total">
                {{ course.sessions_done }}/{{ course.sessions_total }}
              </template>
              <span v-else class="text-amber-DEFAULT text-adm-base">
                sin generar
              </span>
            </span>
          </div>
          <div>
            <span
              class="font-mono text-adm-xs text-secondary-400 uppercase block"
            >
              Pesos
            </span>
            <span
              class="font-display text-adm-lg font-bold"
              :class="
                course.weights_ok ? 'text-secondary-900' : 'text-danger-DEFAULT'
              "
            >
              {{ Number(course.weight_total) }}%
            </span>
          </div>
        </div>

        <AulaProgress
          v-if="course.sessions_total"
          :value="course.sessions_percent"
          class="mt-3.5"
        />

        <p
          class="font-mono text-adm-xs text-secondary-400 mt-3 pt-3 border-t border-line-soft"
        >
          {{ formatDate(course.start_date) }} —
          {{ formatDate(course.end_date, true) }}
        </p>
      </AulaCard>
    </div>

    <AulaEmpty
      v-else
      title="No tienes cursos asignados"
      sub="Cuando coordinación te asigne un curso de un grupo, aparecerá acá con sus clases y alumnos."
    />

    <AulaNotice
      v-if="courses.some((c) => !c.sessions_total)"
      tone="warning"
      class="mt-5"
    >
      Hay cursos sin clases generadas. Las clases se derivan del horario de la
      grupo y las genera coordinación académica.
    </AulaNotice>
  </div>
</template>
