<script setup lang="ts">
/**
 * Fila de horario (`AdmHorarioRow` del diseño): día · inicio · hasta · fin,
 * con la duración en chips debajo. El INICIO es el ancla: cambiar la duración
 * mueve el fin, cambiar el fin recalcula la duración y cambiar el inicio
 * conserva la duración.
 */
import { ref } from "vue";
import {
  SelectCore,
  DatePicketCore,
  InputNumberCore,
  HeroCore,
} from "@/shared/components";
import { mdiClose, mdiContentCopy } from "@mdi/js";
import { DAY_OF_WEEK_OPTIONS } from "../constants/offer.constant";
import type { OfferSchedule } from "../models/offer.model";
import {
  DURATION_PRESETS,
  formatDuration,
  scheduleDuration,
  setScheduleDuration,
  setScheduleEnd,
  setScheduleStart,
} from "../utils/offer-form";

const props = defineProps<{ schedule: OfferSchedule; removable: boolean }>();
const emit = defineEmits<{ copy: []; remove: []; change: [] }>();

/* "Otra" abre el campo en minutos; queda abierto si la duración no es rápida. */
const customOpen = ref(false);
const isCustom = () => {
  const duration = scheduleDuration(props.schedule);
  return customOpen.value || (!!duration && !DURATION_PRESETS.includes(duration));
};

const pick = (minutes: number) => {
  customOpen.value = false;
  setScheduleDuration(props.schedule, minutes);
  emit("change");
};

const setDay = (day: unknown) => {
  props.schedule.dayOfWeek = String(day ?? "");
  emit("change");
};
</script>

<template>
  <div class="flex flex-col gap-2 rounded-adm-sm border border-line-soft bg-admin-bg p-2.5">
    <div class="flex flex-wrap items-center gap-2">
      <SelectCore
        class="w-36"
        :model-value="schedule.dayOfWeek"
        optionLabel="label"
        optionValue="value"
        placeholder="Día"
        :options="DAY_OF_WEEK_OPTIONS"
        @update:model-value="setDay"
      />
      <DatePicketCore
        class="w-28"
        :model-value="schedule.startTime"
        time-only
        hour-format="24"
        :step-minute="15"
        placeholder="Inicio"
        dayjs-format-input="HH:mm"
        dayjs-format-value="HH:mm:ss"
        @update:model-value="
          setScheduleStart(schedule, String($event ?? ''));
          $emit('change');
        "
      />
      <span class="text-adm-sm text-secondary-400">hasta</span>
      <DatePicketCore
        class="w-28"
        :model-value="schedule.endTime"
        time-only
        hour-format="24"
        :step-minute="5"
        placeholder="Fin"
        dayjs-format-input="HH:mm"
        dayjs-format-value="HH:mm:ss"
        @update:model-value="
          setScheduleEnd(schedule, String($event ?? ''));
          $emit('change');
        "
      />
      <div class="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          class="inline-flex cursor-pointer text-secondary-400 hover:text-secondary-900 disabled:cursor-not-allowed disabled:opacity-40"
          title="Copiar a otro día"
          aria-label="Copiar a otro día"
          :disabled="!schedule.dayOfWeek"
          @click="$emit('copy')"
        >
          <HeroCore :path="mdiContentCopy" class="size-4" />
        </button>
        <button
          v-if="removable"
          type="button"
          class="inline-flex cursor-pointer text-secondary-400 hover:text-danger-DEFAULT"
          title="Quitar horario"
          aria-label="Quitar horario"
          @click="$emit('remove')"
        >
          <HeroCore :path="mdiClose" class="size-4" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-1">
      <button
        v-for="minutes in DURATION_PRESETS"
        :key="minutes"
        type="button"
        class="dur-chip"
        :class="{ 'is-active': scheduleDuration(schedule) === minutes && !isCustom() }"
        @click="pick(minutes)"
      >
        {{ formatDuration(minutes) }}
      </button>
      <button
        type="button"
        class="dur-chip"
        :class="{ 'is-active': isCustom() }"
        @click="customOpen = !customOpen"
      >
        Otra
      </button>
      <InputNumberCore
        v-if="isCustom()"
        class="w-28"
        :model-value="scheduleDuration(schedule)"
        :min="5"
        :max="720"
        :step="5"
        suffix=" min"
        @update:model-value="
          setScheduleDuration(schedule, ($event as number | null) ?? null);
          $emit('change');
        "
      />
    </div>
  </div>
</template>

<style scoped>
.dur-chip {
  cursor: pointer;
  padding: 0.375rem 0.625rem;
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-paper);
  color: var(--color-secondary-500);
  font-size: 0.719rem;
  font-weight: 600;
  transition: border-color 0.15s, background 0.15s;
}
.dur-chip:hover {
  border-color: var(--color-secondary-400);
}
.dur-chip.is-active {
  border-color: var(--color-primary-500);
  background: var(--color-accent-soft);
  color: var(--color-primary-600);
}
</style>
