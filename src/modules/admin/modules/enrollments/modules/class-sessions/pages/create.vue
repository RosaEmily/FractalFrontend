<script setup lang="ts">
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, DatePicketCore } from "@/shared/components";
import ScheduleSelect from "@/modules/admin/components/ui/schedule-select.vue";
import classSessionService from "../services/class-session.service";
import { classSessionSchema } from "../utils/class-session-form";
import type { ClassSessionBodyDTO } from "../dto/class-session.dto";

const initialValues = ref<ClassSessionBodyDTO>({
  schedule_id: null,
  session_date: null,
  start_time: null,
  end_time: null,
  name: null,
  topic: null,
  meet_link: null,
});

const formSchema = classSessionSchema;
</script>

<template>
  <CrudForm
    title="Programar clase"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="classSessions.list"
    :service="(body) => classSessionService.create(body)"
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

      <!--
        Horas opcionales: si se dejan vacías, la clase hereda el rango del
        horario semanal. El cronograma del aula omite del calendario las clases
        sin hora, así que cargarlas acá es lo que las hace aparecer.
      -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicketCore
          v-model="fields.start_time.value"
          label="Hora de inicio"
          hint-label="Opcional · toma la del horario si se deja vacía."
          time-only
          hour-format="24"
          dayjs-format-input="HH:mm:ss"
          dayjs-format-value="HH:mm:ss"
          :invalid="!!errors.start_time"
          :message-error="errors.start_time"
        />
        <DatePicketCore
          v-model="fields.end_time.value"
          label="Hora de fin"
          time-only
          hour-format="24"
          dayjs-format-input="HH:mm:ss"
          dayjs-format-value="HH:mm:ss"
          :invalid="!!errors.end_time"
          :message-error="errors.end_time"
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
