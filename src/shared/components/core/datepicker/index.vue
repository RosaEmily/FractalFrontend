<script setup lang="ts">
import { DatePicker } from "primevue";
import type { DatePickerCoreProps } from "./type";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import { computed, ref } from "vue";
import { dayjsToPrime, parseDate, serializeDate } from "./utils";

const propsInit = withDefaults(defineProps<DatePickerCoreProps>(), {
  size: "small",
});

const model = defineModel<string | (string | null)[] | null>({
  default: null,
});

const props = computed(() => {
  const dayjsFormatInput = propsInit.dayjsFormatInput ?? "DD/MM/YYYY";
  const dayjsFormatValue = propsInit.dayjsFormatValue ?? "YYYY-MM-DD";
  return {
    ...propsInit,
    defaultValue: new Date(),
    dayjsFormatInput,
    dayjsFormatValue,
    size: "small",
    autoZIndex: true,
    showOnFocus: true,
    showOtherMonths: true,
    dateFormat: dayjsToPrime(dayjsFormatInput),
    /*
     * El reloj se deduce del formato de VALOR, pero la prop explícita manda:
     * una columna `dateTime` obliga a guardar la hora aunque al usuario no se
     * le pida elegirla (un rango de matrícula se define por días).
     */
    showTime: propsInit.showTime ?? /H|m|s/.test(dayjsFormatValue),
    showSeconds: propsInit.showSeconds ?? /s/.test(dayjsFormatValue),
  };
});

const internalModel = computed<Date | (Date | null)[] | null>({
  get() {
    const { dayjsFormatValue, dateUtc, selectionMode } = props.value;
    const parsed = parseDate(model.value, dayjsFormatValue, dateUtc);
    if (
      (!parsed && selectionMode === "range") ||
      selectionMode === "multiple"
    ) {
      return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
    }
    return parsed;
  },
  set(value) {
    const { dayjsFormatValue, dateUtc } = props.value;
    model.value = serializeDate(value, dayjsFormatValue, dateUtc);
  },
});

/*
 * PrimeVue deshabilita los DÍAS anteriores a `minDate`, pero la flecha de
 * retroceso sigue activa y lleva a meses donde no se puede elegir nada. Se
 * apaga leyendo el mes que muestra el propio DatePicker (`currentMonth`,
 * `currentYear` y `currentView` son su estado interno), no uno llevado aparte:
 * el componente reposiciona la vista al cambiar el valor sin emitir eventos.
 */
const picker = ref<{ currentMonth: number; currentYear: number; currentView: string } | null>(null);
const prevDisabled = computed(() => {
  const min = propsInit.minDate;
  const view = picker.value;
  if (!min || !view) return false;
  const minYear = min.getFullYear();
  if (view.currentView === "year") return view.currentYear - (view.currentYear % 10) <= minYear;
  if (view.currentView === "month") return view.currentYear <= minYear;
  return view.currentYear * 12 + view.currentMonth <= minYear * 12 + min.getMonth();
});
const pt = computed(() => ({
  ...(propsInit.pt as object | undefined),
  pcPrevButton: { root: { disabled: prevDisabled.value } },
}));
</script>

<template>
  <div>
    <LabelCore
      v-if="props.label"
      :text="props.label"
      :html-for="props.name || props.inputId"
      :required="props.required"
      :hint="props.hintLabel"
    />
    <DatePicker ref="picker" class="w-full" v-bind="props" :pt="pt" v-model="internalModel" />
    <MessageCore
      v-if="props.messageError"
      :text="props.messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
