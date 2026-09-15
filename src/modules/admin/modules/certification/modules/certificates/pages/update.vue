<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, SelectCore, DatePicketCore } from "@/shared/components";
import EnrollmentCourseSelect from "@/modules/admin/components/ui/enrollment-course-select.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import certificateService from "../services/certificate.service";
import templateService from "../../templates/services/template.service";
import type { CertificateBodyDTO } from "../dto/certificate.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<CertificateBodyDTO>({
  enrollment_course_id: null,
  certificate_template_id: null,
  code: null,
  issued_date: null,
});

const formSchema = z.object({
  enrollment_course_id: z.number({
    message: "Selecciona el curso de la matrícula",
  }),
  certificate_template_id: z.number({ message: "Selecciona la plantilla" }),
  code: z
    .string({ message: "El código es obligatorio" })
    .min(4, { message: "Debe tener al menos 4 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  issued_date: z.string().nullable().optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await certificateService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    enrollment_course_id: resp.enrollmentCourseId,
    certificate_template_id: resp.certificateTemplateId,
    code: resp.code,
    issued_date: resp.issuedDate,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar certificado"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="certificates.list"
    :service="(body) => certificateService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <EnrollmentCourseSelect
        v-model="fields.enrollment_course_id.value"
        :invalid="!!errors.enrollment_course_id"
        :message-error="errors.enrollment_course_id"
      />

      <SelectCore
        v-model="fields.certificate_template_id.value"
        label="Plantilla"
        required
        option-label="name"
        option-value="id"
        placeholder="Selecciona una plantilla"
        :service="() => templateService.all()"
        auto-load
        :invalid="!!errors.certificate_template_id"
        :message-error="errors.certificate_template_id"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.code.value"
          label="Código"
          required
          hint-label="Identificador único y verificable."
          :invalid="!!errors.code"
          :message-error="errors.code"
        />
        <DatePicketCore
          v-model="fields.issued_date.value"
          label="Fecha de emisión"
          dayjs-format-value="YYYY-MM-DD"
          :invalid="!!errors.issued_date"
          :message-error="errors.issued_date"
        />
      </div>
    </template>
  </CrudForm>
</template>