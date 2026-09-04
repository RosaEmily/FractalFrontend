<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiBookOpenPageVariantOutline,
  mdiCalendarBlankOutline,
  mdiChevronRight,
  mdiVideoOutline,
} from "@mdi/js";
import teacherService from "../../services/teacher.service";
import type { TeacherCourseDTO, TeacherSessionDTO } from "../../dto/teacher.dto";
import { useClassroomRole } from "../../composables/useClassroomRole";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import {
  formatDate,
  formatTimeRange,
  toDay,
  weekdayLabel,
} from "../../utils/format";

const router = useRouter();
const { user } = useClassroomRole();

const courses = ref<TeacherCourseDTO[]>([]);
const sessions = ref<TeacherSessionDTO[]>([]);
const loading = ref(true);

const today = new Date().toISOString().slice(0, 10);

const activeCourses = computed(() =>
  courses.value.filter((c) => c.state === "in_progress"),
);

const students = computed(() =>
  courses.value.reduce((total, c) => total + c.students_count, 0),
);

/** Próximas clases sin dictar, las primeras que el docente tiene que atender. */
const upcoming = computed(() =>
  sessions.value
    .filter((s) => s.status === 0)
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .slice(0, 5),
);

const nextSession = computed(() => upcoming.value[0] ?? null);

/**
 * Pendientes reales, derivados de lo que devuelve la API. Cada uno lleva a la
 * pantalla donde se resuelve.
 */
const pending = computed(() => {
  const items: { label: string; tone: string; to: string; course?: number }[] = [];

  // Clase pasada que el docente nunca cerró: bloquea el cierre del acta.
  const unmarked = sessions.value.filter(
    (s) => s.status === 0 && toDay(s.session_date) < today,
  );
  if (unmarked.length) {
    items.push({
      label: `${unmarked.length} ${unmarked.length === 1 ? "clase dictada sin marcar" : "clases dictadas sin marcar"}`,
      tone: "danger",
      to: "classroom-teacher-sessions",
      course: unmarked[0]?.offer_course_id,
    });
  }

  courses.value
    .filter((c) => !c.weights_ok)
    .forEach((c) =>
      items.push({
        label: `Los pesos de ${c.course_name} suman ${Number(c.weight_total)}%`,
        tone: "warning",
        to: "classroom-teacher-evaluations",
        course: c.id,
      }),
    );

  courses.value
    .filter((c) => !c.sessions_total)
    .forEach((c) =>
      items.push({
        label: `${c.course_name} no tiene clases generadas`,
        tone: "warning",
        to: "classroom-teacher-courses",
      }),
    );

  return items;
});

const goToNext = () => {
  if (!nextSession.value) return;
  router.push({
    name: "classroom-teacher-sessions",
    query: { course: nextSession.value.offer_course_id },
  });
};

onMounted(async () => {
  const { data: list } = await safeRequest(() => teacherService.courses());
  courses.value = list ?? [];

  // Las sesiones se piden por curso: el endpoint sin filtro trae todas las
  // suyas, que ya es lo que necesita el resumen.
  const { data: allSessions } = await safeRequest(
    () => teacherService.sessions(),
    { showAlert: false },
  );
  sessions.value = allSessions ?? [];

  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      :eyebrow="`${weekdayLabel(today)} · Lima`"
      :title="`Hola, ${user?.first_name ?? ''}`"
      sub="Tus clases, la asistencia por marcar y las actas pendientes."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <template v-else>
      <!-- Próxima clase que dicta -->
      <AulaCard
        v-if="nextSession"
        class="mb-5 bg-secondary-900 border-secondary-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <span
              class="font-mono text-adm-xs text-white/60 tracking-[0.08em] uppercase"
            >
              Tu próxima clase
            </span>
            <p
              class="font-display text-2xl font-bold text-white tracking-tight mt-2"
            >
              {{ nextSession.topic ?? nextSession.name ?? "Sesión" }}
            </p>
            <p class="text-adm-base text-white/70 mt-1.5">
              {{ nextSession.course_name }} ·
              {{ formatDate(nextSession.session_date, true) }} ·
              {{
                formatTimeRange(nextSession.start_time, nextSession.end_time)
              }}
            </p>
          </div>
          <button
            type="button"
            class="v3-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-primary-500 text-white text-adm-base font-semibold cursor-pointer"
            @click="goToNext"
          >
            <HeroCore :path="mdiVideoOutline" class="size-4" />
            Ir a la clase
          </button>
        </div>
      </AulaCard>

      <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
        <AulaStat
          label="Cursos asignados"
          :value="courses.length || '—'"
          :delta="`${activeCourses.length} en curso`"
          :icon="mdiBookOpenPageVariantOutline"
        />
        <AulaStat
          label="Alumnos a cargo"
          :value="students || '—'"
          :icon="mdiAccountGroupOutline"
          tone="info"
        />
        <AulaStat
          label="Puntos por resolver"
          :value="pending.length || '—'"
          :icon="mdiAlertOutline"
          :tone="pending.length ? 'warning' : 'success'"
        />
      </div>

      <!-- Pendientes: cada uno lleva a donde se resuelve -->
      <template v-if="pending.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Requiere tu atención
        </h2>
        <AulaCard pad="sm" class="mb-6">
          <button
            v-for="(item, index) in pending"
            :key="index"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-3 px-2 py-2.5 border-b border-line-soft last:border-0 text-left cursor-pointer"
            @click="
              router.push({
                name: item.to,
                query: item.course ? { course: item.course } : undefined,
              })
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <AulaPill :tone="item.tone as never" size="sm">!</AulaPill>
              <span class="text-secondary-900 truncate">{{ item.label }}</span>
            </div>
            <HeroCore
              :path="mdiChevronRight"
              class="size-4 text-secondary-400 shrink-0"
            />
          </button>
        </AulaCard>
      </template>

      <!-- Próximas clases -->
      <template v-if="upcoming.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Próximas clases que dictas
        </h2>
        <AulaCard pad="sm">
          <button
            v-for="session in upcoming"
            :key="session.id"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0 text-left cursor-pointer"
            @click="
              router.push({
                name: 'classroom-teacher-sessions',
                query: { course: session.offer_course_id },
              })
            "
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ session.name ?? "Sesión" }} · {{ session.topic ?? "—" }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ session.course_name }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-adm-sm text-secondary-900">
                {{ formatDate(session.session_date, true) }}
              </div>
              <div class="font-mono text-adm-xs text-secondary-400">
                {{ formatTimeRange(session.start_time, session.end_time) }}
              </div>
            </div>
            <AulaPill
              v-if="toDay(session.session_date) === today"
              tone="danger"
              size="sm"
            >
              Hoy
            </AulaPill>
          </button>
        </AulaCard>
      </template>

      <AulaEmpty
        v-else-if="!courses.length"
        title="Todavía no tienes cursos"
        sub="Cuando coordinación te asigne un curso de un grupo, sus clases y alumnos aparecerán acá."
      >
        <HeroCore :path="mdiCalendarBlankOutline" class="size-4" />
      </AulaEmpty>
    </template>
  </div>
</template>
