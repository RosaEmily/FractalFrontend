<script setup lang="ts">
import { onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import coordinatorService, {
  QUOTA_STATE,
} from "../../services/coordinator.service";
import type { QuotaDTO } from "../../dto/coordinator.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";
import { formatDate } from "../../utils/format";

const quotas = ref<QuotaDTO[]>([]);
const loading = ref(true);

/** Ocupación sobre el cupo máximo. Se capa al 100% para que la barra no desborde. */
const occupancy = (quota: QuotaDTO) =>
  quota.max_students
    ? Math.min(
        100,
        Math.round((quota.enrolled_students_count / quota.max_students) * 100),
      )
    : 0;

/** Rojo sobre el cupo, ámbar bajo el mínimo, verde en rango. */
const barClass = (quota: QuotaDTO) =>
  quota.state === "over_max"
    ? "bg-danger-DEFAULT"
    : quota.state === "below_min"
      ? "bg-amber-DEFAULT"
      : "bg-success-DEFAULT";

onMounted(async () => {
  const { data } = await safeRequest(() => coordinatorService.quotas());
  quotas.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="COHORTES"
      title="Cohortes"
      sub="Ocupación de los grupos con matrícula abierta, contra su mínimo y su cupo."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <div v-else-if="quotas.length" class="grid gap-3.5 xl:grid-cols-2">
      <AulaCard v-for="quota in quotas" :key="quota.id">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span
              class="font-mono text-adm-xs text-secondary-400 tracking-[0.06em] uppercase"
            >
              {{ quota.prefix ?? "Cohorte" }}
            </span>
            <p
              class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1"
            >
              {{ quota.name }}
            </p>
          </div>
          <AulaPill
            :tone="(QUOTA_STATE[quota.state]?.tone ?? 'neutral') as never"
            size="sm"
          >
            {{ QUOTA_STATE[quota.state]?.label ?? quota.state }}
          </AulaPill>
        </div>

        <div class="flex items-end justify-between gap-3 mt-4">
          <div>
            <span class="font-display text-3xl font-extrabold text-secondary-900">
              {{ quota.enrolled_students_count }}
            </span>
            <span class="text-adm-base text-secondary-500">
              / {{ quota.max_students }} matriculados
            </span>
          </div>
          <span class="font-mono text-adm-xs text-secondary-400">
            MÍN {{ quota.min_students }} · MÁX {{ quota.max_students }}
          </span>
        </div>

        <div class="h-1.5 rounded-pill bg-control-off overflow-hidden mt-2.5">
          <div
            class="h-full rounded-pill transition-[width] duration-300"
            :class="barClass(quota)"
            :style="{ width: `${occupancy(quota)}%` }"
          />
        </div>

        <p
          class="font-mono text-adm-xs text-secondary-400 mt-3 pt-3 border-t border-line-soft"
        >
          MATRÍCULA CIERRA EL
          {{ formatDate(quota.enrollment_end_date, true).toUpperCase() }}
        </p>
      </AulaCard>
    </div>

    <AulaEmpty
      v-else
      title="No hay grupos con matrícula abierta"
      sub="Cuando una oferta tenga su periodo de inscripción vigente, aparecerá acá con su ocupación."
    />
  </div>
</template>
