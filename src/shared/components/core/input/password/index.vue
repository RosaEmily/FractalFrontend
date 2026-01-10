<script setup lang="ts">
import { Password } from "primevue";
import type { InputPasswordCoreProps } from "./type";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";

const props = withDefaults(defineProps<InputPasswordCoreProps>(), {
  size: "small",
  pt: () => ({
    root: { class: "w-full" },
    unmaskIcon: { class: " cursor-pointer" },
    maskIcon: { class: " cursor-pointer" },
  }),
  inputClass: "w-full",
  toggleMask: true,
  feedback: false,
});

const model = defineModel<string | null>({
  default: null,
});
</script>
<template>
  <div>
    <LabelCore
      v-if="props.label"
      :text="props.label"
      :html-for="props.inputId"
    />

    <Password v-bind="props" v-model="model" />

    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
