<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { OccupancyReport, OccupancyRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import { exportCsv } from "../utils/export-csv";
import { OCCUPANCY_STATES } from "../constants/reports";

const { data, loading, apply } = useReport<OccupancyReport>((filters) =>
  reportService.occupancy(filters),
);

const items = computed<OccupancyRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Cohortes abiertas",
      value: t.offers,
      hint: "con matrícula en el periodo",
    },
    {
      label: "Bajo el mínimo",
      value: t.below_min,
      hint: "riesgo de no arrancar",
      tone: t.below_min > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Sobre el máximo",
      value: t.over_max,
      hint: "exceden las plazas",
      tone: t.over_max > 0 ? ("warning" as const) : ("default" as const),
    },
    { label: "Plazas libres", value: t.free, hint: "en total" },
  ];
});

const date = (value: string | null) =>
  value ? dayjs(value).format("DD/MM/YYYY") : "—";

/** La barra usa el color del estado, no un umbral fijo. */
const barTone = (state: OccupancyRow["state"]) =>
  ({
    ok: "bg-success-DEFAULT",
    below_min: "bg-amber-DEFAULT",
    over_max: "bg-danger-DEFAULT",
  })[state];

const onExport = () =>
  exportCsv<OccupancyRow>("ocupacion-de-cohortes", [
    { header: "Cohorte", value: (r) => r.offer_name },
    { header: "Matriculados", value: (r) => r.enrolled },
    { header: "Mínimo", value: (r) => r.min },
    { header: "Máximo", value: (r) => r.max },
    { header: "Cierre", value: (r) => date(r.closes_at) },
    { header: "Ocupación %", value: (r) => r.percent },
    { header: "Estado", value: (r) => OCCUPANCY_STATES[r.state].label },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Ocupación de cohortes"
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
        @apply="apply"
        @export="onExport"
      />
    </template>

    <table class="w-full min-w-237.5 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cohorte</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Matriculados</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Mínimo</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Máximo</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cierre</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-50">Ocupación</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Estado</th>
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
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm font-bold"
            :class="{
              'text-danger-DEFAULT': row.state === 'over_max',
              'text-amber-DEFAULT': row.state === 'below_min',
              'text-success-DEFAULT': row.state === 'ok',
            }"
          >
            {{ row.enrolled }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-400">
            {{ row.min }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-400">
            {{ row.max }}
          </td>
          <td class="px-3 py-3 font-mono text-adm-sm text-secondary-500">
            {{ date(row.closes_at) }}
          </td>
          <td class="px-3 py-3">
            <div class="flex items-center gap-2.25">
              <div class="flex-1 h-1.5 bg-admin-bg rounded-pill overflow-hidden">
                <div
                  class="h-full rounded-pill"
                  :class="barTone(row.state)"
                  :style="{ width: `${row.percent}%` }"
                />
              </div>
              <span class="font-mono text-adm-sm text-secondary-500 min-w-8 text-right">
                {{ Math.round(row.percent) }}%
              </span>
            </div>
          </td>
          <td class="px-5.5 py-3">
            <span
              class="font-mono text-[0.594rem] font-bold px-2.25 py-1 rounded-pill tracking-[0.06em] uppercase"
              :class="OCCUPANCY_STATES[row.state].class"
            >
              {{ OCCUPANCY_STATES[row.state].label }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
