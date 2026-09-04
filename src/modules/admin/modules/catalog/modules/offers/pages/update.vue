<script setup lang="ts">
import { z } from "zod";
import {
  InputTextCore,
  InputNumberCore,
  SelectCore,
  DatePicketCore,
} from "@/shared/components";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import OfferCoursesField from "../components/OfferCoursesField.vue";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import { FilterMatchMode } from "@primevue/core";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

import offerService, { toCourseItems } from "../services/offer.service";
import courseService from "../../courses/services/course.service";
import teacherService from "../../teachers/services/teacher.service";
import learningPathService from "../../learning-paths/services/learning-path.service";
import currencyService from "../../currencies/services/currency.service";
import { OFFER_TYPE_OPTIONS } from "../constants/offer.constant";
import { safeRequest } from "@/shared/utils/request";
import { validateCourseItems } from "../utils/offer-form";

import type { Course } from "../../courses/models/course.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import type { OfferCourseItem } from "../models/offer.model";

const activeOnly = {
  filters: { status: { value: 1, matchMode: FilterMatchMode.EQUALS } },
};

const courses = ref<Course[]>([]);
const teachers = ref<Teacher[]>([]);
const courseItems = ref<OfferCourseItem[]>([]);

/*
 * La imagen viaja como `File`: `BaseRepository` detecta el archivo y arma el
 * multipart solo.
 */
const image = ref<File | null>(null);

/** Imagen ya guardada: el campo la muestra hasta que se elija otra. */
const currentImage = ref<string | null>(null);

/** Problemas de la tabla de cursos, calculados al enviar. */
const courseProblems = ref<string[]>([]);

/** El picker necesita un `Date`; el formulario guarda el string de la API. */
const enrollmentStartAsDate = (value: unknown): Date | undefined => {
  if (!value || typeof value !== "string") return undefined;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

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

const selectedType = ref<string | number | null>(null);
const isLearningPath = computed(() => selectedType.value === "learning_path");

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
      message: "La fecha de inicio de matrícula es obligatoria",
    }),
    enrollment_end_date: z.string({
      message: "La fecha de fin de matrícula es obligatoria",
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
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["enrollment_end_date"],
  })
  .refine(
    (data) => data.type !== "learning_path" || !!data.learning_path_id,
    {
      message: "Debe seleccionar la línea de carrera",
      path: ["learning_path_id"],
    },
  );

const onSubmit = (body: Record<string, unknown>) => {
  /*
   * Mismas reglas que al crear (viven en `utils/offer-form`): curso sin
   * repetir, docente sí puede repetirse, fechas coherentes y un día por
   * horario.
   */
  courseProblems.value = validateCourseItems(
    courseItems.value,
    body.enrollment_start_date as string | null,
  );

  if (courseProblems.value.length) {
    return Promise.reject(new Error(courseProblems.value[0]));
  }

  return offerService.update(identifier.value, {
    ...body,
    image_url: image.value,
    courses: toCourseItems(courseItems.value),
  } as never);
};

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const [coursesResp, teachersResp] = await Promise.all([
    safeRequest(() => courseService.all(activeOnly), { showAlert: false }),
    safeRequest(() => teacherService.all(activeOnly), { showAlert: false }),
  ]);
  if (coursesResp.status) courses.value = coursesResp.data ?? [];
  if (teachersResp.status) teachers.value = teachersResp.data ?? [];

  const offer = await offerService.edit(identifier.value);
  loadingStore.finish();
  if (!offer) return;

  selectedType.value = offer.type;
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
  courseItems.value = offer.courseItems ?? [];
  currentImage.value = offer.imageUrl;
});
</script>
<template>
  <CrudForm
    title="Actualizar Programa"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="offers.list"
    :service="onSubmit"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <!-- Mismo orden que al crear: tipo → qué se dicta → nombre → prefijo. -->
      <SelectCore
        v-model="fields.type.value"
        label="Tipo"
        required
        optionLabel="label"
        optionValue="value"
        placeholder="Seleccione el tipo"
        :options="OFFER_TYPE_OPTIONS"
        :invalid="!!errors.type"
        :message-error="errors.type"
        @update:model-value="selectedType = $event"
      />

      <SelectCore
        v-if="isLearningPath"
        v-model="fields.learning_path_id.value"
        label="Línea de carrera"
        required
        hint-label="Define qué cursos y en qué orden trae el programa."
        filter
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccione la línea de carrera"
        :invalid="!!errors.learning_path_id"
        :message-error="errors.learning_path_id"
        autoLoad
        :service="() => learningPathService.all(activeOnly)"
      />

      <InputTextCore
        v-model="fields.name.value"
        label="Nombre del programa"
        required
        :invalid="!!errors.name"
        :message-error="errors.name"
        :messages-info="['Incluye la cohorte, ej: · Cohorte 2026-I']"
      />

      <InputTextCore
        v-model="fields.prefix.value"
        label="Prefijo"
        required
        :invalid="!!errors.prefix"
        :message-error="errors.prefix"
        :messages-info="['Código corto interno.']"
      />

      <div class="grid gap-4 md:grid-cols-2">
        <DatePicketCore
          v-model="fields.enrollment_start_date.value"
          label="Matrícula — inicio"
          required
          dayjs-format-value="YYYY-MM-DD HH:mm:ss"
          dayjs-format-input="DD/MM/YYYY HH:mm"
          :invalid="!!errors.enrollment_start_date"
          :message-error="errors.enrollment_start_date"
        />
        <DatePicketCore
          v-model="fields.enrollment_end_date.value"
          label="Matrícula — fin"
          required
          dayjs-format-value="YYYY-MM-DD HH:mm:ss"
          dayjs-format-input="DD/MM/YYYY HH:mm"
          :min-date="enrollmentStartAsDate(fields.enrollment_start_date.value)"
          :invalid="!!errors.enrollment_end_date"
          :message-error="errors.enrollment_end_date"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-3">
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
          hint-label="No puede ser menor al mínimo"
          :min="1"
          :invalid="!!errors.max_students"
          :message-error="errors.max_students"
        />
        <InputNumberCore
          v-model="fields.price.value"
          label="Precio"
          required
          hint-label="IGV incluido."
          :min="0"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          placeholder="0.00"
          :invalid="!!errors.price"
          :message-error="errors.price"
        />
      </div>

      <SelectCore
        v-model="fields.currency_id.value"
        label="Moneda"
        required
        optionLabel="label"
        optionValue="id"
        placeholder="Seleccione la moneda"
        :invalid="!!errors.currency_id"
        :message-error="errors.currency_id"
        autoLoad
        :service="() => currencyService.all(activeOnly)"
      />

      <ImageField
        label="Imagen"
        hint="JPG, PNG o WEBP. Máximo 500 KB."
        accept="image/jpeg,image/png,image/webp"
        :max-kb="500"
        :current="currentImage"
        @select="(file) => (image = file)"
      />

      <div>
        <p class="mb-2 text-adm-md font-semibold text-secondary-900">
          Cursos, docentes y horarios
        </p>
        <ul
          v-if="courseProblems.length"
          class="mb-3 space-y-1 rounded-adm-md border border-danger-DEFAULT/40 bg-danger-soft px-4 py-3"
        >
          <li
            v-for="problem in courseProblems"
            :key="problem"
            class="text-adm-sm text-danger-DEFAULT"
          >
            {{ problem }}
          </li>
        </ul>

        <!--
          Al EDITAR los cursos sí se pueden tocar: el programa ya existe y puede
          necesitar un curso más. Lo que no se prellena es nada — sobrescribir
          lo guardado con los datos de la línea perdería el trabajo hecho.
        -->
        <OfferCoursesField
          v-model="courseItems"
          :enrollment-start-date="enrollmentStartAsDate(fields.enrollment_start_date.value)"
          :courses="courses"
          :teachers="teachers"
        />
      </div>
    </template>
  </CrudForm>
</template>
