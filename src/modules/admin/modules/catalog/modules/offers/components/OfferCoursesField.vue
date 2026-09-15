<script setup lang="ts">
/**
 * Editor de los cursos de un programa: por cada curso, su docente, fechas y
 * uno o más horarios semanales. Es el shape que espera la API en
 * `courses[n][course_id|teacher_id|start_date|end_date|schedules[m]]`.
 *
 * Los `id` (de offer_course y de schedule) se conservan al editar: la API
 * hace upsert — con `id` actualiza, sin `id` crea.
 */
import {
  SelectCore,
  InputTextCore,
  DatePicketCore,
  ButtonCore,
} from "@/shared/components";
import { DAY_OF_WEEK_OPTIONS } from "../constants/offer.constant";
import type { OfferCourseItem } from "../models/offer.model";
import type { Course } from "../../courses/models/course.model";
import type { Teacher } from "../../teachers/models/teacher.model";

const model = defineModel<OfferCourseItem[]>({ default: () => [] });

withDefaults(
  defineProps<{
    courses: Course[];
    teachers: Teacher[];
    invalid?: boolean;
    messageError?: string | null;
    /**
     * Los cursos del programa los define su tipo —los de la línea de carrera,
     * o el único curso elegido—, así que agregar o quitar filas a mano
     * desincronizaría el programa de su origen.
     */
    lockCourses?: boolean;
    /** Problemas por fila, para marcar cuál falla. */
    problems?: string[];
    /** Inicio de la matrícula: acota la fecha mínima de cada curso. */
    enrollmentStartDate?: Date;
  }>(),
  { lockCourses: false, problems: () => [] },
);

const emptySchedule = () => ({
  dayOfWeek: "",
  startTime: "",
  endTime: "",
});

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

const addSchedule = (courseIndex: number) => {
  model.value = model.value.map((item, i) =>
    i === courseIndex
      ? { ...item, schedules: [...item.schedules, emptySchedule()] }
      : item,
  );
};

const removeSchedule = (courseIndex: number, scheduleIndex: number) => {
  model.value = model.value.map((item, i) =>
    i === courseIndex
      ? {
          ...item,
          schedules: item.schedules.filter((_, j) => j !== scheduleIndex),
        }
      : item,
  );
};
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="!model.length"
      class="rounded-adm-sm border border-dashed border-line px-4 py-5 text-center text-adm-base text-secondary-400"
    >
      Agrega los cursos de este programa para asignarles docente y horario.
    </div>

    <div
      v-for="(item, courseIndex) in model"
      :key="courseIndex"
      class="overflow-hidden rounded-adm-sm border border-line"
    >
      <!-- Curso + docente + fechas -->
      <div class="border-b border-line bg-admin-bg px-4 py-3">
        <div class="flex items-start gap-3">
          <span
            class="mt-2.5 font-mono text-adm-sm text-secondary-400 shrink-0"
            >{{ courseIndex + 1 }}.</span
          >
          <div class="grid flex-1 gap-3 md:grid-cols-2">
            <SelectCore
              v-model="item.courseId"
              label="Curso"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione el curso"
              filter
              filter-placeholder="Buscar curso…"
              :disabled="lockCourses"
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
            />
            <!-- El curso no puede empezar antes de que abra la matrícula:
                 nadie podría haberse inscrito todavía. -->
            <DatePicketCore
              v-model="item.startDate"
              label="Fecha de inicio"
              dayjs-format-value="YYYY-MM-DD"
              :min-date="enrollmentStartDate"
              :max-date="item.endDate ? new Date(`${item.endDate}T00:00:00`) : undefined"
            />
            <DatePicketCore
              v-model="item.endDate"
              label="Fecha de fin"
              dayjs-format-value="YYYY-MM-DD"
              :min-date="item.startDate ? new Date(`${item.startDate}T00:00:00`) : enrollmentStartDate"
            />
            <div class="md:col-span-2">
              <InputTextCore
                v-model="item.meetLink"
                label="Link de videoconferencia (opcional)"
                placeholder="https://meet.google.com/..."
              />
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

      <!-- Horarios -->
      <div class="space-y-2 px-4 py-3">
        <p
          class="font-mono text-adm-label uppercase tracking-[0.06em] text-secondary-400"
        >
          Horario · un curso puede tener varios días con distinta hora
        </p>

        <div
          v-for="(schedule, scheduleIndex) in item.schedules"
          :key="scheduleIndex"
          class="grid items-end gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <SelectCore
            v-model="schedule.dayOfWeek"
            label="Día"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione el día"
            :options="DAY_OF_WEEK_OPTIONS"
          />
          <DatePicketCore
            v-model="schedule.startTime"
            label="Hora inicio"
            time-only
            hour-format="24"
            dayjs-format-input="HH:mm:ss"
            dayjs-format-value="HH:mm:ss"
          />
          <DatePicketCore
            v-model="schedule.endTime"
            label="Hora fin"
            time-only
            hour-format="24"
            dayjs-format-input="HH:mm:ss"
            dayjs-format-value="HH:mm:ss"
          />
          <ButtonCore
            class="!w-auto"
            severity="secondary"
            outlined
            label="Quitar"
            :disabled="item.schedules.length === 1"
            @click="removeSchedule(courseIndex, scheduleIndex)"
          />
        </div>

        <ButtonCore
          class="!w-auto"
          severity="secondary"
          outlined
          label="Agregar horario"
          @click="addSchedule(courseIndex)"
        />
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
