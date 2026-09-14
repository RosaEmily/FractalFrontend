<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import CreateBulk from "./create-bulk.vue";
import { SelectCore, DatePicketCore } from "@/shared/components";
import EnrollmentCourseSelect from "@/modules/admin/components/ui/enrollment-course-select.vue";
import certificateService from "../services/certificate.service";
import templateService from "../../templates/services/template.service";
import type { CertificateBodyDTO } from "../dto/certificate.dto";

const initialValues = ref<CertificateBodyDTO>({
  enrollment_course_id: null,
  certificate_template_id: null,
  issued_date: null,
});

/* Individual / Masivo comparten la ruta `create`: son formularios distintos. */
const MODE_OPTIONS = [
  { value: "individual", label: "Un estudiante" },
  { value: "bulk", label: "Varios estudiantes" },
];

const mode = ref<string>("individual");

const formSchema = z.object({
  enrollment_course_id: z.number({
    message: "Selecciona el curso de la matrícula",
  }),
  certificate_template_id: z.number({ message: "Selecciona la plantilla" }),
  issued_date: z.string().nullable().optional(),
});
</script>

<template>
  <CreateBulk v-if="mode === 'bulk'" v-model:mode="mode" />

  <CrudForm
    v-else
    title="Emitir certificado"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="certificates.list"
    :service="(body) => certificateService.create(body)"
  >
    <template #default="{ fields, errors }">
      <ModeToggle v-model="mode" :options="MODE_OPTIONS" />

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

      <!--
        Sin campo Código: lo genera el servidor al emitir. Ver el DTO.
      -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
