<script setup lang="ts">
import type { CardCoreProps } from "./type";
import { Card } from "primevue";
const props = withDefaults(defineProps<CardCoreProps>(), {});
</script>
<template>
  <Card v-bind="props">
    <template v-if="$slots.title" #title>
      <slot name="title" />
    </template>
    <template #content>
      <slot />
    </template>
    <template v-if="$slots.subtitle" #subtitle>
      <slot name="subtitle" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
  </Card>
</template>
