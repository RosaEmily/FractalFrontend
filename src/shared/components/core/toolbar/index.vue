<script setup lang="ts">
import type { ToolbarCoreProps } from "./type";
import { Toolbar } from "primevue";
const props = withDefaults(defineProps<ToolbarCoreProps>(), {});
</script>
<template>
  <Toolbar v-bind="props">
    <template #start>
      <slot name="start" />
    </template>
    <template #center>
      <slot name="center" />
    </template>
    <template #end>
      <slot name="end" />
    </template>
  </Toolbar>
</template>
