<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, DatePicketCore } from "@/shared/components";
import ScheduleSelect from "@/modules/admin/components/ui/schedule-select.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import classSessionService from "../services/class-session.service";
import type { ClassSessionBodyDTO } from "../dto/class-session.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<ClassSessionBodyDTO>({
  schedule_id: null,
  session_date: null,
  name: null,
  topic: null,
  meet_link: null,
});

const formSchema = z.object({
  schedule_id: z.number({ message: "Selecciona el horario" }),
  session_date: z.string({ message: "La fecha es obligatoria" }),
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  topic: z
    .string({ message: "El tema es obligatorio" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  meet_link: z
    .string()
    .url({ message: "Debe ser una URL válida" })
    .max(255)
    .nullable()
    .optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await classSessionService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  // `schedule_id` no vuelve en el Resource: el select queda para reasignar.
  initialValues.value = {
    ...initialValues.value,
    session_date: resp.sessionDate,
    name: resp.name,
    topic: resp.topic,
    meet_link: resp.meetLink,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar clase"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="classSessions.list"
    :service="(body) => classSessionService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <ScheduleSelect
        v-model="fields.schedule_id.value"
        :invalid="!!errors.schedule_id"
        :message-error="errors.schedule_id"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.name.value"
          label="Nombre de la clase"
          required
          hint-label="Ej: Sesión 1."
          :invalid="!!errors.name"
          :message-error="errors.name"
        />
        <DatePicketCore
          v-model="fields.session_date.value"
          label="Fecha"
          required
          dayjs-format-value="YYYY-MM-DD"
          :invalid="!!errors.session_date"
          :message-error="errors.session_date"
        />
      </div>

      <InputTextCore
        v-model="fields.topic.value"
        label="Tema"
        required
        :invalid="!!errors.topic"
        :message-error="errors.topic"
      />

      <InputTextCore
        v-model="fields.meet_link.value"
        label="Enlace de videollamada"
        hint-label="Meet, Zoom u otro."
        :invalid="!!errors.meet_link"
        :message-error="errors.meet_link"
      />
    </template>
  </CrudForm>
</template>