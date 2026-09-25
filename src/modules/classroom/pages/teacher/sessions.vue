<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ButtonCore, HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  mdiCheck,
  mdiClockAlertOutline,
  mdiClose,
  mdiPlus,
  mdiVideoOutline,
} from "@mdi/js";
import teacherService, {
  SESSION_ATTENDANCE_STATE,
} from "../../services/teacher.service";
import type {
  RosterDTO,
  RosterStudentDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaCourseSelect,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";
import { CAREER_LABEL } from "../../constants/labels";
import SessionMaterials from "../../components/session-materials.vue";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import AvatarCell from "@/modules/admin/components/ui/avatar-cell.vue";
import {
  formatDate,
  formatTimeRange,
  joinMeta,
  toDay,
  weekdayLabel,
} from "../../utils/format";

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

const today = new Date().toISOString().slice(0, 10);

/** Marcas en edición: alumno → 0/1/2. Se vuelca al guardar. */
const marks = ref<Record<number, number>>({});

/**
 * Alumnos seleccionados para marcar en lote.
 *
 * Sin esto, pasar lista a 30 alumnos son 30 clics: el diseño resuelve el caso
 * frecuente —"casi todos vinieron"— seleccionando y marcando de una vez.
 */
const selected = ref<number[]>([]);

const allSelected = computed(
  () =>
    selected.value.length > 0 &&
    selected.value.length === (roster.value?.students.length ?? 0),
);

const toggleAll = () => {
  selected.value = allSelected.value
    ? []
    : (roster.value?.students ?? []).map((s) => s.enrollment_course_id);
};

const toggleOne = (id: number) => {
  const index = selected.value.indexOf(id);

  if (index === -1) selected.value.push(id);
  else selected.value.splice(index, 1);
};

/**
 * Guarda las marcas indicadas contra la API.
 *
 * ⚠️ El aula NO tiene botón de guardar: marcar ES guardar, como el resto de las
 * pantallas del docente. Antes había un "Guardar asistencia" al pie, y eso
 * dejaba la lista marcada en pantalla pero sin persistir — si el docente
 * cerraba la clase o cambiaba de sesión, perdía todo sin aviso.
 *
 * ⚠️ Si el servidor falla se REVIERTE la marca en pantalla: dejarla puesta
 * afirmaría que quedó registrada algo que no se guardó, que es peor que no
 * haberla marcado.
 */
const persist = async (ids: number[], value: number) => {
  const previous = ids.map((id) => [id, marks.value[id]] as const);

  ids.forEach((id) => (marks.value[id] = value));

  saving.value = true;
  const { data, error } = await safeRequest(() =>
    teacherService.saveAttendance(
      currentSession.value!.id,
      ids.map((id) => ({ enrollment_course_id: id, attended: value })),
    ),
  );
  saving.value = false;

  if (error || !data) {
    previous.forEach(([id, was]) => {
      if (was === undefined) delete marks.value[id];
      else marks.value[id] = was;
    });

    return;
  }

  // El roster trae `attended_at`, que es la columna "Entrada": sin recargar,
  // la hora de ingreso se quedaría vacía tras marcar.
  if (currentSession.value) await loadRoster(currentSession.value.id);
};

/** Marca a UN alumno. */
const markOne = (id: number, value: number) => {
  if (!currentSession.value || saving.value) return;

  void persist([id], value);
};

/** Aplica una marca a todos los seleccionados y limpia la selección. */
const markSelected = async (value: number) => {
  if (!currentSession.value || !selected.value.length || saving.value) return;

  const ids = [...selected.value];
  selected.value = [];

  await persist(ids, value);
};

/**
 * Hora de ingreso del alumno. Sale de `attended_at`, no se deriva de la marca:
 * un ausente no tiene hora y un presente puede haber entrado tarde.
 *
 * ⚠️ En una tardanza se añade el retraso (`19:14 +14′`): la hora sola no dice
 * cuánto llegó tarde, y ese es el dato que justifica la marca ámbar frente al
 * alumno que reclama.
 */
const entryTime = (student: RosterStudentDTO): string => {
  if (!student.attended_at || student.attended === 0) return "—";

  const time = student.attended_at.slice(11, 16);
  const start = currentSession.value?.start_time?.slice(0, 5);

  if (student.attended !== 2 || !start) return time;

  const toMinutes = (v: string) => {
    const [h, m] = v.split(":").map(Number);

    return (h ?? 0) * 60 + (m ?? 0);
  };

  const late = toMinutes(time) - toMinutes(start);

  return late > 0 ? `${time} +${late}′` : time;
};

const currentSession = computed(
  () => sessions.value.find((s) => s.id === selectedSession.value) ?? null,
);

/**
 * Cabecera del detalle: `SESIÓN 1 · LUNES 24 FEB 2025 · 19:00–21:00`.
 *
 * ⚠️ Se une solo lo que EXISTE. Cosiendo los `·` en la plantilla, una sesión
 * sin hora —más de la mitad de las que hay cargadas— terminaba en un separador
 * suelto seguido del marcador de dato vacío.
 */
const sessionMeta = computed(() => {
  const session = currentSession.value;
  if (!session) return "";

  const date = [
    weekdayLabel(session.session_date),
    formatDate(session.session_date, true),
  ]
    .filter(Boolean)
    .join(" ");

  return joinMeta(
    session.name ?? "Sesión",
    date,
    formatTimeRange(session.start_time, session.end_time),
  );
});

/** Una clase cerrada no se re-marca desde acá: la corrige coordinación. */
const editable = computed(() => currentSession.value?.status === 0);

/**
 * Alumnos con asistencia ya registrada.
 *
 * ⚠️ Sale del ROSTER (lo guardado), no de `marks` (lo pulsado en esta visita):
 * con el guardado automático son lo mismo al marcar, pero al entrar de nuevo a
 * una clase a medio pasar `marks` está vacío y el aviso diría "0 de 10
 * marcados" sobre una lista que ya tiene marcas.
 */
const markedCount = computed(
  () =>
    (roster.value?.students ?? []).filter((s) => s.attended !== null).length,
);

type PillTone =
  "neutral" | "accent" | "success" | "warning" | "danger" | "info";

/**
 * Estado de la clase en la lista lateral.
 *
 * `Hoy` solo aplica a la clase pendiente de hoy: una ya dictada o marcada a
 * medias conserva su estado, que dice más que la fecha.
 */
const listState = (
  session: TeacherSessionDTO,
): { label: string; tone: PillTone } => {
  const state = SESSION_ATTENDANCE_STATE[session.attendance_state];

  if (
    session.attendance_state === "pending" &&
    toDay(session.session_date) === today
  ) {
    return { label: "Hoy", tone: "danger" };
  }

  return {
    label: state?.label ?? "Pendiente",
    tone: (state?.tone ?? "neutral") as PillTone,
  };
};

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

/*
 * En la barra oscura el color va SÓLIDO: las mismas clases suaves de la tabla
 * no se leerían sobre el fondo `secondary-900`.
 */
const BULK_CLASS: Record<string, string> = {
  success: "bg-success-DEFAULT",
  warning: "bg-amber-DEFAULT",
  danger: "bg-danger-DEFAULT",
};

const loadSessions = async (offerCourseId: number) => {
  const { data } = await safeRequest(() =>
    teacherService.sessions(offerCourseId),
  );
  sessions.value = data ?? [];
  // Se abre en la primera clase sin dictar, que es la que toca marcar.
  selectedSession.value =
    sessions.value.find((s) => s.status === 0)?.id ??
    sessions.value[0]?.id ??
    null;
};

const loadRoster = async (classSessionId: number) => {
  loadingRoster.value = true;
  const { data } = await safeRequest(() =>
    teacherService.roster(classSessionId),
  );
  roster.value = data;

  // Se parte de lo ya registrado para no pisar marcas previas al guardar.
  marks.value = Object.fromEntries(
    (data?.students ?? [])
      .filter((s) => s.attended !== null)
      .map((s) => [s.enrollment_course_id, s.attended as number]),
  );
  loadingRoster.value = false;
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
  // La selección es de OTRA clase: marcarla en lote acá sería en la equivocada.
  selected.value = [];
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
      eyebrow="CLASES EN VIVO"
      title="Sesiones de clase"
      sub="Cada clase cuelga de un horario del curso. Tú la marcas como dictada al cerrarla: eso registra la asistencia y ya no se puede editar."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="No hay clases por dictar"
      sub="Tus cursos todavía no tienen clases generadas. Las genera coordinación desde el horario del grupo."
    />

    <template v-else>
      <!--
        El diseño atenúa los cursos sin ficha cargada en vez de ocultarlos:
        que un curso no esté no dice nada, verlo en gris con el motivo sí.
      -->
      <AulaCourseSelect
        v-model="selectedCourse"
        :courses="courses"
        :filter="(c) => c.sessions_total > 0"
        disabled-hint="Aún sin datos cargados"
      />

      <div class="grid gap-3.5 lg:grid-cols-[20rem_1fr]">
        <!-- Lista de clases del curso -->
        <!--
          `self-start`: el diseño lo marca explícito (`alignSelf: 'flex-start'`,
          jsx:213). Sin eso la tarjeta se estira al alto de la columna de la
          derecha y un curso de 3 clases deja media pantalla en blanco.
        -->
        <AulaCard pad="none" class="max-h-160 self-start overflow-y-auto">
          <!--
            Cabecera de la lista con su fondo, como el diseño (`AulaRow header`,
            jsx:215). Era un párrafo suelto sin fondo ni el botón de la derecha.

            ⚠️ Va con `pad="none"`, no con `pad="sm"` + márgenes negativos: sin
            el `overflow-hidden` que trae `none`, la franja se sale por el radio
            de la tarjeta y le corta la esquina.
          -->
          <div class="flex items-center gap-2 bg-surface-page px-4 py-2.5">
            <span
              class="flex-1 font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
            >
              {{ sessions.length }} clases ·
              {{ sessions.filter((x) => x.status === 1).length }} dictadas
            </span>
            <!--
              ⚠️ El "+" del diseño abre el alta manual de una sesión fuera del
              horario regular, y NO hay endpoint para eso: el docente no puede
              crear sesiones y una clase suelta necesita un `schedule_id` que el
              diseño no dice de dónde sale. Se deja el hueco visible con el
              motivo en vez de un botón que no haría nada.
            -->
            <span
              class="cursor-not-allowed text-secondary-300"
              title="El alta manual de sesiones todavía no está disponible: las genera coordinación académica desde el horario."
            >
              <HeroCore :path="mdiPlus" class="size-4" />
            </span>
          </div>
          <!--
            La fila activa va SIN radio: en el diseño (`AulaRow`, shell.jsx:350)
            es una franja a ancho completo de la tabla, no una píldora.
          -->
          <button
            v-for="session in sessions"
            :key="session.id"
            type="button"
            class="adm-row w-full grid grid-cols-[3.375rem_1fr_5.75rem] items-center gap-2 px-4 py-2.5 border-t border-line-soft text-left cursor-pointer"
            :class="session.id === selectedSession ? 'bg-accent-soft' : ''"
            @click="selectedSession = session.id"
          >
            <!--
              Fecha y TEMA, no el nombre: en una lista de 9 clases lo que
              distingue una de otra es de qué trata, no que sea la "Sesión 5".
            -->
            <span
              class="font-mono text-adm-sm"
              :class="
                session.id === selectedSession
                  ? 'text-primary-600'
                  : 'text-secondary-400'
              "
            >
              {{ formatDate(session.session_date) }}
            </span>
            <span
              class="text-adm-base truncate"
              :class="
                session.id === selectedSession
                  ? 'text-primary-600 font-bold'
                  : 'text-secondary-900'
              "
            >
              {{ session.topic ?? session.name ?? "Sin tema" }}
            </span>
            <!--
              "Hoy" gana a "Pendiente": el diseño lo trata como estado propio
              porque es la única clase sobre la que hay que actuar hoy mismo.
              Una clase ya marcada conserva su estado real.
            -->
            <AulaPill :tone="listState(session).tone" size="sm">
              {{ listState(session).label }}
            </AulaPill>
          </button>
        </AulaCard>

        <!--
          Detalle y lista de asistencia.

          ⚠️ `min-w-0`: una columna `1fr` de grid tiene `min-width: auto`, así
          que el `min-w` de la tabla de asistencia la ensancha y desborda la
          PÁGINA entera en vez de hacer scroll solo la tabla.
        -->
        <div class="flex min-w-0 flex-col gap-4">
          <AulaCard v-if="currentSession">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <span
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  {{ sessionMeta }}
                </span>
                <p
                  class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1"
                >
                  {{ currentSession.topic ?? "Sin tema definido" }}
                </p>
                <!--
                  El enlace visible, no solo como href del botón: el docente lo
                  copia para pegarlo en un correo o comprobar que es el correcto.
                -->
                <p
                  v-if="currentSession.meet_link"
                  class="text-adm-sm text-secondary-500 mt-1.5 break-all"
                >
                  {{ currentSession.meet_link }}
                </p>
              </div>
              <!--
                Acción y estado van JUNTOS a la derecha (`gap: 10` del diseño).
                Sueltos, el `justify-between` del contenedor repartía los tres
                hijos y dejaba el botón flotando en mitad de la tarjeta.
              -->
              <div class="flex shrink-0 items-center gap-2.5">
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
                <AulaPill
                  :tone="
                    (SESSION_ATTENDANCE_STATE[currentSession.attendance_state]
                      ?.tone ?? 'neutral') as never
                  "
                >
                  {{
                    SESSION_ATTENDANCE_STATE[currentSession.attendance_state]
                      ?.label
                  }}
                </AulaPill>
              </div>
            </div>
          </AulaCard>

          <!--
            El resumen va en el TÍTULO y la consecuencia en el cuerpo: el
            docente necesita el conteo de un vistazo, no leer un párrafo.
          -->
          <AulaNotice
            v-if="!editable"
            tone="info"
            :title="`Asistencia cerrada: ${roster?.summary.present ?? 0} presentes, ${roster?.summary.late ?? 0} tarde, ${roster?.summary.absent ?? 0} ausentes`"
          >
            La sesión quedó marcada como dictada. Cualquier corrección posterior
            la hace coordinación académica.
          </AulaNotice>

          <AulaNotice
            v-else
            tone="warning"
            :title="`Sesión pendiente de cierre · ${markedCount} de ${roster?.students.length ?? 0} alumnos marcados`"
          >
            Marca a cada alumno y cierra la sesión. Al cerrarla, la clase pasa a
            dictada y los alumnos ven su asistencia.
            <template #action>
              <!--
                Primario solo cuando están todos marcados: mientras falten, la
                acción existe pero no se ofrece como el paso natural.

                ⚠️ La variante en espera es `soft` del diseño (V3Button,
                components.jsx:76) —fondo relleno `accent-soft`—, NO `outlined`:
                un botón transparente sobre el aviso ámbar se leía apagado y
                casi desaparecía.
              -->
              <ButtonCore
                label="Marcar como dictada"
                size="small"
                :class="[
                  '!w-auto',
                  markedCount < (roster?.students.length ?? 0)
                    ? 'v3-btn-soft'
                    : '',
                ]"
                :loading="saving"
                @click="closeSession"
              />
            </template>
          </AulaNotice>

          <!--
            `pad="none"` para que la cabecera crema llegue hasta el borde y se
            recorte con el radio de la tarjeta. El esqueleto y el vacío llevan
            su propio padding, porque no son tabla.
          -->
          <AulaCard pad="none">
            <div v-if="loadingRoster" class="p-4">
              <AulaSkeleton kind="table" :rows="5" />
            </div>

            <AulaEmpty
              v-else-if="!roster?.students.length"
              title="Sin alumnos matriculados"
              sub="Este curso todavía no tiene alumnos en su grupo."
            />

            <template v-else>
              <div class="min-w-0 overflow-x-auto">
                <table class="w-full min-w-185 text-adm-base">
                  <thead>
                    <!-- Cabecera con fondo crema, como el resto de tablas. -->
                    <tr
                      class="font-mono text-[0.656rem] font-semibold text-secondary-400 uppercase tracking-[0.05em] bg-surface-page"
                    >
                      <!--
                        ⚠️ La columna se mantiene SIEMPRE, solo se vacía cuando
                        la clase está cerrada: con `v-if` desaparecía y las 5
                        columnas se redistribuían, así que la tabla cambiaba de
                        forma según el estado de la sesión.
                      -->
                      <th class="px-[1.125rem] py-[0.813rem] w-9">
                        <ToggleCheck
                          v-if="editable"
                          label=""
                          :on="allSelected"
                          @toggle="toggleAll"
                        />
                      </th>
                      <th
                        class="text-left px-[1.125rem] py-[0.813rem] font-semibold"
                      >
                        Alumno
                      </th>
                      <th
                        class="text-left px-[1.125rem] py-[0.813rem] font-semibold w-32"
                      >
                        Carrera
                      </th>
                      <th
                        class="text-left px-[1.125rem] py-[0.813rem] font-semibold w-26"
                      >
                        Entrada
                      </th>
                      <!-- 250px reservados: 3 botones píldora no deben apretarse. -->
                      <th
                        class="text-left px-[1.125rem] py-[0.813rem] font-semibold w-62"
                      >
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
                      <td class="px-[1.125rem] py-[0.813rem]">
                        <ToggleCheck
                          v-if="editable"
                          label=""
                          :on="selected.includes(student.enrollment_course_id)"
                          @toggle="toggleOne(student.enrollment_course_id)"
                        />
                      </td>
                      <!--
                        ⚠️ `AvatarCell` ya pinta nombre y línea secundaria:
                        envolverlo repetía el nombre. Y el prop de la foto es
                        `photo`, no `src` — con `src` nunca se mostraba.
                      -->
                      <td class="px-[1.125rem] py-[0.813rem]">
                        <AvatarCell
                          :name="student.full_name"
                          :photo="student.photo_url"
                          :secondary="`DNI ${student.document_number}`"
                        />
                      </td>
                      <td
                        class="px-[1.125rem] py-[0.813rem] text-adm-sm text-secondary-500"
                      >
                        {{
                          student.career
                            ? (CAREER_LABEL[student.career] ?? student.career)
                            : "—"
                        }}
                      </td>
                      <!--
                        Hora real de ingreso (`attendances.join_time`). En ámbar
                        cuando llegó tarde: es el dato que justifica la marca.
                      -->
                      <td
                        class="px-[1.125rem] py-[0.813rem] font-mono text-adm-sm"
                        :class="
                          student.attended === 2
                            ? 'text-amber-DEFAULT'
                            : 'text-secondary-400'
                        "
                      >
                        {{ entryTime(student) }}
                      </td>
                      <td class="px-[1.125rem] py-[0.813rem]">
                        <div v-if="editable" class="flex gap-1">
                          <button
                            v-for="option in ATTENDANCE_OPTIONS"
                            :key="option.value"
                            type="button"
                            class="inline-flex items-center px-3 py-1.5 rounded-pill border-[1.5px] text-adm-sm font-semibold cursor-pointer transition-colors"
                            :class="
                              marks[student.enrollment_course_id] ===
                              option.value
                                ? OPTION_CLASS[option.tone]
                                : 'border-line text-secondary-500'
                            "
                            :disabled="saving"
                            @click="
                              markOne(
                                student.enrollment_course_id,
                                option.value,
                              )
                            "
                          >
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
                        <!--
                          También como pill: en el diseño la columna Asistencia
                          es siempre una etiqueta, así se lee en bloque.
                        -->
                        <AulaPill v-else tone="neutral" size="sm">
                          Sin registro
                        </AulaPill>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </AulaCard>
          <!--
            Barra de acciones masivas: aparece solo con selección, pegada al
            borde inferior para no perderse al hacer scroll en una lista
            larga (es donde el diseño la coloca).
          -->
          <div
            v-if="editable && selected.length"
            class="sticky bottom-4 z-5 flex items-center gap-3.5 flex-wrap px-4.5 py-3 rounded-adm-md bg-secondary-900 shadow-lg mt-3"
          >
            <span class="text-adm-base font-semibold text-white">
              {{ selected.length }}
              {{ selected.length === 1 ? "seleccionado" : "seleccionados" }}
            </span>

            <div class="flex gap-2 ml-auto">
              <button
                v-for="option in ATTENDANCE_OPTIONS"
                :key="option.value"
                type="button"
                class="cursor-pointer px-3.5 py-2 rounded-pill text-adm-sm font-semibold text-white"
                :class="BULK_CLASS[option.tone]"
                :disabled="saving"
                @click="markSelected(option.value)"
              >
                {{ option.label }}
              </button>
              <button
                type="button"
                class="cursor-pointer px-3 py-2 rounded-pill text-adm-sm font-semibold text-white opacity-70"
                @click="selected = []"
              >
                Cancelar
              </button>
            </div>
          </div>

          <!--
            Sin botón de guardar: marcar ES guardar. La nota explica la única
            regla que no se ve en la tabla.
          -->
          <p
            v-if="editable"
            class="mt-3 border-t border-line-soft px-2 pt-3 text-adm-sm text-secondary-400"
          >
            La columna «Entrada» es la hora a la que el alumno se conectó. Hay
            una sola marca por alumno y clase: volver a pasar lista corrige, no
            duplica.
          </p>

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
