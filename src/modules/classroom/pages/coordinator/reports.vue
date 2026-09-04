<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiCashClock,
  mdiCertificateOutline,
  mdiChartBoxOutline,
} from "@mdi/js";
import coordinatorService, {
  SEVERITY_TONE,
} from "../../services/coordinator.service";
import type { AttentionItemDTO, StatsDTO } from "../../dto/coordinator.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatMoney, formatPercent } from "../../utils/format";

const stats = ref<StatsDTO | null>(null);
const attention = ref<AttentionItemDTO[]>([]);
const loading = ref(true);

/** Los avisos de cierre: certificados sin emitir y pagos pendientes. */
const items = computed(() =>
  attention.value.filter((a) =>
    ["certificates_pending", "pending_payments"].includes(a.key),
  ),
);

/**
 * Cobrado del mes, por moneda. Nunca se suman: `transactions.currency` es texto
 * libre, así que un total único mezclaría soles con dólares.
 */
const revenue = computed(() => stats.value?.revenue.current ?? []);

onMounted(async () => {
  const [statsRes, attentionRes] = await Promise.all([
    safeRequest(() => coordinatorService.stats(), { showAlert: false }),
    safeRequest(() => coordinatorService.attention(), { showAlert: false }),
  ]);

  stats.value = statsRes.data;
  attention.value = attentionRes.data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="CIERRES Y PAGOS"
      title="Cierres y pagos"
      sub="Actas por cerrar, certificados por emitir y matrículas con pago pendiente."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <template v-else>
      <div class="grid gap-3.5 sm:grid-cols-3 mb-6">
        <AulaStat
          label="Cobrado del mes"
          :value="
            revenue.length
              ? revenue
                  .map((r) => `${r.currency} ${formatMoney(r.total, '')}`)
                  .join(' · ')
              : '—'
          "
          delta="por moneda, nunca sumado"
          :icon="mdiCashClock"
          tone="success"
        />
        <AulaStat
          label="Matrículas del mes"
          :value="stats?.enrollments.current || '—'"
          :delta="`${stats?.enrollments.previous ?? 0} el mes anterior`"
          :icon="mdiChartBoxOutline"
        />
        <AulaStat
          label="Tasa de aprobación"
          :value="formatPercent(stats?.approval.rate)"
          :delta="
            stats?.approval.rate === null
              ? 'Sin notas finales todavía'
              : `${stats?.approval.approved ?? 0} de ${stats?.approval.total ?? 0}`
          "
          :icon="mdiCertificateOutline"
          tone="warning"
        />
      </div>

      <h2
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
      >
        Pendientes de cierre
      </h2>

      <AulaCard v-if="items.length" pad="sm">
        <div
          v-for="item in items"
          :key="item.key"
          class="flex items-start gap-2.5 px-2 py-3 border-b border-line-soft last:border-0"
        >
          <AulaPill
            :tone="(SEVERITY_TONE[item.severity] ?? 'info') as never"
            size="sm"
          >
            {{ item.count }}
          </AulaPill>
          <div class="min-w-0">
            <p class="text-secondary-900">{{ item.title }}</p>
            <p class="text-adm-sm text-secondary-500 mt-0.5">
              {{ item.detail }}
            </p>
          </div>
        </div>
      </AulaCard>

      <AulaEmpty
        v-else
        title="No hay cierres pendientes"
        sub="Todos los certificados de alumnos aprobados están emitidos y no hay pagos vencidos."
      />

      <AulaNotice tone="info" class="mt-4">
        La emisión de certificados y el registro de pagos se hacen desde el panel
        administrativo. El PDF del certificado se arma fuera de la plataforma.
      </AulaNotice>
    </template>
  </div>
</template>
