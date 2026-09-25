<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiAccountGroupOutline,
  mdiBookOpenPageVariantOutline,
  mdiCalendarBlankOutline,
  mdiChartBoxOutline,
  mdiChevronRight,
  mdiFlagOutline,
  mdiVideoOutline,
} from "@mdi/js";
import teacherService from "../../services/teacher.service";
import type {
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../../dto/teacher.dto";
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

/** Columnas de "Próximas clases", tal cual el diseño (`teacher.jsx:73`). */
const UPCOMING_COLUMNS = "92px minmax(190px,1fr) 155px 115px 85px";

/** El curso al que pertenece una sesión: de ahí salen el grupo y los alumnos. */
const courseOf = (offerCourseId: number | null) =>
  courses.value.find((c) => c.id === offerCourseId) ?? null;

/**
 * Estado de la clase en la tabla de próximas.
 *
 * ⚠️ "Hoy" va en ROJO y es su propio estado, no un adorno sobre "Pendiente":
 * es la única fila sobre la que el docente tiene que actuar hoy mismo.
 */
type PillTone =
  "neutral" | "accent" | "success" | "warning" | "danger" | "info";

const sessionState = (
  session: TeacherSessionDTO,
): { label: string; tone: PillTone } => {
  if (session.status === 1) return { label: "Dictada", tone: "success" };
  if (toDay(session.session_date) === today)
    return { label: "Hoy", tone: "danger" };

  return { label: "Pendiente", tone: "neutral" };
};

/** Cohortes distintas en las que dicta: el diseño lo resume como "N grupos". */
const groupCount = computed(
  () => new Set(courses.value.map((c) => c.offer_id)).size,
);

/** Próximas clases sin dictar, las primeras que el docente tiene que atender. */
const upcoming = computed(() =>
  sessions.value
    .filter((s) => s.status === 0)
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .slice(0, 5),
);

const nextSession = computed(() => upcoming.value[0] ?? null);

/** El curso de la próxima clase: de ahí salen el grupo y el nº de alumnos. */
const nextCourse = computed(() =>
  courses.value.find((c) => c.id === nextSession.value?.offer_course_id),
);

/**
 * "HOY" / "MAÑANA" / el día de la semana, como el diseño.
 *
 * Una fecha suelta obliga a calcular mentalmente cuánto falta; la etiqueta lo
 * dice, que es lo único que importa de un vistazo.
 */
const nextLabel = computed(() => {
  const date = nextSession.value?.session_date;

  if (!date) return "";

  const day = toDay(date);

  if (day === today) return "HOY";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (day === tomorrow.toISOString().slice(0, 10)) return "MAÑANA";

  return weekdayLabel(date).toUpperCase();
});

/**
 * Pendientes reales, derivados de lo que devuelve la API. Cada uno lleva a la
 * pantalla donde se resuelve.
 */
const pending = computed(() => {
  const items: {
    label: string;
    /** Segunda línea: POR QUÉ es un pendiente. Sin ella el aviso no acciona. */
    detail: string;
    tone: string;
    to: string;
    course?: number;
  }[] = [];

  /*
   * Las notas sin registrar van PRIMERAS: son las que bloquean el cierre del
   * acta y las que el alumno está esperando ver.
   */
  const missingGrades = courses.value.filter(
    (c) => c.sessions_done > 0 && Number(c.weight_total) > 0,
  );
  if (missingGrades.length) {
    const first = missingGrades[0];
    items.push({
      label: "Notas por registrar",
      detail: `${first?.course_name} ya tiene clases dictadas y evaluaciones definidas`,
      tone: "warning",
      to: "classroom-teacher-grading",
      course: first?.id,
    });
  }

  courses.value
    .filter((c) => !c.weights_ok)
    .forEach((c) =>
      items.push({
        label: `Los pesos de ${c.course_name} suman ${Number(c.weight_total)}%`,
        detail: "Corrige el cuadro para poder cerrar el acta",
        tone: "danger",
        to: "classroom-teacher-evaluations",
        course: c.id,
      }),
    );

  // Curso terminado cuya acta sigue abierta: el alumno no recibe certificado.
  courses.value
    .filter((c) => c.state === "completed")
    .forEach((c) =>
      items.push({
        label: `Acta de ${c.course_name} sin cerrar`,
        detail: `El curso terminó el ${formatDate(c.end_date, true)}`,
        tone: "warning",
        to: "classroom-teacher-finals",
        course: c.id,
      }),
    );

  // Clase pasada que el docente nunca cerró: bloquea el cierre del acta.
  const unmarked = sessions.value.filter(
    (s) => s.status === 0 && toDay(s.session_date) < today,
  );
  if (unmarked.length) {
    const first = unmarked[0];
    items.push({
      label: `${first?.name ?? "Una sesión"} sin marcar`,
      detail: `Se dictó el ${formatDate(first?.session_date ?? null)} y sigue como pendiente`,
      tone: "warning",
      to: "classroom-teacher-sessions",
      course: first?.offer_course_id,
    });
  }

  courses.value
    .filter((c) => !c.sessions_total)
    .forEach((c) =>
      items.push({
        label: `${c.course_name} no tiene clases generadas`,
        detail: "Las genera coordinación académica desde el horario",
        tone: "warning",
        to: "classroom-teacher-courses",
      }),
    );

  return items;
});

/** Clases de los próximos 7 días: el stat "Clases esta semana" del diseño. */
const weekSessions = computed(() => {
  const limit = new Date();
  limit.setDate(limit.getDate() + 7);
  const until = limit.toISOString().slice(0, 10);

  return sessions.value.filter(
    (s) => toDay(s.session_date) >= today && toDay(s.session_date) <= until,
  );
});

/** Días de la semana en que dicta, abreviados: "mié, jue y sáb". */
const weekDaysLabel = computed(() => {
  const days = [
    ...new Set(
      weekSessions.value.map((s) => weekdayLabel(s.session_date).slice(0, 3)),
    ),
  ];

  if (!days.length) return "";
  if (days.length === 1) return days[0] as string;

  return `${days.slice(0, -1).join(", ")} y ${days[days.length - 1]}`;
});

/**
 * Asistencia promedio de todos los cursos que dicta.
 *
 * ⚠️ Se promedia sobre las MARCAS crudas (asistencias / total), no sobre los
 * porcentajes de cada curso: promediar porcentajes le da el mismo peso a un
 * curso de 3 alumnos que a uno de 30.
 *
 * `—` mientras no haya ninguna marca: 0% diría que no fue nadie, que es
 * distinto de "aún no se pasó lista".
 */
const attendancePercent = computed(() => {
  const attended = courses.value.reduce(
    (a, c) => a + (c.attendance_attended ?? 0),
    0,
  );
  const total = courses.value.reduce((a, c) => a + (c.attendance_total ?? 0), 0);

  return total ? `${Math.round((attended * 100) / total)}%` : "—";
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
      :eyebrow="`${weekdayLabel(today)} ${formatDate(today, true)}`"
      :title="`Hola, ${user?.first_name ?? ''}`"
      :sub="`${activeCourses.length} cursos activos en ${groupCount} grupos · ${students} alumnos a tu cargo.`"
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <template v-else>
      <!--
        Próxima clase + pendientes, lado a lado (`1.35fr 1fr` del diseño).
        Estaban uno debajo del otro y la mitad derecha quedaba desperdiciada.
      -->
      <div class="grid gap-5 mb-6 lg:grid-cols-[1.35fr_1fr]">
        <!--
          ⚠️ `div` propio y NO `AulaCard`: la tarjeta declara `bg-surface-paper`
          en su `class` estático, y una clase de fondo pasada desde fuera
          compite con ella en el CSS en vez de ganarle. La tarjeta salía BLANCA
          con el texto blanco encima — invisible.
        -->
        <div
          v-if="nextSession"
          class="rounded-adm-lg bg-secondary-900 px-7 py-6.5 text-white"
        >
          <div class="mb-4 flex items-center gap-2.5">
            <span
              class="animate-pulse-dot size-2 shrink-0 rounded-pill bg-primary-500"
            />
            <span
              class="font-mono text-adm-xs uppercase tracking-[0.08em] text-white/60"
            >
              Tu próxima clase
            </span>
            <span class="ml-auto font-mono text-adm-xs text-white/55">
              {{ nextLabel }}
            </span>
          </div>

          <!-- Curso · grupo · alumnos: de qué clase se está hablando. -->
          <p class="mb-2 font-mono text-adm-sm text-white/65">
            {{ nextSession.course_name }} ·
            {{ nextCourse?.offer_prefix ?? nextSession.offer_name }} ·
            {{ nextCourse?.students_count ?? 0 }} alumnos
          </p>

          <p class="font-display text-[1.625rem] font-bold tracking-[-0.02em]">
            {{ nextSession.topic ?? nextSession.name ?? "Sesión" }}
          </p>

          <p class="mt-2.5 text-adm-base text-white/75">
            {{ nextSession.name ?? "Sesión" }} ·
            {{ weekdayLabel(nextSession.session_date) }}
            {{ formatDate(nextSession.session_date)
            }}<template v-if="nextSession.start_time">
              ·
              {{
                formatTimeRange(nextSession.start_time, nextSession.end_time)
              }}
            </template>
          </p>

          <div class="mt-5 flex flex-wrap gap-2.5">
            <!--
              Dos acciones, como el diseño: entrar a la videollamada es lo que
              el docente hace a la hora de clase, y abrir la sesión es lo que
              hace antes para preparar o pasar lista.
            -->
            <a
              v-if="nextSession.meet_link?.trim()"
              :href="nextSession.meet_link"
              target="_blank"
              rel="noopener"
              class="inline-flex cursor-pointer items-center gap-2 rounded-pill bg-white px-4 py-2.5 text-adm-base font-semibold text-secondary-900"
            >
              <HeroCore :path="mdiVideoOutline" class="size-4" />
              Iniciar videollamada
            </a>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-white/30 px-4 py-2.5 text-adm-base font-semibold text-white"
              @click="goToNext"
            >
              Ir a la sesión
            </button>
          </div>
        </div>

        <!-- Sin próxima clase el hueco se explica, no se deja vacío. -->
        <AulaCard v-else class="flex items-center">
          <p class="text-adm-base text-secondary-400">
            No tienes clases programadas por delante. Las siguientes aparecerán
            acá en cuanto coordinación las genere desde el horario.
          </p>
        </AulaCard>

        <!-- Pendientes: cada uno lleva a donde se resuelve. -->
        <AulaCard v-if="pending.length" class="flex flex-col gap-3">
          <span
            class="font-mono text-adm-xs uppercase tracking-[0.08em] text-secondary-400"
          >
            Pendientes
          </span>
          <button
            v-for="(item, index) in pending"
            :key="index"
            type="button"
            class="adm-row flex w-full cursor-pointer items-center justify-between gap-3 rounded-adm-md bg-surface-page px-3 py-[0.6875rem] text-left"
            @click="
              router.push({
                name: item.to,
                query: item.course ? { course: item.course } : undefined,
              })
            "
          >
            <!--
              Icono de bandera + DOS líneas: la pill "!" no decía nada y sin el
              subtítulo el docente tiene que entrar a la pantalla para
              enterarse de qué pasó.
            -->
            <span class="flex min-w-0 items-center gap-2.5">
              <HeroCore
                :path="mdiFlagOutline"
                class="size-[1.0625rem] shrink-0"
                :class="
                  item.tone === 'danger'
                    ? 'text-danger-DEFAULT'
                    : 'text-amber-DEFAULT'
                "
              />
              <span class="min-w-0">
                <span
                  class="block truncate text-adm-base font-semibold text-secondary-900"
                >
                  {{ item.label }}
                </span>
                <span class="block truncate text-adm-sm text-secondary-400">
                  {{ item.detail }}
                </span>
              </span>
            </span>
            <HeroCore
              :path="mdiChevronRight"
              class="size-4 shrink-0 text-secondary-400"
            />
          </button>
        </AulaCard>
      </div>

      <div
        class="mb-7 grid gap-4"
        style="grid-template-columns: repeat(auto-fit, minmax(13.125rem, 1fr))"
      >
        <AulaStat
          label="Cursos asignados"
          :value="courses.length || '—'"
          :delta="`${groupCount} ${groupCount === 1 ? 'grupo' : 'grupos'}`"
          :icon="mdiBookOpenPageVariantOutline"
        />
        <AulaStat
          label="Alumnos a cargo"
          :value="students || '—'"
          :icon="mdiAccountGroupOutline"
          tone="info"
        />
        <AulaStat
          label="Clases esta semana"
          :value="weekSessions.length || '—'"
          :delta="weekDaysLabel"
          :icon="mdiCalendarBlankOutline"
          tone="success"
        />
        <AulaStat
          label="Asistencia promedio"
          :value="attendancePercent"
          delta="de mis cursos"
          :icon="mdiChartBoxOutline"
          tone="warning"
        />
      </div>

      <!-- Próximas clases -->
      <template v-if="upcoming.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Próximas clases que dictas
        </h2>
        <!--
          GRID con las columnas del diseño (`teacher.jsx:73`):
          `92px minmax(190px,1fr) 155px 115px 85px`. Con `<table>` el ancho
          sobrante se reparte entre las columnas sin ancho y "Sesión y tema"
          —que es la que debe crecer— queda igual que las demás.
        -->
        <AulaCard pad="none">
          <div class="overflow-x-auto">
            <div class="min-w-180">
              <div
                class="grid items-center gap-3.5 bg-surface-page px-[1.125rem] py-[0.813rem] font-mono text-[0.656rem] font-semibold uppercase tracking-[0.05em] text-secondary-400"
                :style="{ gridTemplateColumns: UPCOMING_COLUMNS }"
              >
                <span>Fecha</span>
                <span>Sesión y tema</span>
                <span>Curso</span>
                <span>Estado</span>
                <span>Alumnos</span>
              </div>

              <button
                v-for="session in upcoming"
                :key="session.id"
                type="button"
                class="adm-row grid w-full cursor-pointer items-center gap-3.5 border-t border-line-soft px-[1.125rem] py-[0.813rem] text-left"
                :style="{ gridTemplateColumns: UPCOMING_COLUMNS }"
                @click="
                  router.push({
                    name: 'classroom-teacher-sessions',
                    query: { course: session.offer_course_id },
                  })
                "
              >
                <span class="min-w-0">
                  <span
                    class="block font-display text-adm-base font-bold text-secondary-900"
                  >
                    {{ formatDate(session.session_date) }}
                  </span>
                  <span
                    class="block font-mono text-adm-xs uppercase text-secondary-400"
                  >
                    {{ weekdayLabel(session.session_date).slice(0, 3) }}
                    {{ (session.start_time ?? "").slice(0, 5) }}
                  </span>
                </span>

                <span class="min-w-0">
                  <span class="block truncate font-semibold text-secondary-900">
                    {{ session.topic ?? "—" }}
                  </span>
                  <span class="block truncate text-adm-sm text-secondary-400">
                    {{ session.name ?? "Sesión" }}
                  </span>
                </span>

                <span class="min-w-0">
                  <span class="block truncate text-adm-sm text-secondary-500">
                    {{ session.course_name }}
                  </span>
                  <span
                    class="block truncate font-mono text-adm-xs text-secondary-400"
                  >
                    {{ courseOf(session.offer_course_id)?.offer_prefix ?? "" }}
                  </span>
                </span>

                <span>
                  <AulaPill :tone="sessionState(session).tone" size="sm">
                    {{ sessionState(session).label }}
                  </AulaPill>
                </span>

                <span class="font-mono text-adm-sm text-secondary-500">
                  {{ courseOf(session.offer_course_id)?.students_count ?? "—" }}
                </span>
              </button>
            </div>
          </div>
        </AulaCard>
      </template>

      <AulaEmpty
        v-else-if="!courses.length"
        title="Aún no tienes cursos asignados"
        sub="Cuando coordinación te asigne un curso de un grupo, sus clases y alumnos aparecerán acá."
      >
        <HeroCore :path="mdiCalendarBlankOutline" class="size-4" />
      </AulaEmpty>
    </template>
  </div>
</template>
