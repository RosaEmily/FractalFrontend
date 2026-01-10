<script setup lang="ts">
import { Button } from "primevue";
import type { ButtonCoreProps } from "./type";

const props = withDefaults(defineProps<ButtonCoreProps>(), {
  size: "small",
});
</script>
<template>
  <Button v-bind="props" class="w-full" />
</template>
