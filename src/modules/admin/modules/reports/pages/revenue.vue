<script setup lang="ts">
import { computed, ref } from "vue";
import { SelectCore } from "@/shared/components";
import { formatNumber } from "@/shared/utils/format";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { RevenueReport, RevenueRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";
import currencyService from "@/modules/admin/modules/catalog/modules/currencies/services/currency.service";

const { data, loading, apply } = useReport<RevenueReport>((filters) =>
  reportService.revenue(filters),
);

const currencyId = ref<number | null>(null);
const loadCurrencies = () => currencyService.all();

const items = computed<RevenueRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);

/**
 * Símbolo del periodo. Los montos se muestran con el de la primera fila:
 * el filtro de moneda existe justo para no mezclarlas en una misma vista.
 */
const symbol = computed(() => items.value[0]?.symbol ?? "");

const money = (value: number) => `${symbol.value} ${formatNumber(value)}`.trim();

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Cobrado en el periodo",
      value: money(t.paid),
      hint: `${t.enrollments} ${t.enrollments === 1 ? "matrícula" : "matrículas"}`,
      tone: "success" as const,
    },
    {
      label: "Pendiente de cobro",
      value: money(t.pending),
      hint: `${t.pending_percent}% del total facturado`,
      tone: t.pending > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Ticket promedio",
      value: money(t.average),
      hint: "por matrícula",
    },
    {
      label: "Programas con venta",
      value: t.offers,
      hint: "cohortes con matrículas",
    },
  ];
});

const onExport = () =>
  exportCsv<RevenueRow>("ingresos-y-cobranza", [
    { header: "Programa", value: (r) => r.offer_name },
    { header: "Prefijo", value: (r) => r.offer_prefix },
    { header: "Moneda", value: (r) => r.currency },
    { header: "Matrículas", value: (r) => r.enrollments },
    { header: "Cobrado", value: (r) => r.paid },
    { header: "Pendiente", value: (r) => r.pending },
    { header: "Ticket promedio", value: (r) => r.average },
    { header: "% cobrado", value: (r) => r.paid_percent },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Ingresos y cobranza"
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
        @apply="(range) => apply({ ...range, currency_id: currencyId ?? undefined })"
        @export="onExport"
      >
        <template #extra>
          <div class="min-w-42.5">
            <span
              class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
            >
              MONEDA
            </span>
            <SelectCore
              v-model="currencyId"
              :service="loadCurrencies"
              auto-load
              option-label="name"
              option-value="id"
              placeholder="Todas"
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
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Matrículas</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cobrado</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Pendiente</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Ticket prom.</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">% cobrado</th>
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
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.enrollments }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ money(row.paid) }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.pending > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'"
          >
            {{ money(row.pending) }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ money(row.average) }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar :percent="row.paid_percent" :threshold="95" />
          </td>
        </tr>
      </tbody>
      <tfoot v-if="totals">
        <tr class="bg-admin-bg border-t border-line">
          <td class="px-5.5 py-3.5 font-display text-adm-base font-bold text-secondary-900">
            Total
          </td>
          <td class="px-3 py-3.5 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ totals.enrollments }}
          </td>
          <td class="px-3 py-3.5 text-right font-mono text-adm-sm font-bold text-success-DEFAULT">
            {{ money(totals.paid) }}
          </td>
          <td class="px-3 py-3.5 text-right font-mono text-adm-sm font-bold text-danger-DEFAULT">
            {{ money(totals.pending) }}
          </td>
          <td colspan="2" />
        </tr>
      </tfoot>
    </table>
  </ReportLayout>
</template>
