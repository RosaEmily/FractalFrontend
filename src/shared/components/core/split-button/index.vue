<script setup lang="ts">
import SplitButton from "primevue/splitbutton";
import type { SplitButtonCoreProps } from "./type";
const props = withDefaults(defineProps<SplitButtonCoreProps>(), {
  size: "small",
});
</script>
<template>
  <SplitButton v-bind="props">
    <!--
      `item` se reenvía solo si el consumidor lo provee: declararlo siempre le
      diría a PrimeVue que hay slot y pintaría los ítems vacíos.
      (Misma trampa que el `#header` de ModalCore.)
    -->
    <template v-if="$slots.item" #item="scope">
      <slot name="item" v-bind="scope" />
    </template>
    <template v-if="$slots.icon" #icon="scope">
      <slot name="icon" v-bind="scope" />
    </template>
    <template v-if="$slots.dropdownicon" #dropdownicon="scope">
      <slot name="dropdownicon" v-bind="scope" />
    </template>
  </SplitButton>
</template>
