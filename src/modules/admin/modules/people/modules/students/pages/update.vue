<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import {
  AGE_LIMIT,
  birthDateMax,
  birthDateMin,
  isValidBirthDate,
} from "@/modules/admin/constants/age-limits";
import PersonPhotoField from "@/modules/admin/components/ui/person-photo-field.vue";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { numbersOnly } from "@/shared/utils/zod/shortcuts";
import {
  InputTextCore,
  SelectCore,
  DatePicketCore,
} from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import {
  CAREER_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from "@/modules/admin/constants/options";

import studentService from "../services/student.service";
import type { StudentBodyDTO } from "../dto/student.dto";

const route = useRoute();

/** La API identifica al estudiante por document_number, no por id. */
const identifier = ref<string>(String(route.params.id));

/*
 * La foto no es un campo del formulario: vive en `users` y se guarda por su
 * propio endpoint al elegirla. Acá solo se guarda lo necesario para pintarla.
 */
const userId = ref<number | null>(null);
const photoUrl = ref<string | null>(null);
const fullName = ref<string>("");

const initialValues = ref<StudentBodyDTO>({
  document_type: null,
  document_number: null,
  education_level: null,
  career: null,
  other_career: null,
  birth_date: null,
  address: null,
  phone: null,
  is_favorite: false,
});

const formSchema = z.object({
  document_type: z.string({ message: "El tipo de documento es obligatorio" }),
  document_number: withRefinements(
    z
      .string({ message: "El número de documento es obligatorio" })
      .min(6, { message: "Debe tener al menos 6 caracteres" })
      .max(50, { message: "No puede tener más de 50 caracteres" }),
    numbersOnly,
  ),
  education_level: z.string({ message: "El nivel educativo es obligatorio" }),
  career: z.string({ message: "La carrera es obligatoria" }),
  other_career: z.string().max(100).nullable().optional(),
  // El calendario ya bloquea las fechas fuera de rango, pero el input
  // acepta texto: sin esta regla se podría teclear una edad inválida.
  birth_date: z
    .string({ message: "La fecha de nacimiento es obligatoria" })
    .refine(isValidBirthDate, {
      message: `La edad debe estar entre ${AGE_LIMIT.min} y ${AGE_LIMIT.max} años`,
    }),
  address: z.string().max(255).nullable().optional(),
  phone: z
    .string()
    .max(20, { message: "El teléfono es demasiado largo" })
    .nullable()
    .optional(),
  is_favorite: z.boolean().optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await studentService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  userId.value = resp.user_id ?? null;
  photoUrl.value = resp.photo_url ?? null;
  fullName.value = resp.full_name ?? "";

  initialValues.value = {
    document_type: resp.document_type,
    document_number: resp.document_number,
    education_level: resp.education_level,
    career: resp.career,
    other_career: resp.other_career,
    birth_date: resp.birth_date,
    address: resp.address,
    phone: resp.phone,
    // La API lo devuelve como 0/1; el toggle trabaja con boolean.
    is_favorite: Number(resp.is_favorite) === 1,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar Estudiante"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="students.list"
    :service="(body) => studentService.update(identifier, body as never)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <!--
        La foto se guarda sola al elegirla, por `security/users`: el endpoint
        de este formulario no la acepta. Por eso va fuera del flujo de guardado.
      -->
      <PersonPhotoField
        :user-id="userId"
        :current="photoUrl"
        :full-name="fullName"
        @uploaded="photoUrl = $event"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.document_type.value"
          label="Tipo de documento"
          :options="DOCUMENT_TYPE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un tipo"
          :invalid="!!errors.document_type"
          :message-error="errors.document_type"
        />
        <InputTextCore
          v-model="fields.document_number.value"
          label="Número de documento"
          :invalid="!!errors.document_number"
          :message-error="errors.document_number"
          v-keyfilter.numbersOnly
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.education_level.value"
          label="Nivel educativo"
          :options="EDUCATION_LEVEL_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un nivel"
          :invalid="!!errors.education_level"
          :message-error="errors.education_level"
        />
        <SelectCore
          v-model="fields.career.value"
          label="Carrera"
          :options="CAREER_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona una carrera"
          :invalid="!!errors.career"
          :message-error="errors.career"
        />
      </div>

      <!-- La API exige other_career cuando career = other -->
      <InputTextCore
        v-if="fields.career.value === 'other'"
        v-model="fields.other_career.value"
        label="Especifica la carrera"
        :invalid="!!errors.other_career"
        :message-error="errors.other_career"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicketCore
          v-model="fields.birth_date.value"
          label="Fecha de nacimiento"
          dayjs-format-value="YYYY-MM-DD"
          :min-date="birthDateMin()"
          :max-date="birthDateMax()"
          :hint-label="`Entre ${AGE_LIMIT.min} y ${AGE_LIMIT.max} años`"
          :invalid="!!errors.birth_date"
          :message-error="errors.birth_date"
        />
        <InputTextCore
          v-model="fields.phone.value"
          label="Teléfono"
          :invalid="!!errors.phone"
          :message-error="errors.phone"
        />
      </div>

      <InputTextCore
        v-model="fields.address.value"
        label="Dirección"
        :invalid="!!errors.address"
        :message-error="errors.address"
      />

      <!--
        "Destacado" se mostraba en el listado pero no se podía cambiar desde
        ningún formulario, pese a que la API ya lo acepta en el update.
      -->
      <ToggleCheck
        label="Destacado"
        :hint="'Alumno destacado para testimonios u otras secciones de la landing.'"
        :on="!!fields.is_favorite?.value"
        @toggle="fields.is_favorite && (fields.is_favorite.value = $event)"
      />
    </template>
  </CrudForm>
</template>
