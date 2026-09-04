<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, DatePicketCore } from "@/shared/components";
import ScheduleSelect from "@/modules/admin/components/ui/schedule-select.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import classSessionService from "../services/class-session.service";
import { classSessionSchema } from "../utils/class-session-form";
import type { ClassSessionBodyDTO } from "../dto/class-session.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<ClassSessionBodyDTO>({
  schedule_id: null,
  session_date: null,
  start_time: null,
  end_time: null,
  name: null,
  topic: null,
  meet_link: null,
});

/** Contexto del horario guardado, para preseleccionar programa y curso. */
const offerId = ref<number | null>(null);
const offerCourseId = ref<number | null>(null);

const formSchema = classSessionSchema;

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await classSessionService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  offerId.value = resp.offerId;
  offerCourseId.value = resp.offerCourseId;

  initialValues.value = {
    schedule_id: resp.scheduleId,
    // La fecha cruda: el picker no parsea la formateada del listado.
    session_date: resp.sessionDateRaw,
    start_time: resp.startTime,
    end_time: resp.endTime,
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
        :offer-id="offerId"
        :offer-course-id="offerCourseId"
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