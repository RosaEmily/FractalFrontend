<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ButtonCore, HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { mdiCheck, mdiClockAlertOutline, mdiClose, mdiVideoOutline } from "@mdi/js";
import teacherService, {
  SESSION_ATTENDANCE_STATE,
} from "../../services/teacher.service";
import type {
  RosterDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";
import SessionMaterials from "../../components/session-materials.vue";
import { formatDate, formatTimeRange, weekdayLabel } from "../../utils/format";

const route = useRoute();
const toastStore = useToastStore();

const courses = ref<TeacherCourseDTO[]>([]);
const sessions = ref<TeacherSessionDTO[]>([]);
const roster = ref<RosterDTO | null>(null);

const selectedCourse = ref<number | null>(null);
const selectedSession = ref<number | null>(null);

const loading = ref(true);
const loadingRoster = ref(false);
const saving = ref(false);

/** Marcas en edición: alumno → 0/1/2. Se vuelca al guardar. */
const marks = ref<Record<number, number>>({});

const currentSession = computed(
  () => sessions.value.find((s) => s.id === selectedSession.value) ?? null,
);

/** Una clase cerrada no se re-marca desde acá: la corrige coordinación. */
const editable = computed(() => currentSession.value?.status === 0);

const markedCount = computed(
  () => Object.values(marks.value).filter((v) => v !== undefined).length,
);

const ATTENDANCE_OPTIONS = [
  { value: 1, label: "Presente", icon: mdiCheck, tone: "success" },
  { value: 2, label: "Tarde", icon: mdiClockAlertOutline, tone: "warning" },
  { value: 0, label: "Ausente", icon: mdiClose, tone: "danger" },
];

const OPTION_CLASS: Record<string, string> = {
  success: "bg-success-soft text-success-DEFAULT border-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT border-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT border-danger-DEFAULT",
};

const loadSessions = async (offerCourseId: number) => {
  const { data } = await safeRequest(() => teacherService.sessions(offerCourseId));
  sessions.value = data ?? [];
  // Se abre en la primera clase sin dictar, que es la que toca marcar.
  selectedSession.value =
    sessions.value.find((s) => s.status === 0)?.id ?? sessions.value[0]?.id ?? null;
};

const loadRoster = async (classSessionId: number) => {
  loadingRoster.value = true;
  const { data } = await safeRequest(() => teacherService.roster(classSessionId));
  roster.value = data;

  // Se parte de lo ya registrado para no pisar marcas previas al guardar.
  marks.value = Object.fromEntries(
    (data?.students ?? [])
      .filter((s) => s.attended !== null)
      .map((s) => [s.enrollment_course_id, s.attended as number]),
  );
  loadingRoster.value = false;
};

const saveAttendance = async () => {
  if (!currentSession.value) return;

  saving.value = true;
  const { data } = await safeRequest(() =>
    teacherService.saveAttendance(
      currentSession.value!.id,
      Object.entries(marks.value).map(([id, attended]) => ({
        enrollment_course_id: Number(id),
        attended,
      })),
    ),
  );
  saving.value = false;

  if (data) {
    toastStore.showToastSuccess({ detail: "Asistencia registrada." });
    await loadRoster(currentSession.value.id);
  }
};

const closeSession = async () => {
  if (!currentSession.value) return;

  saving.value = true;
  const { data } = await safeRequest(() =>
    teacherService.closeSession(currentSession.value!.id),
  );
  saving.value = false;

  if (data) {
    toastStore.showToastSuccess({ detail: "Clase marcada como dictada." });
    if (selectedCourse.value) await loadSessions(selectedCourse.value);
    if (currentSession.value) await loadRoster(currentSession.value.id);
  }
};

watch(selectedCourse, async (id) => {
  if (id) await loadSessions(id);
});

watch(selectedSession, async (id) => {
  if (id) await loadRoster(id);
});

onMounted(async () => {
  const { data } = await safeRequest(() => teacherService.courses());
  courses.value = (data ?? []).filter((c) => c.sessions_total > 0);

  // El curso puede venir preseleccionado desde "Mis cursos".
  const fromQuery = Number(route.query.course);
  selectedCourse.value =
    courses.value.find((c) => c.id === fromQuery)?.id ??
    courses.value.find((c) => c.state === "in_progress")?.id ??
    courses.value[0]?.id ??
    null;

  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="SESIONES DE CLASE"
      title="Sesiones de clase"
      sub="Marca la asistencia de cada alumno y cierra la clase cuando termines de dictarla."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="No hay clases que marcar"
      sub="Tus cursos todavía no tienen clases generadas. Las genera coordinación desde el horario del grupo."
    />

    <template v-else>
      <div class="mb-4">
        <label
          class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] block mb-1.5"
        >
          Curso
        </label>
        <select
          v-model="selectedCourse"
          class="w-full max-w-120 px-3 py-2 rounded-adm-sm border border-line bg-surface-paper text-adm-base text-secondary-900"
        >
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.course_name }} — {{ course.offer_name }}
          </option>
        </select>
      </div>

      <div class="grid gap-3.5 lg:grid-cols-[20rem_1fr]">
        <!-- Lista de clases del curso -->
        <AulaCard pad="sm" class="max-h-160 overflow-y-auto">
          <p
            class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] px-2 pt-1 pb-2"
          >
            {{ sessions.length }} clases
          </p>
          <button
            v-for="session in sessions"
            :key="session.id"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-3 px-2 py-2.5 border-t border-line-soft text-left cursor-pointer"
            :class="
              session.id === selectedSession ? 'bg-accent-soft rounded-adm-sm' : ''
            "
            @click="selectedSession = session.id"
          >
            <div class="min-w-0">
              <p class="text-adm-base text-secondary-900 truncate">
                {{ session.name ?? "Sesión" }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ formatDate(session.session_date, true) }}
              </p>
            </div>
            <AulaPill
              :tone="
                (SESSION_ATTENDANCE_STATE[session.attendance_state]?.tone ??
                  'neutral') as never
              "
              size="sm"
            >
              {{ SESSION_ATTENDANCE_STATE[session.attendance_state]?.label }}
            </AulaPill>
          </button>
        </AulaCard>

        <!-- Detalle y lista de asistencia -->
        <div>
          <AulaCard v-if="currentSession" class="mb-3.5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <span
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  {{ currentSession.name ?? "Sesión" }}
                </span>
                <p
                  class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1"
                >
                  {{ currentSession.topic ?? "Sin tema definido" }}
                </p>
                <p class="text-adm-sm text-secondary-500 mt-1">
                  {{ weekdayLabel(currentSession.session_date) }}
                  {{ formatDate(currentSession.session_date, true) }} ·
                  {{
                    formatTimeRange(
                      currentSession.start_time,
                      currentSession.end_time,
                    )
                  }}
                </p>
              </div>
              <a
                v-if="currentSession.meet_link && editable"
                :href="currentSession.meet_link"
                target="_blank"
                rel="noopener"
                class="v3-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-pill bg-primary-500 text-white text-adm-sm font-semibold"
              >
                <HeroCore :path="mdiVideoOutline" class="size-4" />
                Iniciar clase
              </a>
            </div>
          </AulaCard>

          <AulaNotice v-if="!editable" tone="success" class="mb-3.5">
            Clase cerrada: {{ roster?.summary.present ?? 0 }} presentes,
            {{ roster?.summary.late ?? 0 }} tarde,
            {{ roster?.summary.absent ?? 0 }} ausentes. Para corregir una marca
            hay que pedirlo a coordinación.
          </AulaNotice>

          <AulaNotice v-else tone="warning" class="mb-3.5">
            Clase pendiente de cierre · {{ markedCount }} de
            {{ roster?.students.length ?? 0 }} alumnos marcados.
            <template #action>
              <ButtonCore
                label="Marcar como dictada"
                size="small"
                :loading="saving"
                @click="closeSession"
              />
            </template>
          </AulaNotice>

          <AulaCard pad="sm">
            <AulaSkeleton v-if="loadingRoster" kind="table" :rows="5" />

            <AulaEmpty
              v-else-if="!roster?.students.length"
              title="Sin alumnos matriculados"
              sub="Este curso todavía no tiene alumnos en su grupo."
            />

            <template v-else>
              <div class="overflow-x-auto">
                <table class="w-full min-w-160 text-adm-base">
                  <thead>
                    <tr
                      class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                    >
                      <th class="text-left px-2 py-2 font-medium">Alumno</th>
                      <th class="text-left px-2 py-2 font-medium">Documento</th>
                      <th class="text-left px-2 py-2 font-medium">
                        {{ editable ? "Marcar asistencia" : "Asistencia" }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="student in roster.students"
                      :key="student.enrollment_course_id"
                      class="border-t border-line-soft"
                    >
                      <td class="px-2 py-2.5 text-secondary-900">
                        {{ student.full_name }}
                      </td>
                      <td
                        class="px-2 py-2.5 font-mono text-adm-sm text-secondary-500"
                      >
                        {{ student.document_number }}
                      </td>
                      <td class="px-2 py-2.5">
                        <div v-if="editable" class="flex gap-1">
                          <button
                            v-for="option in ATTENDANCE_OPTIONS"
                            :key="option.value"
                            type="button"
                            class="inline-flex items-center gap-1 px-2 py-1 rounded-adm-sm border text-adm-sm cursor-pointer transition-colors"
                            :class="
                              marks[student.enrollment_course_id] === option.value
                                ? OPTION_CLASS[option.tone]
                                : 'border-line text-secondary-500'
                            "
                            @click="
                              marks[student.enrollment_course_id] = option.value
                            "
                          >
                            <HeroCore :path="option.icon" class="size-3.5" />
                            {{ option.label }}
                          </button>
                        </div>
                        <AulaPill
                          v-else-if="student.attended !== null"
                          :tone="
                            (student.attended === 1
                              ? 'success'
                              : student.attended === 2
                                ? 'warning'
                                : 'danger') as never
                          "
                          size="sm"
                        >
                          {{ student.attended_name }}
                        </AulaPill>
                        <span v-else class="text-secondary-400">Sin registro</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                v-if="editable"
                class="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-line-soft px-2"
              >
                <p class="text-adm-sm text-secondary-400">
                  La tardanza cuenta como asistencia. Volver a pasar lista
                  corrige la marca, no la duplica.
                </p>
                <ButtonCore
                  label="Guardar asistencia"
                  :loading="saving"
                  :disabled="!markedCount"
                  @click="saveAttendance"
                />
              </div>
            </template>
          </AulaCard>

          <!-- Material de la clase: subir, programar y eliminar -->
          <SessionMaterials
            v-if="currentSession"
            :key="currentSession.id"
            :class-session-id="currentSession.id"
            :session-date="currentSession.session_date"
            class="mt-3.5"
          />
        </div>
      </div>
    </template>
  </div>
</template>
