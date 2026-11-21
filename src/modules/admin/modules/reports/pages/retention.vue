<script setup lang="ts">
import { computed } from "vue";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { RetentionReportDTO, RetentionRowDTO } from "../dto/management.dto";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";

const { data, loading, initializing, refreshing, apply } =
  useReport<RetentionReportDTO>((filters) => reportService.retention(filters));

const items = computed<RetentionRowDTO[]>(() => data.value?.items ?? []);

const pct = (value: number | null) => (value === null ? "—" : `${value}%`);

const totalCards = computed(() => {
  const t = data.value?.totals;
  if (!t) return [];

  return [
    { label: "Matrículas del periodo", value: t.enrolled, hint: `en ${t.cohorts} cohortes` },
    {
      label: "Matrículas perdidas",
      value: t.lost,
      hint: "canceladas o con pago fallido",
      tone: t.lost > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Abandono",
      value: pct(t.dropout_percent),
      hint: "perdidas sobre el total",
      tone: (t.dropout_percent ?? 0) >= 15 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Cursos completados",
      value: pct(t.completion_percent),
      hint: "de los cursos ya iniciados",
      tone: "success" as const,
    },
  ];
});

const onExport = () =>
  exportCsv<RetentionRowDTO>("retencion-por-cohorte", [
    { header: "Cohorte", value: (r) => r.offer_name },
    { header: "Matrículas", value: (r) => r.enrolled },
    { header: "Canceladas", value: (r) => r.cancelled },
    { header: "Pago fallido", value: (r) => r.failed },
    { header: "Abandono %", value: (r) => r.dropout_percent },
    { header: "Cursos en progreso", value: (r) => r.in_progress },
    { header: "Cursos completados", value: (r) => r.completed },
    { header: "Completado %", value: (r) => r.completion_percent },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Retención por cohorte"
    :count="items.length"
    :loading="initializing"
    :refreshing="refreshing"
    :empty="!items.length"
  >
    <template #filters>
      <ReportFiltersBar
        :loading="loading"
        :can-export="items.length > 0"
        @apply="apply"
        @export="onExport"
      />
    </template>

    <template #totals>
      <ReportTotals :items="totalCards" :loading="initializing" />
    </template>

    <table class="w-full min-w-225 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cohorte</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Matrículas</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Perdidas</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">Abandono</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">En progreso</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Completados</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">Avance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.offer_id" class="adm-row border-t border-line-soft">
          <td class="px-5.5 py-3">
            <div class="text-adm-base font-semibold text-secondary-900">{{ row.offer_name }}</div>
            <div v-if="row.offer_prefix" class="font-mono text-adm-sm text-secondary-400">{{ row.offer_prefix }}</div>
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-900">{{ row.enrolled }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm" :class="row.lost > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'">
            {{ row.lost }}
            <div v-if="row.lost > 0" class="text-adm-label font-normal text-secondary-400">
              {{ row.cancelled }} canc. · {{ row.failed }} fallidas
            </div>
          </td>
          <td class="px-3 py-3">
            <!-- Abandono: más bajo es mejor, así que la barra se pinta al revés (100 − %) -->
            <ReportBar :percent="row.dropout_percent === null ? null : 100 - row.dropout_percent" :threshold="85" empty-label="Sin matrículas" />
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ row.in_progress }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ row.completed }}</td>
          <td class="px-5.5 py-3">
            <ReportBar :percent="row.completion_percent" :threshold="0" empty-label="Aún sin avance" />
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
