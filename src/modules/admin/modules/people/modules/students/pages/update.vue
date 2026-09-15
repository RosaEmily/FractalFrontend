<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
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

const initialValues = ref<StudentBodyDTO>({
  document_type: null,
  document_number: null,
  education_level: null,
  career: null,
  other_career: null,
  birth_date: null,
  address: null,
  phone: null,
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
  birth_date: z.string({ message: "La fecha de nacimiento es obligatoria" }),
  address: z.string().max(255).nullable().optional(),
  phone: z
    .string()
    .max(20, { message: "El teléfono es demasiado largo" })
    .nullable()
    .optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await studentService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    document_type: resp.document_type,
    document_number: resp.document_number,
    education_level: resp.education_level,
    career: resp.career,
    other_career: resp.other_career,
    birth_date: resp.birth_date,
    address: resp.address,
    phone: resp.phone,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar Estudiante"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="students.list"
    :service="(body) => studentService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
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
    </template>
  </CrudForm>
</template>
