<script setup lang="ts">
import { z } from "zod";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import PersonPhotoField from "@/modules/admin/components/ui/person-photo-field.vue";
import {
  InputTextCore,
  InputNumberCore,
  SelectCore,
  TextAreaCore,
} from "@/shared/components";
import {
  ACADEMIC_DEGREE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from "@/modules/admin/constants/options";
import { EXPERIENCE_YEARS_LIMIT } from "@/modules/admin/constants/numeric-limits";
import {
  getDocumentRule,
  PHONE_PE,
} from "@/modules/admin/constants/documents";
import {
  documentNumberSchema,
  phoneSchema,
} from "@/modules/admin/utils/document-schema";

import teacherService from "../services/teacher.service";
import type { TeacherBodyDTO } from "../dto/teacher.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

/*
 * La foto no es un campo del formulario: vive en `users` y se guarda por su
 * propio endpoint al elegirla. Acá solo se guarda lo necesario para pintarla.
 */
const userId = ref<number | null>(null);
const photoUrl = ref<string | null>(null);
const fullName = ref<string>("");

const initialValues = ref<TeacherBodyDTO>({
  document_type: null,
  document_number: null,
  specialty: null,
  experience_years: null,
  description: null,
  academic_degree: null,
  other_academic_degree: null,
  phone: null,
  is_favorite: false,
});

/*
 * El tipo de documento elegido. Se sigue aparte de `CrudForm` porque de él
 * dependen la longitud válida, el tope de caracteres y el texto de ayuda.
 */
const documentType = ref<string | null>(null);
const documentRule = computed(() => getDocumentRule(documentType.value));

const formSchema = z.object({
  document_type: z.string({ message: "El tipo de documento es obligatorio" }),
  document_number: documentNumberSchema(documentType.value),

  phone: phoneSchema(),
  is_favorite: z.boolean().optional(),
});

const loadingData = ref<boolean>(true);

onMounted(async () => {
  const resp = await teacherService.edit(identifier.value);
  loadingData.value = false;
  if (!resp) return;

  userId.value = resp.user_id ?? null;
  photoUrl.value = resp.photo_url ?? null;
  fullName.value = resp.full_name ?? "";

  initialValues.value = {
    document_type: resp.document_type,
    document_number: resp.document_number,
    specialty: resp.specialty,
    experience_years: resp.experience_years,
    description: resp.description,
    academic_degree: resp.academic_degree,
    other_academic_degree: resp.other_academic_degree,
    phone: resp.phone,
    // La API lo devuelve como 0/1; el toggle trabaja con boolean.
    is_favorite: Number(resp.is_favorite) === 1,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar Instructor"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="teachers.list"
    :service="(body) => teacherService.update(identifier, body as never)"
    :loading-data="loadingData"
    :skeleton-fields="6"
    skeleton-textarea
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
          @update:model-value="documentType = ($event as string) ?? null"
        />
        <InputTextCore
          v-model="fields.document_number.value"
          label="Número de documento"
          :hint-label="documentRule.hint"
          :maxlength="documentRule.length ?? documentRule.max"
          :invalid="!!errors.document_number"
          :message-error="errors.document_number"
          v-keyfilter="documentRule.numericOnly ? /^\d+$/ : /^[A-Za-z0-9]+$/"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.specialty.value"
          label="Especialidad"
          :invalid="!!errors.specialty"
          :message-error="errors.specialty"
        />
        <InputNumberCore
          v-model="fields.experience_years.value"
          label="Años de experiencia"
          :min="EXPERIENCE_YEARS_LIMIT.min"
          :max="EXPERIENCE_YEARS_LIMIT.max"
          :invalid="!!errors.experience_years"
          :message-error="errors.experience_years"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.academic_degree.value"
          label="Título académico"
          :options="ACADEMIC_DEGREE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un título"
          :invalid="!!errors.academic_degree"
          :message-error="errors.academic_degree"
        />
        <InputTextCore
          v-model="fields.phone.value"
          label="Teléfono"
          :hint-label="PHONE_PE.hint"
          :maxlength="PHONE_PE.length"
          :invalid="!!errors.phone"
          :message-error="errors.phone"
          v-keyfilter.numbersOnly
        />
      </div>

      <!-- La API exige other_academic_degree cuando el título es "other". -->
      <InputTextCore
        v-if="fields.academic_degree.value === 'other'"
        v-model="fields.other_academic_degree.value"
        label="Especifica el título académico"
        :invalid="!!errors.other_academic_degree"
        :message-error="errors.other_academic_degree"
      />

      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :rows="4"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />

      <!--
        "Destacado" se mostraba en el listado pero no se podía cambiar desde
        ningún formulario, pese a que la API ya lo acepta en el update.
      -->
      <ToggleCheck
        label="Destacado"
        hint="Aparece primero en la grilla de instructores de la landing."
        :on="!!fields.is_favorite?.value"
        @toggle="fields.is_favorite && (fields.is_favorite.value = $event)"
      />
    </template>
  </CrudForm>
</template>
