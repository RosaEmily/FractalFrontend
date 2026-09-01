<script setup lang="ts">
import type { Currency } from "../models/currency.model";

defineProps<{ row: Currency }>();
</script>

<template>
  <!-- El diseño resalta el código ISO en mono naranja. -->
  <span
    class="font-mono text-adm-sm font-bold text-primary-600 tracking-wide"
  >
    {{ row.code }}
  </span>
</template>
