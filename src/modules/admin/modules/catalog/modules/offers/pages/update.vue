<script setup lang="ts">
/**
 * Editar programa: mismo diseño que el alta (`create.vue`) — pasos Origen,
 * Datos de la cohorte, Calendario y Cursos, con el resumen fijo a la derecha.
 *
 * Diferencias con el alta, todas para no pisar lo que ya está guardado:
 * - el ORIGEN no se cambia: cambiarlo reemplazaría los cursos con su trabajo;
 * - nombre y prefijo NO se recalculan solos;
 * - la matrícula guardada se respeta hasta que se toque el inicio de clases o
 *   los días de anticipación;
 * - las fechas de los cursos se recalculan en cascada solo cuando se edita algo
 *   que las mueve (inicio, duración, horarios, orden), no al abrir;
 * - "el inicio debe ser futuro" solo aplica si se CAMBIA el inicio: un programa
 *   en curso tiene su inicio en el pasado y debe poder editarse;
 * - la imagen viaja solo si se elige una nueva: mandar `null` la borraba.
 */
import { z } from "zod";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  InputTextCore,
  InputNumberCore,
  SelectCore,
  DatePicketCore,
} from "@/shared/components";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import FormSkeleton from "@/modules/admin/components/ui/form-skeleton.vue";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import StepCard from "../components/StepCard.vue";
import OfferCourseTimeline from "../components/OfferCourseTimeline.vue";
import ProgramSummary from "../components/ProgramSummary.vue";
import { FilterMatchMode } from "@primevue/core";

import offerService, { toCourseItems } from "../services/offer.service";
import teacherService from "../../teachers/services/teacher.service";
import learningPathService from "../../learning-paths/services/learning-path.service";
import currencyService from "../../currencies/services/currency.service";
import { safeRequest } from "@/shared/utils/request";
import {
  addDays,
  cascadeCourseDates,
  dayLabel,
  dayOf,
  firstClassDay,
  firstClassMoment,
  lastClassDay,
  parseDay,
  validateCourseItems,
  weeksSpan,
  withTime,
} from "../utils/offer-form";

import type { Currency } from "../../currencies/models/currency.model";
import type { LearningPath } from "../../learning-paths/models/learning-path.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import type { OfferCourseItem } from "../models/offer.model";

type Fields = Record<string, { value: unknown }>;

const activeOnly = {
  filters: { status: { value: 1, matchMode: FilterMatchMode.EQUALS } },
};

const route = useRoute();
const identifier = String(route.params.id);

const teachers = ref<Teacher[]>([]);
const learningPaths = ref<LearningPath[]>([]);
const currencies = ref<Currency[]>([]);
const courseItems = ref<OfferCourseItem[]>([]);

const loadingData = ref(true);
const isLearningPath = ref(false);
const learningPathId = ref<number | null>(null);

/** Imagen guardada; `image` solo si el admin elige una nueva. */
const currentImage = ref<string | null>(null);
const image = ref<File | null>(null);
const advancedOpen = ref(false);

/** Avisos visibles solo tras intentar guardar, igual que al crear. */
const submitted = ref(false);

/* ─── Calendario ────────────────────────────────────────────────────────── */

const classStart = ref<string | null>(null);
/** Inicio con el que se abrió: si no cambia, no se valida que sea futuro. */
const savedClassStart = ref<string | null>(null);

const enrollmentDaysBefore = ref(21);
const enrollmentDaysOpen = ref(false);
/** Se tocó algo que redefine la matrícula: desde ahí se calcula como al crear. */
const enrollmentDirty = ref(false);

const initialValues = ref({
  name: null as string | null,
  prefix: null as string | null,
  type: null as string | null,
  learning_path_id: null as number | null,
  enrollment_start_date: null as string | null,
  enrollment_end_date: null as string | null,
  min_students: null as number | null,
  max_students: null as number | null,
  price: null as number | null,
  currency_id: null as number | null,
});

/** Nombre del origen (línea o curso), solo para la tarjeta del paso 1. */
const originName = computed(() => {
  if (!isLearningPath.value) return courseItems.value[0]?.name ?? "";
  return learningPaths.value.find((path) => path.id === learningPathId.value)?.name ?? "";
});

const recalc = (fields: Fields) => {
  cascadeCourseDates(courseItems.value, classStart.value, isLearningPath.value);
  if (!enrollmentDirty.value || !classStart.value) return;
  fields.enrollment_start_date!.value = withTime(
    addDays(classStart.value, -(enrollmentDaysBefore.value || 0)),
    "00:00:00",
  );
  fields.enrollment_end_date!.value = withTime(addDays(classStart.value, -1), "23:59:59");
};

const onClassStart = (value: unknown, fields: Fields) => {
  classStart.value = typeof value === "string" && value ? value.slice(0, 10) : null;
  enrollmentDirty.value = true;
  recalc(fields);
};

const onDaysBefore = (value: unknown, fields: Fields) => {
  enrollmentDaysBefore.value = Number(value) || 0;
  enrollmentDirty.value = true;
  recalc(fields);
};

/* ─── Validación y resumen ──────────────────────────────────────────────── */

const CLASS_START_PAST = "El inicio de clases debe ser posterior a la fecha y hora actual.";
const classStartInPast = () => {
  if (classStart.value === savedClassStart.value) return false;
  const first = firstClassMoment(courseItems.value);
  return !!first && first.getTime() <= Date.now();
};
const classStartError = computed(() =>
  classStart.value && classStartInPast() ? CLASS_START_PAST : null,
);
const today = new Date(new Date().setHours(0, 0, 0, 0));

const courseProblems = (fields: Fields): string[] =>
  submitted.value
    ? validateCourseItems(courseItems.value, dayOf(fields.enrollment_start_date?.value as string), {
        sequential: isLearningPath.value,
        enrollmentEnd: dayOf(fields.enrollment_end_date?.value as string),
      })
    : [];

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

  return offerService.update(identifier, {
    ...body,
    ...(image.value ? { image_url: image.value } : {}),
    courses: toCourseItems(courseItems.value),
  } as never);
};

onMounted(async () => {
  const [teachersResp, pathsResp, currenciesResp] = await Promise.all([
    safeRequest(() => teacherService.all(activeOnly), { showAlert: false }),
    safeRequest(() => learningPathService.all(), { showAlert: false }),
    safeRequest(() => currencyService.all(activeOnly), { showAlert: false }),
  ]);
  if (teachersResp.status) teachers.value = teachersResp.data ?? [];
  if (pathsResp.status) learningPaths.value = pathsResp.data ?? [];
  if (currenciesResp.status) currencies.value = (currenciesResp.data ?? []) as Currency[];

  const offer = await offerService.edit(identifier);
  loadingData.value = false;
  if (!offer) return;

  isLearningPath.value = offer.type === "learning_path";
  learningPathId.value = offer.learningPathId;
  currentImage.value = offer.imageUrl;

  /*
   * En su orden de dictado, con la duración deducida de sus fechas: así la
   * cascada, si se dispara, reproduce lo guardado en vez de moverlo.
   */
  courseItems.value = [...(offer.courseItems ?? [])]
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
    .map((item) => ({
      ...item,
      durationValue: weeksSpan(item.startDate, item.endDate) ?? 4,
      durationUnit: "weeks" as const,
    }));

  classStart.value = firstClassDay(courseItems.value);
  savedClassStart.value = classStart.value;

  const opens = parseDay(offer.enrollmentStartDate);
  const starts = parseDay(classStart.value);
  if (opens && starts) {
    enrollmentDaysBefore.value = Math.max(
      0,
      Math.round((starts.getTime() - opens.getTime()) / 86_400_000),
    );
  }

  initialValues.value = {
    name: offer.name,
    prefix: offer.prefix,
    type: offer.type,
    learning_path_id: offer.learningPathId,
    enrollment_start_date: offer.enrollmentStartDate,
    enrollment_end_date: offer.enrollmentEndDate,
    min_students: offer.minStudents,
    max_students: offer.maxStudents,
    price: offer.priceRaw,
    currency_id: offer.currencyId,
  };
});
</script>

<template>
  <CrudForm
    bare
    title="Editar programa"
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
          Editar programa
        </h1>
      </header>

      <FormSkeleton v-if="loadingData" :fields="6" />

      <div v-else class="flex flex-col items-start gap-6 lg:flex-row">
        <div class="flex w-full min-w-0 flex-1 flex-col gap-5">
          <!-- 1 · ORIGEN (fijo al editar) -->
          <StepCard step="1" title="Origen">
            <div
              class="flex items-center gap-3 rounded-adm-sm border border-line bg-admin-bg px-3.5 py-2.5"
            >
              <img
                v-if="currentImage"
                :src="currentImage"
                alt=""
                class="h-9 w-13 shrink-0 rounded-md bg-line object-cover"
              />
              <span v-else class="h-9 w-13 shrink-0 rounded-md bg-line" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-adm-base font-bold text-secondary-900">
                  {{ originName || "—" }}
                </p>
                <p class="text-adm-sm text-secondary-400">
                  {{ isLearningPath ? `Línea de carrera · ${courseItems.length} cursos` : "Curso individual" }}
                </p>
              </div>
            </div>
          </StepCard>

          <!-- 2 · DATOS DE LA COHORTE -->
          <StepCard step="2" title="Datos de la cohorte">
            <InputTextCore
              v-model="fields.name.value"
              label="Nombre del programa"
              required
              :invalid="!!errors.name"
              :message-error="errors.name"
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
              />
              <ImageField
                label="Imagen"
                :current="currentImage"
                :hint="
                  currentImage && !image
                    ? 'Se mantiene la imagen actual. Sube una si quieres cambiarla.'
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

            <div
              v-if="classStart"
              class="rounded-adm-sm border border-line-soft bg-admin-bg px-3.5 py-2.5 text-adm-sm text-secondary-500"
            >
              <p>
                La matrícula abre el
                <strong class="text-secondary-900">
                  {{ dayLabel(dayOf(fields.enrollment_start_date.value as string)) }}
                </strong>
                y cierra el
                <strong class="text-secondary-900">
                  {{ dayLabel(dayOf(fields.enrollment_end_date.value as string)) }}
                </strong>.
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
        </div>

        <!-- RESUMEN -->
        <div class="w-full shrink-0 lg:sticky lg:top-5 lg:w-80">
          <ProgramSummary
            :name="String(fields.name.value ?? originName)"
            :items="courseItems"
            :min-students="(fields.min_students.value as number | null) ?? null"
            :max-students="(fields.max_students.value as number | null) ?? null"
            :price="(fields.price.value as number | null) ?? null"
            :currency-symbol="currencySymbol(fields.currency_id.value)"
            :enrollment-start="dayOf(fields.enrollment_start_date.value as string)"
            :enrollment-end="dayOf(fields.enrollment_end_date.value as string)"
            :loading="loading"
            :problems="courseProblems(fields)"
            submit-label="Guardar cambios"
            @submit="submit()"
          />
        </div>
      </div>
    </template>
  </CrudForm>
</template>
