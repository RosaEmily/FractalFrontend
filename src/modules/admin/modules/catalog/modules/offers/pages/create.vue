<script setup lang="ts">
/**
 * Crear programa (diseño `admin/crear-programa.jsx`, ronda 2).
 *
 * Cuatro pasos —Origen, Datos de la cohorte, Calendario y Cursos— y un
 * resumen fijo a la derecha. El admin decide lo mínimo y el formulario deduce
 * el resto:
 * - el ORIGEN (curso o línea) precarga nombre, precio, moneda, imagen y cursos;
 * - el INICIO DE CLASES es el ancla: de él salen las fechas de cada curso en
 *   cascada (en secuencia si es línea), la matrícula, la cohorte y el prefijo;
 * - todo lo deducido lleva CALCULADO y, si se edita a mano, EDITADO con
 *   "volver a calcular".
 *
 * El body a la API es el mismo de siempre (`toCourseItems`): duraciones y
 * demás son datos de pantalla.
 */
import { z } from "zod";
import { computed, onMounted, ref } from "vue";
import {
  InputTextCore,
  InputNumberCore,
  SelectCore,
  DatePicketCore,
} from "@/shared/components";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import StepCard from "../components/StepCard.vue";
import OfferCourseTimeline from "../components/OfferCourseTimeline.vue";
import ProgramSummary from "../components/ProgramSummary.vue";
import { FilterMatchMode } from "@primevue/core";

import offerService, { toCourseItems } from "../services/offer.service";
import courseService from "../../courses/services/course.service";
import teacherService from "../../teachers/services/teacher.service";
import learningPathService from "../../learning-paths/services/learning-path.service";
import currencyService from "../../currencies/services/currency.service";
import { safeRequest } from "@/shared/utils/request";
import {
  addDays,
  buildCohortCourse,
  cascadeCourseDates,
  dayLabel,
  firstClassMoment,
  lastClassDay,
  programName,
  suggestPrefix,
  validateCourseItems,
  weeksSpan,
  withTime,
} from "../utils/offer-form";

import type { Course } from "../../courses/models/course.model";
import type { Currency } from "../../currencies/models/currency.model";
import type { LearningPath } from "../../learning-paths/models/learning-path.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import type { OfferCourseItem } from "../models/offer.model";

type Fields = Record<string, { value: unknown }>;
type OfferType = "course" | "learning_path";

const activeOnly = {
  filters: { status: { value: 1, matchMode: FilterMatchMode.EQUALS } },
};

const courses = ref<Course[]>([]);
const teachers = ref<Teacher[]>([]);
const learningPaths = ref<LearningPath[]>([]);
const currencies = ref<Currency[]>([]);
const courseItems = ref<OfferCourseItem[]>([]);

const TYPE_OPTIONS = [
  { value: "course", label: "Curso" },
  { value: "learning_path", label: "Línea de carrera" },
];

const selectedType = ref<OfferType>("learning_path");
const isLearningPath = computed(() => selectedType.value === "learning_path");

/** Id del curso o la línea elegidos en el buscador del origen. */
const originId = ref<number | null>(null);
/** Nombre del origen, sin cohorte. Vacío = todavía no se eligió. */
const originName = ref("");
const originImage = ref<string | null>(null);

/*
 * Imagen: se hereda la URL del origen (ya está en S3) y solo se sube un
 * archivo si el admin elige uno propio en "Opciones avanzadas".
 */
const image = ref<File | null>(null);

/* ─── Calendario ────────────────────────────────────────────────────────── */

/** Inicio de clases: el ancla de todo el cronograma. */
const classStart = ref<string | null>(null);

/*
 * La matrícula NO se pide: abre N días antes del inicio (21 por defecto,
 * ajustable con "Cambiar") y cierra el día anterior a la primera clase.
 */
const enrollmentDaysBefore = ref(21);
const enrollmentDaysOpen = ref(false);

const enrollmentOpen = computed(() =>
  classStart.value ? addDays(classStart.value, -(enrollmentDaysBefore.value || 0)) : null,
);
const enrollmentClose = computed(() =>
  classStart.value ? addDays(classStart.value, -1) : null,
);

/*
 * Nombre y prefijo se precargan; si el admin los escribe a mano, se respetan
 * y dejan de recalcularse (sin etiquetas: el campo simplemente es editable).
 */
const nameEdited = ref(false);
const prefixEdited = ref(false);
const advancedOpen = ref(false);

/** Avisos visibles solo tras intentar crear, para no gritar de entrada. */
const submitted = ref(false);

const initialValues = {
  name: null,
  prefix: null,
  type: "learning_path",
  learning_path_id: null,
  enrollment_start_date: null,
  enrollment_end_date: null,
  min_students: 1,
  max_students: 20,
  price: null,
  currency_id: null,
};

/**
 * Recalcula todo lo que depende del origen y del inicio de clases. Lo llaman
 * el origen, el inicio, los días de matrícula, la duración y los horarios de
 * cada curso, y los "volver a calcular".
 */
const recalc = (fields: Fields) => {
  cascadeCourseDates(courseItems.value, classStart.value, isLearningPath.value);

  fields.enrollment_start_date!.value = withTime(enrollmentOpen.value, "00:00:00");
  fields.enrollment_end_date!.value = withTime(enrollmentClose.value, "23:59:59");

  if (!nameEdited.value && originName.value) {
    fields.name!.value = programName(originName.value, classStart.value);
  }
  if (!prefixEdited.value) {
    fields.prefix!.value = suggestPrefix(
      String(fields.name!.value ?? originName.value),
      classStart.value,
    );
  }
};

const onTypeChange = (type: string, fields: Fields) => {
  selectedType.value = type as OfferType;
  fields.type!.value = type;
  fields.learning_path_id!.value = null;
  originId.value = null;
  originName.value = "";
  originImage.value = null;
  image.value = null;
  courseItems.value = [];
  nameEdited.value = false;
  prefixEdited.value = false;
  submitted.value = false;
};

/** El origen precarga nombre, precio, moneda, imagen y los cursos en su orden. */
const onOriginPick = (id: unknown, fields: Fields) => {
  originId.value = id === null || id === undefined ? null : Number(id);

  if (isLearningPath.value) {
    const path = learningPaths.value.find((item) => item.id === originId.value);
    if (!path) return;
    fields.learning_path_id!.value = path.id;
    originName.value = path.name;
    originImage.value = path.imageUrl ?? null;
    fields.price!.value = path.priceRaw;
    fields.currency_id!.value = path.currencyId;
    courseItems.value = path.courseItems.map((course) =>
      buildCohortCourse(course.courseId, course.name, classStart.value),
    );
  } else {
    const course = courses.value.find((item) => item.id === originId.value);
    if (!course) return;
    originName.value = course.name;
    originImage.value = course.imageUrl ?? null;
    fields.price!.value = course.priceRaw;
    fields.currency_id!.value = course.currencyId;
    courseItems.value = [buildCohortCourse(course.id, course.name, classStart.value)];
  }

  nameEdited.value = false;
  prefixEdited.value = false;
  recalc(fields);
};

const onClassStart = (value: unknown, fields: Fields) => {
  classStart.value = typeof value === "string" && value ? value.slice(0, 10) : null;
  recalc(fields);
};

const onDaysBefore = (value: unknown, fields: Fields) => {
  enrollmentDaysBefore.value = Number(value) || 0;
  recalc(fields);
};

/* ─── Validación y resumen ──────────────────────────────────────────────── */

const courseProblems = computed<string[]>(() =>
  submitted.value
    ? validateCourseItems(courseItems.value, enrollmentOpen.value, {
        sequential: isLearningPath.value,
        enrollmentEnd: enrollmentClose.value,
      })
    : [],
);

/*
 * La primera clase (día del horario + su hora) tiene que ser posterior a este
 * momento: con el inicio hoy a las 19:00 y ya pasadas las 19:00, el programa
 * nacería con una clase dictada que nadie dictó.
 */
const CLASS_START_PAST = "El inicio de clases debe ser posterior a la fecha y hora actual.";
const classStartInPast = () => {
  const first = firstClassMoment(courseItems.value);
  return !!first && first.getTime() <= Date.now();
};
const classStartError = computed(() =>
  classStart.value && classStartInPast() ? CLASS_START_PAST : null,
);
const today = new Date(new Date().setHours(0, 0, 0, 0));

const currencySymbol = (currencyId: unknown) => {
  const currency = currencies.value.find((c) => c.id === Number(currencyId));
  return currency?.symbol || currency?.code || "";
};

const programWeeks = computed(() => weeksSpan(classStart.value, lastClassDay(courseItems.value)));

const formSchema = z
  .object({
    name: z
      .string({ message: "El campo nombre es obligatorio" })
      .min(4, { message: "Debe tener al menos 4 caracteres" })
      .max(255, { message: "No puede tener más de 255 caracteres" }),
    prefix: z
      .string({ message: "El prefijo es obligatorio" })
      .min(2, { message: "Debe tener al menos 2 caracteres" })
      .max(255, { message: "No puede tener más de 255 caracteres" }),
    type: z.enum(["course", "learning_path"], {
      message: "Debe seleccionar el tipo",
    }),
    learning_path_id: z.number().nullable().optional(),
    enrollment_start_date: z.string({
      message: "Elige el inicio de clases para calcular la matrícula",
    }),
    enrollment_end_date: z.string({
      message: "Elige el inicio de clases para calcular la matrícula",
    }),
    min_students: z
      .number({ message: "El cupo mínimo es obligatorio" })
      .min(1, { message: "El cupo mínimo debe ser al menos 1" }),
    max_students: z.number({ message: "El cupo máximo es obligatorio" }),
    price: z
      .number({ message: "El precio es obligatorio" })
      .min(0, { message: "El precio no puede ser negativo" })
      .max(99999999.99, { message: "El precio excede el máximo permitido" }),
    currency_id: z.number({ message: "Debe seleccionar una moneda" }),
  })
  .refine((data) => data.max_students >= data.min_students, {
    message: "El cupo máximo debe ser mayor o igual al mínimo",
    path: ["max_students"],
  })
  .refine((data) => data.enrollment_end_date > data.enrollment_start_date, {
    message: "La matrícula debe cerrar después de abrir",
    path: ["enrollment_end_date"],
  })
  .refine((data) => data.type !== "learning_path" || !!data.learning_path_id, {
    message: "Debe seleccionar la línea de carrera",
    path: ["learning_path_id"],
  });

const onSubmit = (body: Record<string, unknown>) => {
  submitted.value = true;
  if (classStartInPast()) {
    return Promise.reject(new Error(CLASS_START_PAST));
  }
  const problems = validateCourseItems(
    courseItems.value,
    body.enrollment_start_date as string | null,
    {
      sequential: isLearningPath.value,
      enrollmentEnd: body.enrollment_end_date as string | null,
    },
  );

  if (problems.length) {
    return Promise.reject(new Error(problems[0]));
  }

  return offerService.create({
    ...body,
    // El archivo propio manda; si no hay, viaja la URL heredada del origen.
    image_url: image.value ?? originImage.value,
    courses: toCourseItems(courseItems.value),
  } as never);
};

onMounted(async () => {
  const [coursesResp, teachersResp, pathsResp, currenciesResp] = await Promise.all([
    safeRequest(() => courseService.all(activeOnly), { showAlert: false }),
    safeRequest(() => teacherService.all(activeOnly), { showAlert: false }),
    safeRequest(() => learningPathService.all(activeOnly), { showAlert: false }),
    safeRequest(() => currencyService.all(activeOnly), { showAlert: false }),
  ]);
  if (coursesResp.status) courses.value = coursesResp.data ?? [];
  if (teachersResp.status) teachers.value = teachersResp.data ?? [];
  if (pathsResp.status) learningPaths.value = pathsResp.data ?? [];
  if (currenciesResp.status) currencies.value = (currenciesResp.data ?? []) as Currency[];
});
</script>

<template>
  <CrudForm
    bare
    title="Crear programa"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="offers.list"
    :service="onSubmit"
  >
    <template #default="{ fields, errors, submit, loading }">
      <header class="mb-[1.375rem]">
        <p class="font-mono text-adm-xs uppercase tracking-[0.08em] text-secondary-400">
          Programas
        </p>
        <h1 class="mt-1 font-display text-[1.625rem] font-bold text-secondary-900">
          Crear programa
        </h1>
      </header>

      <div class="flex flex-col items-start gap-6 lg:flex-row">
        <div class="flex w-full min-w-0 flex-1 flex-col gap-5">
          <!-- 1 · ORIGEN -->
          <StepCard step="1" title="Origen">
            <ModeToggle
              class="self-start"
              :model-value="selectedType"
              :options="TYPE_OPTIONS"
              @update:model-value="onTypeChange($event, fields)"
            />
            <SelectCore
              :key="selectedType"
              :model-value="originId"
              filter
              :filter-placeholder="isLearningPath ? 'Buscar línea de carrera…' : 'Buscar curso…'"
              :placeholder="isLearningPath ? 'Buscar línea de carrera…' : 'Buscar curso…'"
              optionLabel="name"
              optionValue="id"
              :options="isLearningPath ? learningPaths : courses"
              :invalid="!!errors.learning_path_id"
              :message-error="errors.learning_path_id"
              @update:model-value="onOriginPick($event, fields)"
            />
            <div
              v-if="originName"
              class="flex items-center gap-3 rounded-adm-sm border border-line bg-admin-bg px-3.5 py-2.5"
            >
              <img
                v-if="originImage"
                :src="originImage"
                alt=""
                class="h-9 w-13 shrink-0 rounded-md bg-line object-cover"
              />
              <span v-else class="h-9 w-13 shrink-0 rounded-md bg-line" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-adm-base font-bold text-secondary-900">{{ originName }}</p>
                <p class="text-adm-sm text-secondary-400">
                  {{ isLearningPath ? `${courseItems.length} cursos en secuencia fija` : "Curso individual" }}
                </p>
              </div>
            </div>
          </StepCard>

          <div
            v-if="!originName"
            class="rounded-adm-lg border-[1.5px] border-dashed border-line bg-surface-paper px-6 py-15 text-center text-adm-base text-secondary-400"
          >
            Elige un curso o una línea de carrera arriba para continuar.
          </div>

          <template v-else>
            <!-- 2 · DATOS DE LA COHORTE -->
            <StepCard step="2" title="Datos de la cohorte">
              <InputTextCore
                v-model="fields.name.value"
                label="Nombre del programa"
                required
                :invalid="!!errors.name"
                :message-error="errors.name"
                @update:model-value="nameEdited = true"
              />

              <div class="grid grid-cols-2 gap-3.5">
                <InputNumberCore
                  v-model="fields.min_students.value"
                  label="Cupo mínimo"
                  required
                  :min="1"
                  :invalid="!!errors.min_students"
                  :message-error="errors.min_students"
                />
                <InputNumberCore
                  v-model="fields.max_students.value"
                  label="Cupo máximo"
                  required
                  :min="Number(fields.min_students.value) || 1"
                  :invalid="!!errors.max_students"
                  :message-error="errors.max_students"
                />
              </div>

              <div class="grid grid-cols-[1fr_14rem] gap-3.5">
                <InputNumberCore
                  v-model="fields.price.value"
                  label="Precio"
                  required
                  hint-label="Incluye IGV."
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  placeholder="0.00"
                  :invalid="!!errors.price"
                  :message-error="errors.price"
                />
                <SelectCore
                  v-model="fields.currency_id.value"
                  label="Moneda"
                  required
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Moneda"
                  :options="currencies"
                  :invalid="!!errors.currency_id"
                  :message-error="errors.currency_id"
                />
              </div>

              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 self-start text-adm-sm font-semibold text-primary-600"
                @click="advancedOpen = !advancedOpen"
              >
                <span class="inline-block transition-transform" :class="advancedOpen ? 'rotate-90' : ''">›</span>
                Opciones avanzadas
              </button>
              <div v-if="advancedOpen" class="flex flex-col gap-3.5 border-t border-line-soft pt-3.5">
                <InputTextCore
                  v-model="fields.prefix.value"
                  label="Prefijo"
                  hint-label="Código corto interno, formato SIGLAS-AÑO-COHORTE."
                  :invalid="!!errors.prefix"
                  :message-error="errors.prefix"
                  @update:model-value="prefixEdited = true"
                />
                <ImageField
                  label="Imagen"
                  :current="originImage"
                  :hint="
                    originImage && !image
                      ? 'Se reusa la imagen del origen. Sube una si quieres cambiarla.'
                      : 'JPG, PNG o WEBP. Máximo 500 KB.'
                  "
                  accept="image/jpeg,image/png,image/webp"
                  :max-kb="500"
                  @select="(file) => (image = file)"
                  @clear="image = null"
                />
              </div>
            </StepCard>

            <!-- 3 · CALENDARIO -->
            <StepCard step="3" title="Calendario">
              <DatePicketCore
                :model-value="classStart"
                label="Inicio de clases"
                required
                hint-label="Ancla del cronograma: todo lo demás se calcula desde aquí."
                dayjs-format-value="YYYY-MM-DD"
                dayjs-format-input="DD/MM/YYYY"
                :show-time="false"
                :min-date="today"
                :invalid="!!classStartError"
                :message-error="classStartError"
                @update:model-value="onClassStart($event, fields)"
              />

              <!--
                La matrícula no se pide: se deduce del inicio de clases y se
                muestra en una línea. "Cambiar" solo ajusta cuántos días antes abre.
              -->
              <div
                v-if="classStart"
                class="rounded-adm-sm border border-line-soft bg-admin-bg px-3.5 py-2.5 text-adm-sm text-secondary-500"
              >
                <p>
                  La matrícula abre el
                  <strong class="text-secondary-900">{{ dayLabel(enrollmentOpen) }}</strong>
                  y cierra el
                  <strong class="text-secondary-900">{{ dayLabel(enrollmentClose) }}</strong>,
                  el día antes de la primera clase.
                  <button
                    type="button"
                    class="ml-1 cursor-pointer font-semibold text-primary-600"
                    @click="enrollmentDaysOpen = !enrollmentDaysOpen"
                  >
                    {{ enrollmentDaysOpen ? "Listo" : "Cambiar" }}
                  </button>
                </p>
                <div v-if="enrollmentDaysOpen" class="mt-2 flex items-center gap-2">
                  <span>Abre</span>
                  <InputNumberCore
                    class="w-20"
                    :model-value="enrollmentDaysBefore"
                    :min="0"
                    :max="120"
                    @update:model-value="onDaysBefore($event, fields)"
                  />
                  <span>días antes del inicio de clases</span>
                </div>
                <p
                  v-if="errors.enrollment_start_date || errors.enrollment_end_date"
                  class="mt-1 text-danger-DEFAULT"
                >
                  {{ errors.enrollment_start_date || errors.enrollment_end_date }}
                </p>
              </div>

              <div v-if="classStart" class="flex flex-wrap gap-[1.125rem] pt-1">
                <div>
                  <p class="font-mono text-[0.594rem] uppercase tracking-[0.05em] text-secondary-400">Clases</p>
                  <p class="mt-0.5 text-adm-base font-bold text-secondary-900">
                    {{ dayLabel(classStart) }} – {{ dayLabel(lastClassDay(courseItems)) }}
                  </p>
                </div>
                <div>
                  <p class="font-mono text-[0.594rem] uppercase tracking-[0.05em] text-secondary-400">
                    Duración total
                  </p>
                  <p class="mt-0.5 text-adm-base font-bold text-secondary-900">
                    {{ programWeeks ? `${programWeeks} semanas` : "—" }}
                  </p>
                </div>
              </div>
            </StepCard>

            <!-- 4 · CURSOS -->
            <StepCard step="4" :title="isLearningPath ? 'Cursos de la línea' : 'Curso'">
              <OfferCourseTimeline
                v-model="courseItems"
                :teachers="teachers"
                @recalc="recalc(fields)"
              />
            </StepCard>
          </template>
        </div>

        <!-- RESUMEN -->
        <div v-if="originName" class="w-full shrink-0 lg:sticky lg:top-5 lg:w-80">
          <ProgramSummary
            :name="String(fields.name.value ?? originName)"
            :items="courseItems"
            :min-students="(fields.min_students.value as number | null) ?? null"
            :max-students="(fields.max_students.value as number | null) ?? null"
            :price="(fields.price.value as number | null) ?? null"
            :currency-symbol="currencySymbol(fields.currency_id.value)"
            :enrollment-start="enrollmentOpen"
            :enrollment-end="enrollmentClose"
            :loading="loading"
            :problems="courseProblems"
            @submit="submit()"
          />
        </div>
      </div>
    </template>
  </CrudForm>
</template>
