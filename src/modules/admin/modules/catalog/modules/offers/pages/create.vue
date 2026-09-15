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
  enrollmentStartAsDate,
  validateCourseItems,
  withTime,
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
 * Imagen heredada de la línea de carrera o del curso elegido.
 *
 * Es la URL que ya está en S3, no un archivo: si el admin no sube una propia,
 * se reenvía tal cual y el programa reusa la misma imagen en vez de duplicar
 * el archivo. `OfferController` solo sube cuando recibe un `UploadedFile`, así
 * que un string se guarda directo.
 */
const inheritedImage = ref<string | null>(null);

/*
 * Matrícula como RANGO (`selectionMode="range"` de PrimeVue).
 *
 * El diseño lo trata como un solo campo (`AdmDateRange`) y elegir ambas fechas
 * en el mismo calendario **elimina por construcción** el error de poner un fin
 * anterior al inicio: el picker no deja marcarlo.
 *
 * La API sigue recibiendo `enrollment_start_date` y `enrollment_end_date` por
 * separado, así que el rango se parte al sincronizar.
 */
const enrollmentRange = ref<(string | null)[] | null>(null);

/*
 * Horas de apertura y cierre de la matrícula.
 *
 * Van aparte del rango porque PrimeVue usa **un solo reloj para todo el
 * rango**: elegir la hora ahí dejaría inicio y fin con el mismo valor. Se
 * autollenan con el día completo (`00:00:00` – `23:59:59`), que es lo que
 * quiere decir "del 5 al 11": desde que abre el día 5 hasta que acaba el 11.
 * Ambas quedan editables por si la matrícula abre o cierra a una hora concreta.
 */
const enrollmentStartTime = ref<string>("00:00:00");
const enrollmentEndTime = ref<string>("23:59:59");

/*
 * El prefijo se sugiere desde el nombre, pero el admin puede fijarlo a mano.
 * Con el check activo se resincroniza en cada cambio de nombre o de fecha;
 * al desmarcarlo, lo que haya escrito manda y no se vuelve a tocar.
 */
const autoPrefix = ref(true);

/** Problemas de la tabla de cursos, calculados al enviar. */
/*
 * Problemas de los cursos y horarios, EN VIVO.
 *
 * Antes solo se calculaban en el submit: había que llenar el formulario entero
 * para enterarse de que una hora de fin era anterior a la de inicio. Como
 * `computed`, la lista se rehace en cuanto cambia cualquier fila
 * ([[fractalfrontend-evitar-watch]]: computed antes que watch).
 *
 * `touchedCourses` evita gritar antes de tiempo: los avisos aparecen cuando ya
 * se tocó algo, no sobre el formulario recién abierto.
 */
const touchedCourses = ref(false);

const courseProblems = computed<string[]>(() =>
  touchedCourses.value
    ? validateCourseItems(courseItems.value, enrollmentRange.value?.[0] ?? null)
    : [],
);

/*
 * Ventana del calendario de matrícula: 60 días hacia atrás y 60 hacia
 * adelante.
 *
 * Hacia atrás, para registrar una cohorte cuya matrícula ya abrió; hacia
 * adelante, para programar las próximas. Fuera de esa ventana casi siempre es
 * un error de tipeo en el año, y el picker lo impide en vez de dejar guardar
 * una fecha absurda.
 *
 * Se calculan una vez al montar: el formulario no vive abierto días enteros.
 */
const ENROLLMENT_WINDOW_DAYS = 60;

const shiftDays = (days: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const enrollmentMinDate = shiftDays(-ENROLLMENT_WINDOW_DAYS);
const enrollmentMaxDate = shiftDays(ENROLLMENT_WINDOW_DAYS);

/** Curso elegido cuando el programa es de un solo curso. */
const singleCourseId = ref<number | null>(null);

/** El picker necesita un `Date`; el formulario guarda el string de la API. */
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
/** Junta el día del rango con su hora: `2026-09-05` + `08:00:00`. */
/**
 * Escribe en los dos campos que espera la API a partir del rango y las horas.
 *
 * Se llama tanto al elegir las fechas como al cambiar cualquiera de las horas:
 * el valor final es siempre día + hora.
 */
const syncEnrollmentRange = (fields: Fields, value?: unknown) => {
  if (value !== undefined) {
    enrollmentRange.value = Array.isArray(value)
      ? (value as (string | null)[])
      : null;
  }

  const range = enrollmentRange.value ?? [];
  fields.enrollment_start_date!.value = withTime(
    range[0],
    enrollmentStartTime.value,
  );
  fields.enrollment_end_date!.value = withTime(
    range[1],
    enrollmentEndTime.value,
  );

  // El prefijo lleva el año de inicio de matrícula.
  syncPrefix(fields.name!.value, range[0] ?? null, fields);
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
  // Cambiar de tipo vacía la tabla: los avisos vuelven a callarse.
  touchedCourses.value = false;
  singleCourseId.value = null;
  fields.learning_path_id!.value = null;
  inheritedImage.value = null;
  image.value = null;
};

const applyLearningPath = (pathId: unknown, fields: Fields) => {
  const path = learningPaths.value.find((item) => item.id === Number(pathId));
  if (!path) return;

  fields.name!.value = path.name;
  fields.price!.value = path.priceRaw;
  fields.currency_id!.value = path.currencyId;

  inheritedImage.value = path.imageUrl ?? null;

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

  inheritedImage.value = course.imageUrl ?? null;

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
  .refine((data) => data.type !== "learning_path" || !!data.learning_path_id, {
    message: "Debe seleccionar la línea de carrera",
    path: ["learning_path_id"],
  });

const onSubmit = (body: Record<string, unknown>) => {
  /*
   * Los cursos van en un `ref` aparte —CrudForm no maneja shapes anidados—, así
   * que su validación se dispara acá y no en el esquema de Zod. Se listan TODOS
   * los problemas: con varios cursos y horarios, avisar de uno por intento es
   * tiempo perdido.
   */
  // Al enviar se revalida contra la fecha real del body y se fuerza que los
  // avisos sean visibles aunque no se haya tocado la tabla.
  touchedCourses.value = true;
  const problems = validateCourseItems(
    courseItems.value,
    body.enrollment_start_date as string | null,
  );

  if (problems.length) {
    return Promise.reject(new Error(problems[0]));
  }

  return offerService.create({
    ...body,
    // El archivo propio manda; si no hay, viaja la URL heredada.
    image_url: image.value ?? inheritedImage.value,
    courses: toCourseItems(courseItems.value),
  } as never);
};

onMounted(async () => {
  // Las líneas se cargan acá y no solo en su select: el prellenado necesita
  // sus precios y sus cursos, no únicamente el nombre de la opción elegida.
  const [coursesResp, teachersResp, pathsResp] = await Promise.all([
    safeRequest(() => courseService.all(activeOnly), { showAlert: false }),
    safeRequest(() => teacherService.all(activeOnly), { showAlert: false }),
    safeRequest(() => learningPathService.all(activeOnly), {
      showAlert: false,
    }),
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
        @update:model-value="
          syncPrefix($event, fields.enrollment_start_date.value, fields)
        "
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
          Con el check activo el campo queda bloqueado y se arma solo; al
          desmarcarlo se habilita y lo que el admin escriba manda.

          ⚠️ El prefijo depende del nombre Y del año de matrícula, así que se
          recalcula desde los dos campos: escribir el nombre antes de poner la
          fecha —el orden natural del formulario— dejaba el prefijo sin año y
          nada lo volvía a tocar.
        -->
        <ToggleCheck
          class="mt-2"
          label="Generar automáticamente"
          :hint="
            autoPrefix
              ? 'Siglas del nombre + año de matrícula'
              : 'Lo defines tú'
          "
          :on="autoPrefix"
          @toggle="
            autoPrefix = $event;
            $event &&
              syncPrefix(
                fields.name.value,
                fields.enrollment_start_date.value,
                fields,
              );
          "
        />
      </div>

      <!--
        Matrícula como un solo campo de RANGO: el picker no deja elegir un fin
        anterior al inicio, así que ese error deja de existir en vez de tener
        que validarse. Se parte en los dos campos que espera la API.
      -->
      <div class="grid gap-4 md:grid-cols-[1.6fr_1fr_1fr]">
        <DatePicketCore
          v-model="enrollmentRange"
          label="Matrícula"
          required
          hint-label="Hasta 60 días antes o después de hoy."
          selection-mode="range"
          :number-of-months="2"
          :min-date="enrollmentMinDate"
          :max-date="enrollmentMaxDate"
          dayjs-format-value="YYYY-MM-DD"
          dayjs-format-input="DD/MM/YYYY"
          :show-time="false"
          :invalid="
            !!errors.enrollment_start_date || !!errors.enrollment_end_date
          "
          :message-error="
            errors.enrollment_start_date || errors.enrollment_end_date
          "
          @update:model-value="syncEnrollmentRange(fields, $event)"
        />
        <!--
          Las horas van aparte: el rango de PrimeVue usa UN solo reloj para los
          dos extremos, así que ahí no se pueden fijar por separado. Vienen con
          el día completo y se editan solo si hace falta.
        -->
        <DatePicketCore
          v-model="enrollmentStartTime"
          label="Hora de apertura"
          hint-label="Por defecto, al inicio del día."
          time-only
          hour-format="24"
          dayjs-format-value="HH:mm:ss"
          dayjs-format-input="HH:mm"
          @update:model-value="syncEnrollmentRange(fields)"
        />
        <DatePicketCore
          v-model="enrollmentEndTime"
          label="Hora de cierre"
          hint-label="Por defecto, al final del día."
          time-only
          hour-format="24"
          dayjs-format-value="HH:mm:ss"
          dayjs-format-input="HH:mm"
          @update:model-value="syncEnrollmentRange(fields)"
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
        <!-- `:min` atado al cupo mínimo: el valor inválido deja de poder escribirse. -->
        <InputNumberCore
          v-model="fields.max_students.value"
          label="Cupo máximo"
          required
          hint-label="No puede ser menor al mínimo"
          :min="Number(fields.min_students.value) || 1"
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
        :current="inheritedImage"
        :hint="
          inheritedImage && !image
            ? 'Se reusará la imagen del origen. Sube una si quieres cambiarla.'
            : 'JPG, PNG o WEBP. Máximo 500 KB.'
        "
        accept="image/jpeg,image/png,image/webp"
        :max-kb="500"
        @select="(file) => (image = file)"
        @clear="image = null"
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
          @update:model-value="touchedCourses = true"
          :courses="courses"
          :teachers="teachers"
          :lock-courses="true"
          :enrollment-start-date="
            enrollmentStartAsDate(fields.enrollment_start_date.value)
          "
        />
      </div>
    </template>
  </CrudForm>
</template>
