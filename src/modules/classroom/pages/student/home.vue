<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiBookOpenPageVariantOutline,
  mdiCalendarCheckOutline,
  mdiCertificateOutline,
  mdiVideoOutline,
  mdiArrowRight,
} from "@mdi/js";
import studentService from "../../services/student.service";
import type { StudentCourse } from "../../models/classroom.model";
import { useClassroomRole } from "../../composables/useClassroomRole";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaStat,
} from "../../components/ui";
import CourseCard from "../../components/course-card.vue";
import {
  formatDate,
  formatPercent,
  formatScore,
  formatTimeRange,
  weekdayLabel,
} from "../../utils/format";

const router = useRouter();
const { user } = useClassroomRole();

const courses = ref<StudentCourse[]>([]);
const loading = ref(true);

const inProgress = computed(() =>
  courses.value.filter((c) => c.progressStatus === "in_progress"),
);

/** La API ordena por clase más próxima, así que la primera con clase es la siguiente. */
const nextCourse = computed(
  () => courses.value.find((c) => c.nextSession) ?? null,
);

/**
 * Asistencia global: se suman las marcas de todos los cursos, no el promedio de
 * los porcentajes — un curso con 2 clases pesaría igual que uno con 20.
 */
const attendance = computed(() => {
  const totals = courses.value.reduce(
    (acc, c) => ({
      present: acc.present + c.attendancePresent,
      late: acc.late + c.attendanceLate,
      absent: acc.absent + c.attendanceAbsent,
    }),
    { present: 0, late: 0, absent: 0 },
  );

  const marked = totals.present + totals.late + totals.absent;
  return {
    ...totals,
    // Null sin marcas: un 0% se leería como "faltó a todo".
    percent: marked ? Math.round(((totals.present + totals.late) / marked) * 100) : null,
  };
});

const certificates = computed(
  () => courses.value.filter((c) => c.certificate).length,
);

/** Últimas notas puestas, de todos los cursos. */
const latestGrades = computed(() =>
  courses.value
    .flatMap((c) =>
      c.evaluations
        .filter((e) => e.score !== null)
        .map((e) => ({ ...e, courseName: c.courseName })),
    )
    .sort((a, b) => String(b.evaluatedAt).localeCompare(String(a.evaluatedAt)))
    .slice(0, 4),
);

const goToNextSession = () => {
  if (!nextCourse.value?.nextSession) return;
  router.push({
    name: "classroom-session",
    params: { sessionId: nextCourse.value.nextSession.id },
    query: { from: "classroom.home" },
  });
};

onMounted(async () => {
  /*
   * El detalle de cada curso trae sus evaluaciones; el listado no. Se piden en
   * paralelo los cursos en progreso para poder mostrar "últimas notas" sin
   * encadenar una petición por curso.
   */
  const { data } = await safeRequest(() => studentService.courses());
  const list = data ?? [];

  const details = await Promise.all(
    list
      .filter((c) => c.progressStatus !== "locked")
      .map((c) => safeRequest(() => studentService.course(c.id), { showAlert: false })),
  );

  const byId = new Map(
    details.flatMap(({ data: detail }) => (detail ? [[detail.id, detail]] : [])),
  );

  courses.value = list.map((c) => byId.get(c.id) ?? c);
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      :eyebrow="`${weekdayLabel(new Date().toISOString())} · Lima`"
      :title="`Hola, ${user?.first_name ?? ''}`"
      :sub="
        inProgress.length
          ? `Tienes ${inProgress.length} curso${inProgress.length === 1 ? '' : 's'} en marcha.`
          : 'Acá verás tus clases, notas y certificados.'
      "
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <template v-else>
      <!-- Próxima clase: lo primero que el alumno viene a mirar -->
      <AulaCard
        v-if="nextCourse?.nextSession"
        class="mb-5 bg-secondary-900 border-secondary-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <span
              class="font-mono text-adm-xs text-white/60 tracking-[0.08em] uppercase"
            >
              Próxima clase en vivo
            </span>
            <p
              class="font-display text-2xl font-bold text-white tracking-tight mt-2"
            >
              {{ nextCourse.nextSession.topic ?? nextCourse.courseName }}
            </p>
            <p class="text-adm-base text-white/70 mt-1.5">
              {{ nextCourse.courseName }} ·
              {{ formatDate(nextCourse.nextSession.date, true) }} ·
              {{
                formatTimeRange(
                  nextCourse.nextSession.startTime,
                  nextCourse.nextSession.endTime,
                )
              }}
            </p>
          </div>
          <button
            type="button"
            class="v3-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-primary-500 text-white text-adm-base font-semibold cursor-pointer"
            @click="goToNextSession"
          >
            <HeroCore :path="mdiVideoOutline" class="size-4" />
            Ir a la clase
          </button>
        </div>
      </AulaCard>

      <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <AulaStat
          label="Cursos en marcha"
          :value="inProgress.length || '—'"
          :icon="mdiBookOpenPageVariantOutline"
        />
        <AulaStat
          label="Mi asistencia"
          :value="formatPercent(attendance.percent)"
          :delta="
            attendance.percent === null
              ? 'Sin clases marcadas todavía'
              : `${attendance.late} tardanzas · ${attendance.absent} faltas`
          "
          :icon="mdiCalendarCheckOutline"
          tone="success"
        />
        <AulaStat
          label="Certificados"
          :value="certificates || '—'"
          :icon="mdiCertificateOutline"
          tone="warning"
        />
        <AulaStat
          v-if="nextCourse"
          label="Nota actual"
          :value="formatScore(nextCourse.equivalentScore)"
          :delta="`${nextCourse.courseName} · ${nextCourse.evaluatedWeight}% evaluado`"
          tone="info"
        />
      </div>

      <template v-if="inProgress.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Cursos en marcha
        </h2>
        <div class="grid gap-3.5 xl:grid-cols-2 mb-6">
          <CourseCard
            v-for="course in inProgress"
            :key="course.id"
            :course="course"
            from="classroom.home"
          />
        </div>
      </template>

      <!-- Últimas notas: el otro motivo por el que se entra al aula -->
      <template v-if="latestGrades.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Últimas notas registradas
        </h2>
        <AulaCard pad="sm">
          <div
            v-for="grade in latestGrades"
            :key="`${grade.courseName}-${grade.id}`"
            class="flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0"
          >
            <div class="min-w-0">
              <p class="text-adm-base text-secondary-900 truncate">
                {{ grade.name }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ grade.courseName }} · {{ grade.typeName ?? "Evaluación" }}
              </p>
            </div>
            <span
              class="font-display text-adm-lg font-bold shrink-0"
              :class="grade.passed ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'"
            >
              {{ formatScore(grade.score) }}
            </span>
          </div>
        </AulaCard>
      </template>

      <AulaEmpty
        v-if="!courses.length"
        title="Todavía no tienes cursos"
        sub="Cuando se confirme tu matrícula, tus cursos y clases aparecerán acá."
      >
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-adm-base text-primary-500 cursor-pointer"
          @click="router.push({ name: 'classroom-courses' })"
        >
          Ver mis cursos
          <HeroCore :path="mdiArrowRight" class="size-3.5" />
        </button>
      </AulaEmpty>
    </template>
  </div>
</template>
