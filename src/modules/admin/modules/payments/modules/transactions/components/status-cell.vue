<script setup lang="ts">
import { computed } from "vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import type { Transaction } from "../models/transaction.model";

type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

const props = defineProps<{ row: Transaction }>();

/** Tonos del diseño para cada estado de pago (AdmStatusPago). */
const TONES: Record<string, PillTone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

const tone = computed<PillTone>(() => TONES[props.row.status] ?? "neutral");
</script>

<template>
  <StatusPill :label="row.statusName" :tone="tone" />
</template>
