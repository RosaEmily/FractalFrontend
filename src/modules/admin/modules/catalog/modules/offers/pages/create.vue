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
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import { FilterMatchMode } from "@primevue/core";
import { onMounted, ref, computed } from "vue";

import offerService, { toCourseItems } from "../services/offer.service";
import courseService from "../../courses/services/course.service";
import teacherService from "../../teachers/services/teacher.service";
import learningPathService from "../../learning-paths/services/learning-path.service";
import currencyService from "../../currencies/services/currency.service";
import { OFFER_TYPE_OPTIONS } from "../constants/offer.constant";
import { safeRequest } from "@/shared/utils/request";
import {
  buildCourseItem,
  suggestPrefix,
  validateCourseItems,
} from "../utils/offer-form";

import type { Course } from "../../courses/models/course.model";
import type { LearningPath } from "../../learning-paths/models/learning-path.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import type { OfferCourseItem } from "../models/offer.model";

const activeOnly = {
  filters: { status: { value: 1, matchMode: FilterMatchMode.EQUALS } },
};

const courses = ref<Course[]>([]);
const teachers = ref<Teacher[]>([]);
const learningPaths = ref<LearningPath[]>([]);
const courseItems = ref<OfferCourseItem[]>([]);

/*
 * La imagen viaja como `File`: `BaseRepository` detecta el archivo y arma el
 * multipart solo.
 */
const image = ref<File | null>(null);

/*
 * El prefijo se sugiere desde el nombre, pero el admin puede fijarlo a mano.
 * Con el check activo se resincroniza en cada cambio de nombre o de fecha;
 * al desmarcarlo, lo que haya escrito manda y no se vuelve a tocar.
 */
const autoPrefix = ref(true);

/** Problemas de la tabla de cursos, calculados al enviar. */
const courseProblems = ref<string[]>([]);

/** Curso elegido cuando el programa es de un solo curso. */
const singleCourseId = ref<number | null>(null);

/** El picker necesita un `Date`; el formulario guarda el string de la API. */
const enrollmentStartAsDate = (value: unknown): Date | undefined => {
  if (!value || typeof value !== "string") return undefined;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const initialValues = {
  name: null,
  prefix: null,
  type: null,
  learning_path_id: null,
  enrollment_start_date: null,
  enrollment_end_date: null,
  min_students: null,
  max_students: null,
  price: null,
  currency_id: null,
};

const selectedType = ref<string | number | null>(null);
const isLearningPath = computed(() => selectedType.value === "learning_path");
const isSingleCourse = computed(() => selectedType.value === "course");

/**
 * Rellena el formulario desde la línea de carrera elegida.
 *
 * La línea ya define nombre, precio, moneda **y qué cursos trae en qué orden**,
 * así que reescribirlos a mano sería copiar datos que el sistema ya tiene. Todo
 * queda editable: es un punto de partida, no una imposición.
 *
 * Los cursos se cargan con docente y horario VACÍOS: eso es justo lo que la
 * cohorte aporta y la línea no puede saber.
 */
type Fields = Record<string, { value: unknown }>;

const syncPrefix = (name: unknown, startDate: unknown, fields: Fields) => {
  if (!autoPrefix.value) return;
  fields.prefix!.value = suggestPrefix(
    String(name ?? ""),
    startDate as string | null,
  );
};

/**
 * Cambio de tipo: limpia lo que pertenecía al tipo anterior.
 *
 * Sin esto, pasar de línea a curso suelto dejaba los 5 cursos de la línea en la
 * tabla y el `learning_path_id` puesto — el programa se guardaba mezclado.
 */
const onTypeChange = (type: unknown, fields: Fields) => {
  selectedType.value = type as string | null;

  courseItems.value = [];
  courseProblems.value = [];
  singleCourseId.value = null;
  fields.learning_path_id!.value = null;
};

const applyLearningPath = (pathId: unknown, fields: Fields) => {
  const path = learningPaths.value.find((item) => item.id === Number(pathId));
  if (!path) return;

  fields.name!.value = path.name;
  fields.price!.value = path.priceRaw;
  fields.currency_id!.value = path.currencyId;

  courseItems.value = path.courseItems.map((course) =>
    buildCourseItem(course.courseId, course.name),
  );

  syncPrefix(path.name, fields.enrollment_start_date!.value, fields);
};

/** Igual que arriba, pero para un curso suelto: el programa trae ese y nada más. */
const applySingleCourse = (courseId: unknown, fields: Fields) => {
  const course = courses.value.find((item) => item.id === Number(courseId));
  if (!course) return;

  fields.name!.value = course.name;
  fields.price!.value = course.priceRaw;
  fields.currency_id!.value = course.currencyId;

  courseItems.value = [buildCourseItem(course.id, course.name)];

  syncPrefix(course.name, fields.enrollment_start_date!.value, fields);
};

/**
 * Resincroniza el prefijo mientras el check esté activo.
 *
 * Se llama al cambiar el nombre y al cambiar la fecha de matrícula, porque el
 * año del prefijo sale de ahí.
 */

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
   * Los cursos van en un `ref` aparte —CrudForm no maneja shapes anidados—, así
   * que su validación se dispara acá y no en el esquema de Zod. Se listan TODOS
   * los problemas: con varios cursos y horarios, avisar de uno por intento es
   * tiempo perdido.
   */
  courseProblems.value = validateCourseItems(
    courseItems.value,
    body.enrollment_start_date as string | null,
  );

  if (courseProblems.value.length) {
    return Promise.reject(new Error(courseProblems.value[0]));
  }

  return offerService.create({
    ...body,
    image_url: image.value,
    courses: toCourseItems(courseItems.value),
  } as never);
};

onMounted(async () => {
  // Las líneas se cargan acá y no solo en su select: el prellenado necesita
  // sus precios y sus cursos, no únicamente el nombre de la opción elegida.
  const [coursesResp, teachersResp, pathsResp] = await Promise.all([
    safeRequest(() => courseService.all(activeOnly), { showAlert: false }),
    safeRequest(() => teacherService.all(activeOnly), { showAlert: false }),
    safeRequest(() => learningPathService.all(activeOnly), { showAlert: false }),
  ]);
  if (coursesResp.status) courses.value = coursesResp.data ?? [];
  if (teachersResp.status) teachers.value = teachersResp.data ?? [];
  if (pathsResp.status) learningPaths.value = pathsResp.data ?? [];
});
</script>
<template>
  <CrudForm
    title="Crear Programa"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="offers.list"
    :service="onSubmit"
  >
    <template #default="{ fields, errors }">
      <!--
        El tipo va PRIMERO: decide si lo siguiente es una línea de carrera o un
        curso suelto, y de esa elección salen ya el nombre, el precio y la
        moneda. Pedir el nombre antes obligaba a escribirlo para que el
        prellenado lo sobrescribiera un paso después.
      -->
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
        @update:model-value="onTypeChange($event, fields)"
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
        :options="learningPaths"
        @update:model-value="applyLearningPath($event, fields)"
      />

      <!--
        Curso suelto: el programa trae ESE curso y nada más, así que se elige
        acá y la tabla de abajo se genera con él. No hay "agregar curso".
      -->
      <SelectCore
        v-if="isSingleCourse"
        v-model="singleCourseId"
        label="Curso"
        required
        hint-label="El programa se abre para este curso."
        filter
        filter-placeholder="Buscar curso…"
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccione el curso"
        :options="courses"
        @update:model-value="applySingleCourse($event, fields)"
      />

      <InputTextCore
        v-model="fields.name.value"
        label="Nombre del programa"
        required
        :invalid="!!errors.name"
        :message-error="errors.name"
        :messages-info="['Incluye la cohorte, ej: · Cohorte 2026-I']"
        @update:model-value="syncPrefix($event, fields.enrollment_start_date.value, fields)"
      />

      <div>
        <InputTextCore
          v-model="fields.prefix.value"
          label="Prefijo"
          required
          :disabled="autoPrefix"
          :invalid="!!errors.prefix"
          :message-error="errors.prefix"
          :messages-info="['Código corto interno.']"
        />
        <!--
          Con el check activo el campo queda bloqueado y sigue al nombre; al
          desmarcarlo se habilita y lo que el admin escriba manda.
        -->
        <ToggleCheck
          class="mt-2"
          label="Generar automáticamente"
          :hint="autoPrefix ? 'Sigue al nombre del programa' : 'Lo defines tú'"
          :on="autoPrefix"
          @toggle="
            autoPrefix = $event;
            $event && syncPrefix(fields.name.value, fields.enrollment_start_date.value, fields);
          "
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <DatePicketCore
          v-model="fields.enrollment_start_date.value"
          label="Matrícula — inicio"
          required
          dayjs-format-value="YYYY-MM-DD HH:mm:ss"
          dayjs-format-input="DD/MM/YYYY HH:mm"
          :invalid="!!errors.enrollment_start_date"
          :message-error="errors.enrollment_start_date"
          @update:model-value="syncPrefix(fields.name.value, $event, fields)"
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
        @select="(file) => (image = file)"
      />

      <div>
        <p class="mb-2 text-adm-md font-semibold text-secondary-900">
          Cursos, docentes y horarios
        </p>
        <!--
          Los problemas se listan TODOS: con varios cursos y horarios, avisar
          de uno por intento obliga a reenviar el formulario N veces.
        -->
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

        <OfferCoursesField
          v-model="courseItems"
          :courses="courses"
          :teachers="teachers"
          :lock-courses="true"
          :enrollment-start-date="enrollmentStartAsDate(fields.enrollment_start_date.value)"
        />
      </div>
    </template>
  </CrudForm>
</template>
