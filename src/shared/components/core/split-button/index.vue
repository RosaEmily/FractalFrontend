<script setup lang="ts">
import SplitButton from "primevue/splitbutton";
import type { SplitButtonCoreProps } from "./type";
const props = withDefaults(defineProps<SplitButtonCoreProps>(), {
  size: "small",
});
</script>
<template>
  <SplitButton v-bind="props" />
</template>
