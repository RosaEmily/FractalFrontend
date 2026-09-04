<script setup lang="ts">
import { InputNumber } from "primevue";
import type { InputNumberCoreProps } from "./type";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";
import { computed } from "vue";

const props = withDefaults(defineProps<InputNumberCoreProps>(), {
  size: "small",
  // Sin agrupación de miles: los códigos ISO y años no se leen como 1.234.
  useGrouping: false,
  // Flechas de incremento en todos los campos numéricos del admin.
  showButtons: true,
  buttonLayout: "stacked",
});

const model = defineModel<number | null>({
  default: null,
});

const messages = computed(() => {
  if (!props.messagesInfo) return [];
  return Array.isArray(props.messagesInfo)
    ? props.messagesInfo
    : [props.messagesInfo];
});
</script>
<template>
  <div>
    <LabelCore
      v-if="props.label"
      :text="props.label"
      :html-for="props.name"
      :required="props.required"
      :hint="props.hintLabel"
    />
    <InputNumber class="w-full" v-bind="props" v-model="model" fluid />
    <MessageCore
      v-for="(msg, index) in messages"
      :key="index"
      :text="msg"
      severity="contrast"
      variant="simple"
      :pt="{
        text: {
          class: '!text-xs text-secondary-800',
        },
      }"
    />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
