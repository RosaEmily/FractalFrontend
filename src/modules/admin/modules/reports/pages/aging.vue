<script setup lang="ts">
import { mdiCheckCircleOutline } from "@mdi/js";
import { computed } from "vue";
import dayjs from "dayjs";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { AgingBucketKey, AgingReportDTO, AgingRowDTO } from "../dto/management.dto";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportSection from "../components/report-section.vue";
import { exportCsv } from "../utils/export-csv";

// Foto de hoy: no hay filtro de fechas, la antigüedad se mide contra hoy.
const { data, initializing, refreshing } = useReport<AgingReportDTO>(() =>
  reportService.aging(),
);

const summary = computed(() => data.value?.summary ?? []);
const items = computed<AgingRowDTO[]>(() => data.value?.items ?? []);

const BUCKETS: { key: AgingBucketKey; label: string; bar: string; chip: string }[] = [
  { key: "0_30", label: "0–30 días", bar: "bg-success-DEFAULT", chip: "bg-success-soft text-success-DEFAULT" },
  { key: "31_60", label: "31–60 días", bar: "bg-amber-DEFAULT", chip: "bg-amber-soft text-amber-DEFAULT" },
  { key: "61_90", label: "61–90 días", bar: "bg-primary-500", chip: "bg-accent-soft text-primary-500" },
  { key: "90_plus", label: "Más de 90 días", bar: "bg-danger-DEFAULT", chip: "bg-danger-soft text-danger-DEFAULT" },
];

const chipFor = (days: number) =>
  (days <= 30 ? BUCKETS[0] : days <= 60 ? BUCKETS[1] : days <= 90 ? BUCKETS[2] : BUCKETS[3])!.chip;

const totalCards = computed(() => {
  const d = data.value;
  if (!d) return [];
  // Cada moneda por separado: la de más matrículas pendientes va grande.
  const ranked = [...d.summary].sort((a, b) => b.count - a.count);
  const [main, ...others] = ranked;

  return [
    {
      label: "Por cobrar",
      value: main?.total_formatted ?? "Sin deuda",
      valueLabel: others.length ? main?.name : null,
      hint: main ? `${main.count} ${main.count === 1 ? "matrícula pendiente" : "matrículas pendientes"}` : "no hay cobranza pendiente",
      extra: others.map((row) => ({ label: row.name, text: row.total_formatted })),
      tone: main ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Matrículas pendientes",
      value: d.totals.enrollments,
      hint: d.totals.currencies > 1 ? `en ${d.totals.currencies} monedas` : "de pago",
    },
    {
      label: "Con más de 60 días",
      value: d.totals.over_60,
      hint: "riesgo de no cobrarse",
      tone: d.totals.over_60 > 0 ? ("danger" as const) : ("default" as const),
    },
  ];
});

const onExport = () =>
  exportCsv<AgingRowDTO>("antiguedad-de-cobranza", [
    { header: "Matrícula", value: (r) => r.id },
    { header: "Alumno", value: (r) => r.student },
    { header: "Programas", value: (r) => r.offers },
    { header: "Moneda", value: (r) => r.symbol },
    { header: "Monto", value: (r) => r.amount },
    { header: "Fecha", value: (r) => r.created_at },
    { header: "Días", value: (r) => r.days },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Detalle de matrículas pendientes"
    :count="items.length"
    :loading="initializing"
    :refreshing="refreshing"
    :empty="!items.length"
    empty-title="Sin cobranza pendiente"
    empty-text="Todas las matrículas están al día en sus pagos."
    empty-tone="success"
    :empty-icon="mdiCheckCircleOutline"
  >
    <template #totals>
      <ReportTotals :items="totalCards" :loading="initializing" />
    </template>

    <template #extra>
      <div v-if="initializing || summary.length" class="mb-3.5">
        <ReportSection
          title="Por antigüedad"
          hint="Cuánto lleva esperando el pago desde que se matriculó el alumno"
          :loading="initializing"
        >
          <div class="px-5.5 py-4.5 flex flex-col gap-6">
            <div v-for="row in summary" :key="row.currency ?? '—'">
              <div class="flex items-baseline justify-between gap-3 mb-2.5">
                <span class="inline-flex items-center gap-2">
                  <span class="font-mono text-adm-sm font-bold text-primary-500 bg-accent-soft px-2 py-0.5 rounded-adm-sm">{{ row.symbol }}</span>
                  <span class="text-adm-sm font-semibold text-secondary-700">{{ row.name }}</span>
                </span>
                <span class="font-display text-adm-lg font-bold text-secondary-900">{{ row.total_formatted }}</span>
              </div>

              <!-- Barra apilada: el ancho de cada tramo es su parte de la deuda de esa moneda -->
              <div class="flex h-2.5 rounded-pill overflow-hidden bg-admin-bg">
                <div
                  v-for="b in BUCKETS"
                  :key="b.key"
                  :class="b.bar"
                  :style="{ width: `${row.buckets[b.key].percent}%` }"
                  v-tooltip.top="`${b.label}: ${row.buckets[b.key].formatted}`"
                />
              </div>

              <div class="grid grid-cols-2 gap-3 mt-3 md:grid-cols-4">
                <div v-for="b in BUCKETS" :key="b.key">
                  <div class="flex items-center gap-1.5">
                    <span class="size-2 rounded-full" :class="b.bar" />
                    <span class="text-adm-label text-secondary-400">{{ b.label }}</span>
                  </div>
                  <div class="font-mono text-adm-sm font-bold text-secondary-900 mt-0.5">{{ row.buckets[b.key].formatted }}</div>
                  <div class="text-adm-label text-secondary-400">
                    {{ row.buckets[b.key].count }} {{ row.buckets[b.key].count === 1 ? "matrícula" : "matrículas" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ReportSection>
      </div>
    </template>

    <div class="px-5.5 pb-3 flex items-center justify-between gap-3">
      <p class="text-adm-sm text-secondary-400 m-0">
        Las más antiguas primero{{ data && data.totals.enrollments > data.detail_limit ? ` · se muestran ${data.detail_limit} de ${data.totals.enrollments}` : "" }}.
      </p>
      <button
        type="button"
        class="font-mono text-adm-label font-semibold text-primary-500 bg-transparent border-0 cursor-pointer hover:underline"
        :disabled="!items.length"
        @click="onExport"
      >
        Exportar CSV
      </button>
    </div>

    <table class="w-full min-w-200 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Alumno</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Programas</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Monto</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Matrícula</th>
          <th class="text-right px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Espera</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id" class="adm-row border-t border-line-soft">
          <td class="px-5.5 py-3 text-adm-base font-semibold text-secondary-900">{{ row.student }}</td>
          <td class="px-3 py-3 text-adm-sm text-secondary-500 max-w-80 truncate" v-tooltip.top="row.offers">{{ row.offers }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">{{ row.formatted }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ dayjs(row.created_at).format("DD/MM/YYYY") }}</td>
          <td class="px-5.5 py-3 text-right">
            <span class="font-mono text-adm-xs font-bold px-2 py-0.5 rounded-pill" :class="chipFor(row.days)">
              {{ row.days }} {{ row.days === 1 ? "día" : "días" }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
