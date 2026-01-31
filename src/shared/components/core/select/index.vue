<script setup lang="ts">
import { Select } from "primevue";
import type { SelectCoreProps } from "./type";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import { computed } from "vue";

const propsInit = withDefaults(defineProps<SelectCoreProps>(), {
  size: "small",
});

const model = defineModel<string | null>({
  default: null,
});

const props = computed(() => ({
  ...propsInit,
  size: "small",
}));
</script>
<template>
  <div>
    <LabelCore v-if="props.label" :text="props.label" :html-for="props.name" />
    <Select class="w-full" v-bind="props" v-model="model" />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
