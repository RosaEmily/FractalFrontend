<script setup lang="ts">
import type { CardCoreProps } from "./type";
import { Card } from "primevue";
const props = withDefaults(defineProps<CardCoreProps>(), {});
</script>
<template>
  <Card v-bind="props">
    <template #title>
      <slot name="title" />
    </template>
    <template #content>
      <slot />
    </template>
    <template #subtitle>
      <slot name="subtitle" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
    <template #header>
      <slot name="header" />
    </template>
  </Card>
</template>
