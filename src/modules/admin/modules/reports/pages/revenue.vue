<script setup lang="ts">
import { computed, ref } from "vue";
import { SelectCore } from "@/shared/components";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { RevenueReport, RevenueRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import ReportSection from "../components/report-section.vue";
import ReportTrend from "../components/report-trend.vue";
import DeltaPill from "@/modules/admin/components/ui/delta-pill.vue";
import { exportCsv } from "../utils/export-csv";
import currencyService from "@/modules/admin/modules/catalog/modules/currencies/services/currency.service";

const { data, loading, initializing, refreshing, apply } = useReport<RevenueReport>((filters) =>
  reportService.revenue(filters),
);

const currencyId = ref<number | null>(null);
const loadCurrencies = () => currencyService.all();

const items = computed<RevenueRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);
const summary = computed(() => data.value?.summary ?? []);

/*
 * Los montos de monedas distintas no se suman nunca. La API devuelve un
 * resumen por moneda, con símbolo, decimales y texto ya resueltos desde
 * `currencies`; aquí solo se elige cuál va grande (la de más matrículas) y se
 * listan las demás debajo.
 */
const ranked = computed(() =>
  // Se ordena por actividad (matrículas), no por monto: comparar 8,000 pesos
  // con 845 dólares no dice cuál moneda pesa más.
  [...summary.value].sort((a, b) => b.enrollments - a.enrollments),
);
const main = computed(() => ranked.value[0]);
const others = computed(() => ranked.value.slice(1));

const COMPARE = "vs. periodo anterior";

const totalCards = computed(() => {
  const t = totals.value;
  if (!t || !main.value) return [];

  const many = others.value.length > 0;

  return [
    {
      label: "Cobrado en el periodo",
      value: main.value.paid_formatted,
      valueLabel: many ? main.value.name : null,
      change: { percent: main.value.change_percent, suffix: COMPARE },
      extra: others.value.map((row) => ({
        label: row.name,
        text: row.paid_formatted,
        percent: row.change_percent,
      })),
      tone: "success" as const,
    },
    {
      label: "Pendiente de cobro",
      value: main.value.pending_formatted,
      valueLabel: many ? main.value.name : null,
      hint: `${main.value.pending_percent}% de lo facturado`,
      extra: others.value.map((row) => ({
        label: row.name,
        text: row.pending_formatted,
      })),
      tone: main.value.pending > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Matrículas vigentes",
      value: t.enrollments,
      hint: "sin contar las canceladas",
    },
    {
      label: "Programas con venta",
      value: t.offers,
      hint: t.currencies > 1 ? `en ${t.currencies} monedas` : "cohortes con movimiento",
    },
  ];
});

const STATUS_TONE: Record<string, string> = {
  paid: "bg-success-soft text-success-DEFAULT",
  pending: "bg-amber-soft text-amber-DEFAULT",
  cancelled: "bg-admin-bg text-secondary-500",
  failed: "bg-danger-soft text-danger-DEFAULT",
};

const onExport = () =>
  exportCsv<RevenueRow>("ingresos-y-cobranza", [
    { header: "Programa", value: (r) => r.offer_name },
    { header: "Prefijo", value: (r) => r.offer_prefix },
    { header: "Moneda", value: (r) => r.symbol },
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
    :loading="initializing"
    :refreshing="refreshing"
    :empty="!items.length"
  >
    <template #totals>
      <ReportTotals :items="totalCards" :loading="initializing" />
    </template>

    <template #extra>
      <div v-if="initializing || summary.length" class="flex flex-col gap-3.5 mb-3.5">
        <ReportSection
          title="Resumen por moneda"
          hint="Cada moneda por separado: los montos nunca se suman entre sí"
          :loading="initializing"
        >
          <div class="overflow-x-auto">
            <table class="w-full min-w-200 border-collapse">
              <thead>
                <tr class="bg-admin-bg">
                  <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Moneda</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Facturado</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cobrado</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Periodo anterior</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Pendiente</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Canceladas</th>
                  <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Ticket prom.</th>
                  <th class="text-right px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Matrículas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in ranked" :key="row.symbol ?? '—'" class="adm-row border-t border-line-soft">
                  <td class="px-5.5 py-3">
                    <span class="inline-flex items-center gap-2">
                      <span class="font-mono text-adm-sm font-bold text-primary-500 bg-accent-soft px-2 py-0.5 rounded-adm-sm">
                        {{ row.symbol }}
                      </span>
                      <span class="text-adm-sm font-semibold text-secondary-700">{{ row.name }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ row.billed_formatted }}</td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
                    {{ row.paid_formatted }}
                    <DeltaPill class="mt-1" :percent="row.change_percent" />
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-400">{{ row.previous_formatted }}</td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm" :class="row.pending > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'">
                    {{ row.pending_formatted }}
                    <div class="text-adm-label text-secondary-400 font-normal">{{ row.pending_percent }}% de lo facturado</div>
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
                    {{ row.cancelled_formatted }}
                    <div class="text-adm-label text-secondary-400">{{ row.cancelled_count }} {{ row.cancelled_count === 1 ? "matrícula" : "matrículas" }}</div>
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ row.average_formatted }}</td>
                  <td class="px-5.5 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ row.enrollments }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection
          title="Cobrado por mes"
          hint="Una escala por moneda; los meses sin cobro quedan en cero"
          :loading="initializing"
        >
          <ReportTrend :points="data?.series ?? []" />
        </ReportSection>

        <div class="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
          <ReportSection
            title="Medios de pago"
            hint="Qué parte de lo cobrado entra por cada medio, dentro de su moneda"
            :loading="initializing"
          >
            <div v-if="!data?.by_method.length" class="px-5.5 py-8 text-center text-adm-base text-secondary-500">
              No hubo cobros en el periodo.
            </div>
            <ul v-else class="list-none m-0 px-5.5 py-2">
              <li
                v-for="(row, index) in data.by_method"
                :key="`${row.method}-${row.currency}`"
                class="py-3"
                :class="index < data.by_method.length - 1 ? 'border-b border-line-soft' : ''"
              >
                <div class="flex items-baseline justify-between gap-3 mb-1.5">
                  <span class="text-adm-base font-semibold text-secondary-900 truncate">
                    {{ row.method }}
                    <span class="font-mono text-adm-xs text-secondary-400 ml-1">{{ row.symbol }}</span>
                  </span>
                  <span class="font-mono text-adm-sm font-bold text-secondary-900 shrink-0">{{ row.formatted }}</span>
                </div>
                <ReportBar :percent="row.share_percent" :threshold="0" />
                <div class="text-adm-label text-secondary-400 mt-1">
                  {{ row.payments }} {{ row.payments === 1 ? "pago" : "pagos" }}
                </div>
              </li>
            </ul>
          </ReportSection>

          <ReportSection
            title="Estado de las matrículas"
            hint="Matrículas del periodo según su estado de pago"
            :loading="initializing"
          >
            <div v-if="!data?.by_status.length" class="px-5.5 py-8 text-center text-adm-base text-secondary-500">
              No hubo matrículas en el periodo.
            </div>
            <ul v-else class="list-none m-0 px-5.5 py-2">
              <li
                v-for="(row, index) in data.by_status"
                :key="`${row.status}-${row.currency}`"
                class="py-3 flex items-center justify-between gap-3"
                :class="index < data.by_status.length - 1 ? 'border-b border-line-soft' : ''"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <span
                    class="font-mono text-adm-xs font-bold px-1.5 py-0.5 rounded-adm-sm tracking-wider shrink-0"
                    :class="STATUS_TONE[row.status] ?? 'bg-admin-bg text-secondary-500'"
                  >
                    {{ row.label }}
                  </span>
                  <span class="font-mono text-adm-xs text-secondary-400">{{ row.symbol }}</span>
                </span>
                <span class="text-right shrink-0">
                  <span class="font-mono text-adm-sm font-bold text-secondary-900 block">{{ row.formatted }}</span>
                  <span class="text-adm-label text-secondary-400">
                    {{ row.enrollments }} {{ row.enrollments === 1 ? "matrícula" : "matrículas" }}
                  </span>
                </span>
              </li>
            </ul>
          </ReportSection>
        </div>
      </div>
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
          :key="`${row.offer_id}-${row.currency}`"
          class="adm-row border-t border-line-soft"
        >
          <td class="px-5.5 py-3">
            <div class="text-adm-base font-semibold text-secondary-900">
              {{ row.offer_name }}
            </div>
            <div class="font-mono text-adm-sm text-secondary-400">
              <template v-if="row.offer_prefix">{{ row.offer_prefix }} · </template>{{ row.symbol }}
            </div>
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.enrollments }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ row.paid_formatted }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.pending > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'"
          >
            {{ row.pending_formatted }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.average_formatted }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar :percent="row.paid_percent" :threshold="95" />
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
