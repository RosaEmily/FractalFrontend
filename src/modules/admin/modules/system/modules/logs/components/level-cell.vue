<script setup lang="ts">
import { computed } from "vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import type { Log } from "../models/log.model";

type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

const props = defineProps<{ row: Log }>();

/** Tonos del AdmLogLevel del diseño. */
const TONES: Record<string, PillTone> = {
  info: "info",
  warning: "warning",
  error: "danger",
  debug: "neutral",
};

const tone = computed<PillTone>(() => TONES[props.row.level] ?? "neutral");
</script>

<template>
  <StatusPill :label="row.levelLabel" :tone="tone" :dot="false" />
</template>
