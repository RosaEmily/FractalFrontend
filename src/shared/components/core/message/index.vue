<script setup lang="ts">
import { Message } from "primevue";
import type { MessageCoreProps } from "./type";

const props = withDefaults(defineProps<MessageCoreProps>(), {
  size: "small",
});
</script>
<template>
  <Message v-bind="props" class="w-full">
    {{ text }}
  </Message>
</template>
