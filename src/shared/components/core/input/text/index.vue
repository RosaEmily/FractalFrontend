<script setup lang="ts">
import { InputText } from "primevue";
import type { InputTextCoreProps } from "./type";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";
import { computed } from "vue";

const props = withDefaults(defineProps<InputTextCoreProps>(), {
  size: "small",
});

const model = defineModel<string | null>({
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
    <InputText v-trim class="w-full" v-bind="props" v-model="model" />
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
