<script setup lang="ts">
import { DatePicker } from "primevue";
import type { DatePickerCoreProps } from "./type";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import { computed } from "vue";
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
    showTime: /H|m|s/.test(dayjsFormatValue),
    showSeconds: /s/.test(dayjsFormatValue),
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
    <DatePicker class="w-full" v-bind="props" v-model="internalModel" />
    <MessageCore
      v-if="props.messageError"
      :text="props.messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
