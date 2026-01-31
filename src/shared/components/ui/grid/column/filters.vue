<script setup lang="ts">
import InputCore from "@/shared/components/core/input/text/index.vue";
import SelectCore from "@/shared/components/core/select/index.vue";
import DatePickerCore from "@/shared/components/core/datepicker/index.vue";

import type { FilterConfig } from "./type";

withDefaults(defineProps<{ config?: FilterConfig }>(), {
  config: () => ({
    component: "input",
  }),
});

const model = defineModel({
  default: null,
});
</script>
<template>
  <InputCore
    v-model="model"
    v-bind="config.inputProps"
    v-if="config.component === 'input'"
  />
  <SelectCore
    v-model="model"
    v-bind="config.selectProps"
    v-if="config.component === 'select'"
  />
  <DatePickerCore
    v-model="model"
    v-bind="config.datepickerProps"
    v-if="config.component === 'datepicker'"
  />
</template>
