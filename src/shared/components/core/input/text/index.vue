<script setup lang="ts">
import { InputText } from "primevue";
import type { InputTextCoreProps } from "./type";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";

const props = withDefaults(defineProps<InputTextCoreProps>(), {
  size: "small",
});

const model = defineModel<string | null>({
  default: null,
});
</script>
<template>
  <div>
    <LabelCore v-if="props.label" :text="props.label" :html-for="props.name" />
    <InputText class="w-full" v-bind="props" v-model="model" />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
