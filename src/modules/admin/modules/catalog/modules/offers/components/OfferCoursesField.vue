<script setup lang="ts">
/**
 * Editor de los cursos de un programa: por cada curso, su docente, fechas y
 * uno o más horarios semanales. Es el shape que espera la API en
 * `courses[n][course_id|teacher_id|start_date|end_date|schedules[m]]`.
 *
 * Los `id` (de offer_course y de schedule) se conservan al editar: la API
 * hace upsert — con `id` actualiza, sin `id` crea.
 *
 * En el ALTA (`withDuration`) cada curso lleva su duración y sus fechas salen
 * en cascada desde el inicio de clases: el componente solo avisa con `recalc`
 * y el padre, que conoce ese inicio, recalcula.
 */
import { ref } from "vue";
import {
  SelectCore,
  InputTextCore,
  InputNumberCore,
  DatePicketCore,
  ButtonCore,
} from "@/shared/components";
import { DAY_OF_WEEK_OPTIONS } from "../constants/offer.constant";
import type { OfferCourseItem, OfferSchedule } from "../models/offer.model";
import type { Course } from "../../courses/models/course.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import {
  DURATION_PRESETS,
  copyScheduleToNextDay,
  emptySchedule,
  formatDuration,
  scheduleDuration,
  setScheduleDuration,
  setScheduleEnd,
  setScheduleStart,
} from "../utils/offer-form";

const model = defineModel<OfferCourseItem[]>({ default: () => [] });

const props = withDefaults(
  defineProps<{
    courses: Course[];
    teachers: Teacher[];
    invalid?: boolean;
    messageError?: string | null;
    /**
     * Los cursos del programa los define su tipo —los de la línea de carrera,
     * o el único curso elegido—, así que agregar o quitar filas a mano
     * desincronizaría el programa de su origen. Con esto el curso se muestra
     * como TEXTO, no como select.
     */
    lockCourses?: boolean;
    /** Línea de carrera: "Curso N de M" y "Se habilita al aprobar…". */
    sequence?: boolean;
    /** Alta: duración por curso y fechas calculadas en cascada. */
    withDuration?: boolean;
    /** Problemas por fila, para marcar cuál falla. */
    problems?: string[];
    /** Inicio de la matrícula: acota la fecha mínima de cada curso. */
    enrollmentStartDate?: Date;
  }>(),
  {
    lockCourses: false,
    sequence: false,
    withDuration: false,
    problems: () => [],
  },
);

const emit = defineEmits<{ recalc: [] }>();

const DURATION_UNITS = [
  { label: "semanas", value: "weeks" },
  { label: "meses", value: "months" },
];

/**
 * El picker de rango trabaja con una tupla; el modelo guarda las dos fechas por
 * separado, que es lo que espera la API (`start_date` / `end_date`).
 *
 * Se devuelve `null` cuando no hay inicio: una tupla `[null, null]` deja el
 * campo con el texto de rango a medio escribir en vez del placeholder.
 */
const rangeOf = (item: OfferCourseItem): (string | null)[] | null =>
  item.startDate ? [item.startDate, item.endDate ?? null] : null;

/** Fechas elegidas a mano: dejan de recalcularse y los siguientes siguen desde acá. */
const setRange = (item: OfferCourseItem, value: unknown) => {
  const range = Array.isArray(value) ? (value as (string | null)[]) : [];
  item.startDate = range[0] ?? null;
  item.endDate = range[1] ?? null;
  if (props.withDuration) {
    item.datesEdited = true;
    emit("recalc");
  }
};

const recalcDates = (item: OfferCourseItem) => {
  item.datesEdited = false;
  emit("recalc");
};

const setDuration = (
  item: OfferCourseItem,
  patch: Partial<Pick<OfferCourseItem, "durationValue" | "durationUnit">>,
) => {
  Object.assign(item, patch);
  emit("recalc");
};

const addCourse = () => {
  model.value = [
    ...model.value,
    {
      courseId: null,
      name: "",
      teacherId: null,
      startDate: null,
      endDate: null,
      meetLink: null,
      schedules: [emptySchedule()],
    },
  ];
};

const removeCourse = (index: number) => {
  model.value = model.value.filter((_, i) => i !== index);
};

const addSchedule = (item: OfferCourseItem) => {
  // La duración del primer horario se propone en los siguientes.
  const duration = item.schedules[0] ? scheduleDuration(item.schedules[0]) : null;
  item.schedules.push({ ...emptySchedule(), durationMin: duration });
};

const copySchedule = (item: OfferCourseItem, schedule: OfferSchedule) => {
  item.schedules.push(copyScheduleToNextDay(item.schedules, schedule));
  emit("recalc");
};

const removeSchedule = (item: OfferCourseItem, scheduleIndex: number) => {
  item.schedules.splice(scheduleIndex, 1);
  emit("recalc");
};

const setDay = (schedule: OfferSchedule, day: unknown) => {
  schedule.dayOfWeek = String(day ?? "");
  // El inicio del curso se ajusta a su primer día de horario.
  emit("recalc");
};

/*
 * "Otra" duración: se abre un campo en minutos. Queda abierto también cuando
 * la duración vigente no es una de las rápidas (p. ej. 1 h 10 al editar el fin).
 */
const customOpen = ref(new Set<OfferSchedule>());
const isCustom = (schedule: OfferSchedule) => {
  const duration = scheduleDuration(schedule);
  return (
    customOpen.value.has(schedule) ||
    (!!duration && !DURATION_PRESETS.includes(duration))
  );
};
const openCustom = (schedule: OfferSchedule) => {
  customOpen.value = new Set(customOpen.value).add(schedule);
};
const pickPreset = (schedule: OfferSchedule, minutes: number) => {
  const next = new Set(customOpen.value);
  next.delete(schedule);
  customOpen.value = next;
  setScheduleDuration(schedule, minutes);
};

/*
 * El link puede ser distinto por curso: copiar llena SOLO los vacíos y avisa
 * cuántos se respetaron por tener uno propio.
 */
const linkNotice = ref<string | null>(null);
const copyLinkToAll = (source: OfferCourseItem) => {
  let kept = 0;
  for (const item of model.value) {
    if (item === source) continue;
    if (!item.meetLink) item.meetLink = source.meetLink;
    else if (item.meetLink !== source.meetLink) kept++;
  }
  linkNotice.value = kept
    ? `Copiado a los cursos sin link. ${kept} ${kept === 1 ? "curso conserva su propio link" : "cursos conservan su propio link"}.`
    : "Copiado a todos los cursos.";
};
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="!model.length"
      class="rounded-adm-sm border border-dashed border-line px-4 py-5 text-center text-adm-base text-secondary-400"
    >
      {{
        lockCourses
          ? "Elige el curso o la línea de carrera: sus cursos aparecen acá."
          : "Agrega los cursos de este programa para asignarles docente y horario."
      }}
    </div>

    <div
      v-for="(item, courseIndex) in model"
      :key="courseIndex"
      class="relative"
      :class="sequence ? 'pl-6' : ''"
    >
      <!-- Línea de tiempo de la secuencia: une cada curso con el siguiente. -->
      <template v-if="sequence">
        <span
          class="absolute left-[0.3125rem] top-4 size-3 rounded-full border-2 border-primary-500 bg-admin-bg"
        />
        <span
          v-if="courseIndex < model.length - 1"
          class="absolute left-[0.625rem] top-7 -bottom-3 w-px bg-line"
        />
      </template>

      <div class="overflow-hidden rounded-adm-sm border border-line">
        <!-- Curso + duración + fechas + docente + link -->
        <div class="border-b border-line bg-admin-bg px-4 py-3">
          <div class="flex items-start gap-3">
            <div class="grid flex-1 gap-3 md:grid-cols-2">
              <!-- Curso fijado por el origen: se muestra, no se elige. -->
              <div v-if="lockCourses" class="md:col-span-2">
                <p
                  v-if="sequence"
                  class="font-mono text-adm-label uppercase tracking-[0.06em] text-secondary-400"
                >
                  Curso {{ courseIndex + 1 }} de {{ model.length }}
                </p>
                <p class="font-display text-adm-md font-bold text-secondary-900">
                  {{ item.name }}
                </p>
                <p
                  v-if="sequence && courseIndex > 0"
                  class="mt-0.5 text-adm-sm text-secondary-500"
                >
                  Se habilita al aprobar: {{ model[courseIndex - 1]?.name }}
                </p>
              </div>
              <SelectCore
                v-else
                v-model="item.courseId"
                label="Curso"
                optionLabel="name"
                optionValue="id"
                placeholder="Seleccione el curso"
                filter
                filter-placeholder="Buscar curso…"
                :options="courses"
              />

              <SelectCore
                v-model="item.teacherId"
                label="Docente"
                optionLabel="fullName"
                optionValue="documentNumber"
                placeholder="Seleccione el docente"
                filter
                filter-placeholder="Buscar docente…"
                :options="teachers"
                :class="lockCourses ? 'md:col-span-2' : ''"
              />

              <!-- Duración: de ella salen las fechas del curso y de los siguientes. -->
              <div v-if="withDuration" class="grid grid-cols-[1fr_1.4fr] gap-2">
                <InputNumberCore
                  :model-value="item.durationValue ?? null"
                  label="Duración del curso"
                  :min="1"
                  :max="52"
                  placeholder="9"
                  @update:model-value="
                    setDuration(item, { durationValue: ($event as number | null) ?? null })
                  "
                />
                <SelectCore
                  :model-value="item.durationUnit ?? 'weeks'"
                  label="Unidad"
                  optionLabel="label"
                  optionValue="value"
                  :options="DURATION_UNITS"
                  @update:model-value="
                    setDuration(item, { durationUnit: $event as 'weeks' | 'months' })
                  "
                />
              </div>

              <!--
                Dictado como UN campo de rango: el picker no deja marcar un fin
                anterior al inicio. En el alta viene calculado; si se toca a mano
                queda "editado" y deja de recalcularse.
              -->
              <div :class="withDuration ? '' : 'md:col-span-2'">
                <DatePicketCore
                  :model-value="rangeOf(item)"
                  label="Dictado del curso"
                  :hint-label="
                    withDuration
                      ? item.datesEdited
                        ? 'Editado a mano.'
                        : 'Calculado desde el inicio de clases y la duración.'
                      : 'Del inicio al fin de clases.'
                  "
                  selection-mode="range"
                  :number-of-months="2"
                  dayjs-format-value="YYYY-MM-DD"
                  dayjs-format-input="DD/MM/YYYY"
                  :show-time="false"
                  :min-date="enrollmentStartDate"
                  @update:model-value="setRange(item, $event)"
                />
                <ButtonCore
                  v-if="withDuration && item.datesEdited"
                  class="!w-auto mt-1"
                  size="small"
                  text
                  label="Volver a calcular"
                  @click="recalcDates(item)"
                />
              </div>

              <div class="md:col-span-2">
                <InputTextCore
                  v-model="item.meetLink"
                  label="Link de videoconferencia (opcional)"
                  placeholder="https://meet.google.com/..."
                />
                <div
                  v-if="courseIndex === 0 && model.length > 1 && item.meetLink"
                  class="mt-1 flex flex-wrap items-center gap-2"
                >
                  <ButtonCore
                    class="!w-auto"
                    size="small"
                    text
                    label="Copiar a todos los cursos"
                    @click="copyLinkToAll(item)"
                  />
                  <span v-if="linkNotice" class="text-adm-sm text-secondary-500">
                    {{ linkNotice }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Con los cursos fijados por el tipo, quitarlos rompería el
                 programa respecto a su línea o su curso de origen. -->
            <ButtonCore
              v-if="!lockCourses"
              class="!w-auto mt-6 shrink-0"
              severity="danger"
              text
              label="Quitar"
              @click="removeCourse(courseIndex)"
            />
          </div>
        </div>

        <!-- Horarios: inicio, duración y fin enlazados (el inicio es el ancla). -->
        <div class="space-y-3 px-4 py-3">
          <p
            class="font-mono text-adm-label uppercase tracking-[0.06em] text-secondary-400"
          >
            Horario · un curso puede tener varios días con distinta hora
          </p>

          <div
            v-for="(schedule, scheduleIndex) in item.schedules"
            :key="scheduleIndex"
            class="space-y-2"
          >
            <div
              class="grid items-end gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <SelectCore
                :model-value="schedule.dayOfWeek"
                label="Día"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione el día"
                :options="DAY_OF_WEEK_OPTIONS"
                @update:model-value="setDay(schedule, $event)"
              />
              <DatePicketCore
                :model-value="schedule.startTime"
                label="Inicio"
                time-only
                hour-format="24"
                :step-minute="15"
                dayjs-format-input="HH:mm"
                dayjs-format-value="HH:mm:ss"
                @update:model-value="setScheduleStart(schedule, String($event ?? ''))"
              />
              <DatePicketCore
                :model-value="schedule.endTime"
                label="Fin"
                time-only
                hour-format="24"
                :step-minute="5"
                dayjs-format-input="HH:mm"
                dayjs-format-value="HH:mm:ss"
                @update:model-value="setScheduleEnd(schedule, String($event ?? ''))"
              />
              <div class="flex gap-1">
                <ButtonCore
                  class="!w-auto"
                  severity="secondary"
                  outlined
                  size="small"
                  label="Copiar a otro día"
                  :disabled="!schedule.dayOfWeek"
                  @click="copySchedule(item, schedule)"
                />
                <ButtonCore
                  class="!w-auto"
                  severity="secondary"
                  text
                  size="small"
                  label="Quitar"
                  :disabled="item.schedules.length === 1"
                  @click="removeSchedule(item, scheduleIndex)"
                />
              </div>
            </div>

            <!-- Duración: cambiarla mueve el fin; cambiar el fin la recalcula. -->
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="mr-1 text-adm-sm text-secondary-500">Duración</span>
              <ButtonCore
                v-for="minutes in DURATION_PRESETS"
                :key="minutes"
                class="!w-auto"
                size="small"
                rounded
                :outlined="scheduleDuration(schedule) !== minutes || isCustom(schedule)"
                :severity="scheduleDuration(schedule) === minutes && !isCustom(schedule) ? undefined : 'secondary'"
                :label="formatDuration(minutes)"
                @click="pickPreset(schedule, minutes)"
              />
              <ButtonCore
                class="!w-auto"
                size="small"
                rounded
                :outlined="!isCustom(schedule)"
                :severity="isCustom(schedule) ? undefined : 'secondary'"
                label="Otra"
                @click="openCustom(schedule)"
              />
              <InputNumberCore
                v-if="isCustom(schedule)"
                class="w-28"
                :model-value="scheduleDuration(schedule)"
                :min="5"
                :max="720"
                suffix=" min"
                @update:model-value="setScheduleDuration(schedule, ($event as number | null) ?? null)"
              />
              <span
                v-if="scheduleDuration(schedule)"
                class="ml-1 font-mono text-adm-xs text-secondary-400"
              >
                {{ formatDuration(scheduleDuration(schedule)) }}
              </span>
            </div>
          </div>

          <ButtonCore
            class="!w-auto"
            severity="secondary"
            outlined
            size="small"
            label="Agregar horario"
            @click="addSchedule(item)"
          />
        </div>
      </div>
    </div>

    <ButtonCore
      class="!w-auto"
      severity="secondary"
      outlined
      v-if="!lockCourses"
      label="Agregar curso"
      @click="addCourse"
    />

    <p v-if="messageError" class="text-adm-sm text-danger-DEFAULT">
      {{ messageError }}
    </p>
  </div>
</template>
