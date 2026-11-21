<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import dayjs from "dayjs";
import { mdiInformationOutline } from "@mdi/js";
import { HeroCore, TooltipCore } from "@/shared/components";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { ExecutiveReportDTO } from "../dto/management.dto";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportSection from "../components/report-section.vue";
import { exportCsv } from "../utils/export-csv";

const { data, loading, initializing, refreshing, apply } =
  useReport<ExecutiveReportDTO>((filters) => reportService.executive(filters));

const report = computed(() => data.value);
const currencies = computed(() => report.value?.currencies ?? []);
const rows = computed(() => (report.value ? [...report.value.rows, report.value.total] : []));

const cutoffText = computed(() =>
  report.value ? dayjs(report.value.cutoff).format("DD/MM/YYYY") : "",
);
const generatedText = computed(() =>
  report.value
    ? dayjs(report.value.generated_at).locale("es").format("D [de] MMMM [de] YYYY [a las] h:mm a")
    : "",
);

/*
 * Los montos de monedas distintas nunca se suman: la API devuelve el bloque de
 * cada moneda y aquí se elige la de más actividad (la primera) para ir grande.
 */
const COMPARE = "vs. mismo tramo del año anterior";

const totalCards = computed(() => {
  const r = report.value;
  if (!r) return [];
  const [main, ...others] = r.kpis.collected;
  const overdue = r.kpis.overdue.filter((row) => row.count > 0);
  const [overMain, ...overOthers] = overdue;

  return [
    {
      label: "Cobrado en el año",
      value: main?.formatted ?? "—",
      valueLabel: others.length ? main?.name : null,
      change: { percent: main?.change_percent ?? null, suffix: COMPARE },
      extra: others.map((row) => ({
        label: row.name,
        text: row.formatted,
        percent: row.change_percent,
      })),
      tone: "success" as const,
    },
    {
      label: "Matrículas vigentes",
      value: r.kpis.enrollments.current,
      change: { percent: r.kpis.enrollments.change_percent, suffix: COMPARE },
    },
    {
      label: "Cohortes bajo el mínimo",
      value: r.kpis.cohorts_below_min,
      hint: "con matrícula abierta al corte",
      tone: r.kpis.cohorts_below_min > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Cobranza con más de 30 días",
      value: overMain?.formatted ?? "Sin deuda",
      valueLabel: overOthers.length ? overMain?.name : null,
      hint: overMain ? `${overMain.count} ${overMain.count === 1 ? "matrícula" : "matrículas"}` : "al día",
      extra: overOthers.map((row) => ({ label: row.name, text: row.formatted })),
      tone: overMain ? ("danger" as const) : ("default" as const),
    },
  ];
});

/* Dos monedas por tabla desde 1024px; una por tabla en pantallas más angostas. */
const wide = ref(true);
let media: MediaQueryList | null = null;
const onMedia = () => (wide.value = !!media?.matches);
onMounted(() => {
  media = window.matchMedia("(min-width: 1024px)");
  onMedia();
  media.addEventListener("change", onMedia);
});
onBeforeUnmount(() => media?.removeEventListener("change", onMedia));

const currencyGroups = computed(() => {
  const size = wide.value ? 2 : 1;
  const list = currencies.value;
  return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
});

type Row = ExecutiveReportDTO["total"];
const cell = (row: Row, currency: string | null) => row.cells[currency ?? ""]!;

/** % cobrado sobre lo facturado de una moneda; null si no hay facturación. */
const collectionRate = (currency: string | null) => {
  const total = report.value?.total.cells[currency ?? ""];
  if (!total || total.billed <= 0) return null;
  return Math.min(100, Math.round((total.collected / total.billed) * 100));
};

const COLUMNS = [
  { key: "enrollments", label: "Matrículas" },
  { key: "billed_formatted", label: "Facturado" },
  { key: "collected_formatted", label: "Cobrado" },
  { key: "pending_formatted", label: "Pendiente" },
  { key: "cancelled_formatted", label: "Canceladas" },
] as const;

const onExport = () => {
  const r = report.value;
  if (!r) return;
  type Flat = { type: string; currency: string; cell: ExecutiveReportDTO["total"]["cells"][string] };
  const flat: Flat[] = rows.value.flatMap((row) =>
    currencies.value.map((c) => ({
      type: row.label,
      currency: c.symbol ?? "",
      cell: row.cells[c.currency ?? ""]!,
    })),
  );

  exportCsv<Flat>(`resumen-ejecutivo-${r.cutoff}`, [
    { header: "Tipo", value: (f) => f.type },
    { header: "Moneda", value: (f) => f.currency },
    { header: "Matrículas", value: (f) => f.cell.enrollments },
    { header: "Facturado", value: (f) => f.cell.billed },
    { header: "Cobrado", value: (f) => f.cell.collected },
    { header: "Pendiente", value: (f) => f.cell.pending },
    { header: "Canceladas", value: (f) => f.cell.cancelled },
  ], flat);
};
</script>

<template>
  <ReportLayout
    :title="report ? `Resumen al ${cutoffText}` : 'Resumen ejecutivo'"
    :loading="initializing"
    :refreshing="refreshing"
    :empty="!rows.length"
  >
    <template #filters>
      <ReportFiltersBar
        cutoff
        :loading="loading"
        :can-export="rows.length > 0"
        @apply="(range) => apply({ cutoff: range.to })"
        @export="onExport"
      />
    </template>

    <template #totals>
      <ReportTotals :items="totalCards" :loading="initializing" />
    </template>

    <template #extra>
      <div v-if="report?.top_programs.length" class="mb-3.5">
        <ReportSection
          title="Programas que más cobraron"
          hint="Los 3 primeros de cada moneda; no se comparan montos entre monedas"
          :loading="initializing"
        >
          <div class="grid grid-cols-1 gap-0 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="group in report.top_programs"
              :key="group.currency ?? '—'"
              class="px-5.5 py-4 border-b border-line-soft md:border-r"
            >
              <div class="flex items-center gap-2 mb-2.5">
                <span class="font-mono text-adm-sm font-bold text-primary-500 bg-accent-soft px-2 py-0.5 rounded-adm-sm">
                  {{ group.symbol }}
                </span>
                <span class="text-adm-sm font-semibold text-secondary-700">{{ group.name }}</span>
              </div>
              <ol class="list-none m-0 p-0 flex flex-col gap-2">
                <li
                  v-for="(item, index) in group.items"
                  :key="item.offer_id"
                  class="flex items-baseline justify-between gap-3"
                >
                  <span class="text-adm-base text-secondary-900 truncate">
                    <span class="font-mono text-adm-xs text-secondary-400 mr-1.5">{{ index + 1 }}</span>{{ item.offer_name }}
                  </span>
                  <span class="font-mono text-adm-sm font-bold text-secondary-900 shrink-0">{{ item.formatted }}</span>
                </li>
              </ol>
            </div>
          </div>
        </ReportSection>
      </div>
    </template>

    <!--
      Una tabla por cada dos monedas (una en pantallas angostas): "Tipo" a la
      izquierda y un bloque de columnas por moneda, a todo el ancho. Con más
      monedas se apilan tablas en vez de crecer hacia los lados.
    -->
    <div v-if="report" class="px-5.5 pb-3 text-adm-sm text-secondary-400">
      Generado: {{ generatedText }}
    </div>
    <div v-if="report" class="flex flex-col">
      <div
        v-for="(group, gi) in currencyGroups"
        :key="gi"
        class="overflow-x-auto border-t border-line"
      >
        <table class="w-full border-collapse table-fixed" :style="{ minWidth: `${12 + group.length * 31}rem` }">
          <colgroup>
            <col style="width: 11rem" />
            <template v-for="c in group" :key="c.currency ?? '—'">
              <col v-for="col in COLUMNS" :key="col.key" />
            </template>
          </colgroup>
          <thead>
            <tr>
              <th rowspan="2" class="text-left align-bottom px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold bg-admin-bg">
                Tipo
              </th>
              <th
                v-for="(c, index) in group"
                :key="c.currency ?? '—'"
                colspan="5"
                class="px-3 py-2.5 border-l border-line"
                :class="index % 2 === 0 ? 'bg-info-soft' : 'bg-success-soft'"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center gap-2 font-display text-adm-base font-bold text-secondary-900">
                    <span class="font-mono text-adm-sm font-bold text-primary-500 bg-surface-paper px-2 py-0.5 rounded-adm-sm">{{ c.symbol }}</span>
                    {{ c.name }}
                  </span>
                  <span v-if="collectionRate(c.currency) !== null" class="inline-flex items-center gap-2 font-normal">
                    <span class="text-adm-xs text-secondary-500">Cobrado</span>
                    <span class="relative h-1.5 w-20 rounded-full bg-surface-paper overflow-hidden">
                      <span
                        class="absolute inset-y-0 left-0 rounded-full bg-success-DEFAULT"
                        :style="{ width: `${collectionRate(c.currency)}%` }"
                      />
                    </span>
                    <span class="font-mono text-adm-sm font-bold text-secondary-900">{{ collectionRate(c.currency) }}%</span>
                  </span>
                </div>
              </th>
            </tr>
            <tr>
              <template v-for="(c, index) in group" :key="c.currency ?? '—'">
                <th
                  v-for="(col, ci) in COLUMNS"
                  :key="col.key"
                  class="text-right px-3 py-2 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold"
                  :class="[index % 2 === 0 ? 'bg-info-soft/60' : 'bg-success-soft/60', ci === 0 ? 'border-l border-line' : '']"
                >
                  {{ col.label }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.key"
              class="border-t border-line-soft"
              :class="row.key === 'total' ? 'bg-admin-bg' : 'adm-row'"
            >
              <td class="px-5.5 py-3 text-adm-base text-secondary-900" :class="row.key === 'total' ? 'font-display font-bold' : 'font-semibold'">
                <span class="inline-flex items-center gap-1.5">
                  {{ row.label }}
                  <TooltipCore :value="row.hint" tag="span" position="top" class="text-secondary-400 inline-flex">
                    <HeroCore :path="mdiInformationOutline" class="size-3.5" />
                  </TooltipCore>
                </span>
              </td>
              <template v-for="c in group" :key="c.currency ?? '—'">
                <td
                  v-for="(col, ci) in COLUMNS"
                  :key="col.key"
                  class="px-3 py-3 text-right font-mono text-adm-sm whitespace-nowrap"
                  :class="[
                    ci === 0 ? 'border-l border-line text-secondary-500' : 'text-secondary-900',
                    col.key === 'pending_formatted' && cell(row, c.currency).pending > 0 ? 'text-danger-DEFAULT font-bold' : '',
                    col.key === 'collected_formatted' || row.key === 'total' ? 'font-bold' : '',
                    col.key === 'cancelled_formatted' && cell(row, c.currency).cancelled === 0 ? 'text-secondary-400' : '',
                  ]"
                >
                  {{ cell(row, c.currency)[col.key] }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ul v-if="report?.notes.length" class="list-none m-0 px-5.5 py-4 border-t border-line-soft flex flex-col gap-1">
      <li v-for="note in report.notes" :key="note" class="text-adm-sm text-secondary-400">
        {{ note }}
      </li>
    </ul>
  </ReportLayout>
</template>
