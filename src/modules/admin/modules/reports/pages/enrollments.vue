<script setup lang="ts">
import { computed, ref } from "vue";
import { SelectCore } from "@/shared/components";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { EnrollmentReport, EnrollmentRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";
import { OFFER_TYPE_OPTIONS, OFFER_TYPE_LABELS } from "../constants/reports";

const { data, loading, apply } = useReport<EnrollmentReport>((filters) =>
  reportService.enrollments(filters),
);

const type = ref<"course" | "learning_path" | null>(null);

const items = computed<EnrollmentRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Matrículas vigentes",
      value: t.active,
      hint: "pagadas + pendientes de pago",
    },
    {
      label: "Ya pagadas",
      value: `${t.paid_percent}%`,
      hint: `${t.paid} de ${t.active} vigentes`,
      tone: "success" as const,
    },
    {
      label: "Canceladas",
      value: t.cancelled,
      hint: "no cuentan como vigentes",
      tone: t.cancelled > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Programa más vendido",
      value: t.top_offer?.active ?? 0,
      hint: t.top_offer?.name ?? "sin matrículas",
    },
  ];
});

const onExport = () =>
  exportCsv<EnrollmentRow>("matriculas-por-programa", [
    { header: "Programa", value: (r) => r.offer_name },
    { header: "Tipo", value: (r) => OFFER_TYPE_LABELS[r.type] },
    { header: "Vigentes", value: (r) => r.active },
    { header: "Pagadas", value: (r) => r.paid },
    { header: "Pendientes", value: (r) => r.pending },
    { header: "Canceladas", value: (r) => r.cancelled },
    { header: "% pagadas", value: (r) => r.paid_percent },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Matrículas por programa"
    :count="items.length"
    :loading="loading"
    :empty="!items.length"
  >
    <template #totals>
      <ReportTotals :items="totalCards" />
    </template>

    <template #filters>
      <ReportFiltersBar
        :loading="loading"
        :can-export="items.length > 0"
        @apply="(range) => apply({ ...range, type: type ?? undefined })"
        @export="onExport"
      >
        <template #extra>
          <div class="min-w-50">
            <span
              class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
            >
              TIPO DE PRODUCTO
            </span>
            <SelectCore
              v-model="type"
              :options="OFFER_TYPE_OPTIONS"
              option-label="label"
              option-value="value"
              placeholder="Todos"
              show-clear
            />
          </div>
        </template>
      </ReportFiltersBar>
    </template>

    <table class="w-full min-w-225 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Programa</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Tipo</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Vigentes</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Pagadas</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Pendientes</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Canceladas</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">% pagadas</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in items"
          :key="row.offer_id"
          class="adm-row border-t border-line-soft"
        >
          <td class="px-5.5 py-3">
            <div class="text-adm-base font-semibold text-secondary-900">
              {{ row.offer_name }}
            </div>
            <div v-if="row.offer_prefix" class="font-mono text-adm-sm text-secondary-400">
              {{ row.offer_prefix }}
            </div>
          </td>
          <td class="px-3 py-3">
            <span
              class="font-mono text-[0.594rem] font-bold px-2.25 py-1 rounded-pill tracking-[0.06em] uppercase"
              :class="
                row.type === 'learning_path'
                  ? 'bg-accent-soft text-primary-600'
                  : 'bg-line-soft text-secondary-500'
              "
            >
              {{ OFFER_TYPE_LABELS[row.type] }}
            </span>
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ row.active }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-success-DEFAULT">
            {{ row.paid }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.pending > 0 ? 'text-amber-DEFAULT font-bold' : 'text-secondary-400'"
          >
            {{ row.pending }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.cancelled > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'"
          >
            {{ row.cancelled || "—" }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar :percent="row.paid_percent" :threshold="90" />
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
