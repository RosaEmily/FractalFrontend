<script setup lang="ts">
import { computed } from "vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import type { Enrollment } from "../models/enrollment.model";

type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

const props = defineProps<{ row: Enrollment }>();

/** Mismos tonos que el AdmStatusPago del diseño. */
const TONES: Record<string, PillTone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

const tone = computed<PillTone>(() => TONES[props.row.paymentStatus] ?? "neutral");
</script>

<template>
  <StatusPill :label="row.paymentStatusName" :tone="tone" />
</template>
