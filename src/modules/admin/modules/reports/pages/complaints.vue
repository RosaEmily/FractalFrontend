<script setup lang="ts">
import { mdiCheckCircleOutline } from "@mdi/js";
import { computed } from "vue";
import dayjs from "dayjs";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { ComplaintDueState, ComplaintRowDTO, ComplaintsReportDTO } from "../dto/management.dto";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import { exportCsv } from "../utils/export-csv";

// Foto de hoy: los reclamos se miden contra su plazo legal, sin filtro de fechas.
const { data, initializing, refreshing } = useReport<ComplaintsReportDTO>(() =>
  reportService.complaints(),
);

const items = computed<ComplaintRowDTO[]>(() => data.value?.items ?? []);

const DUE_STATES: Record<ComplaintDueState, { label: string; class: string }> = {
  overdue: { label: "Vencido", class: "bg-danger-soft text-danger-DEFAULT" },
  due_soon: { label: "Por vencer", class: "bg-amber-soft text-amber-DEFAULT" },
  on_time: { label: "A tiempo", class: "bg-success-soft text-success-DEFAULT" },
};

const TYPES: Record<string, string> = { complaint: "Queja", claim: "Reclamo" };

const leftText = (row: ComplaintRowDTO) => {
  if (row.days_left === null) return "sin plazo";
  if (row.days_left < 0) return `venció hace ${Math.abs(row.days_left)} ${Math.abs(row.days_left) === 1 ? "día" : "días"}`;
  if (row.days_left === 0) return "vence hoy";
  return `faltan ${row.days_left} ${row.days_left === 1 ? "día" : "días"}`;
};

const totalCards = computed(() => {
  const t = data.value?.totals;
  if (!t) return [];

  return [
    { label: "Sin responder", value: t.open, hint: "hojas abiertas hoy" },
    {
      label: "Vencidos",
      value: t.overdue,
      hint: "pasaron su plazo de respuesta",
      tone: t.overdue > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Por vencer",
      value: t.due_soon,
      hint: `en ${t.due_soon_days} días o menos`,
      tone: t.due_soon > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Tiempo de respuesta",
      value: t.average_response_days === null ? "—" : `${t.average_response_days} días`,
      hint:
        t.answered_on_time_percent === null
          ? "aún no hay reclamos respondidos"
          : `${t.answered_on_time_percent}% respondido a tiempo · ${t.answered_year} en el último año`,
    },
  ];
});

const onExport = () =>
  exportCsv<ComplaintRowDTO>("reclamos-por-vencer", [
    { header: "Código", value: (r) => r.code },
    { header: "Tipo", value: (r) => TYPES[r.type] ?? r.type },
    { header: "Reclamante", value: (r) => r.name },
    { header: "Ingreso", value: (r) => r.created_at },
    { header: "Vence", value: (r) => r.due_at },
    { header: "Estado", value: (r) => DUE_STATES[r.due_state].label },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Reclamos sin responder"
    :count="items.length"
    :loading="initializing"
    :refreshing="refreshing"
    :empty="!items.length"
    empty-title="Todo al día"
    empty-text="No hay reclamos sin responder."
    empty-tone="success"
    :empty-icon="mdiCheckCircleOutline"
  >
    <template #totals>
      <ReportTotals :items="totalCards" :loading="initializing" />
    </template>

    <div class="px-5.5 pb-3 flex items-center justify-between gap-3">
      <p class="text-adm-sm text-secondary-400 m-0">
        Los de plazo más cercano primero. El plazo legal es de 15 días hábiles.
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
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Código</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Reclamante</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Tipo</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Ingreso</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Vence</th>
          <th class="text-right px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id" class="adm-row border-t border-line-soft">
          <td class="px-5.5 py-3 font-mono text-adm-sm font-bold text-secondary-900">{{ row.code }}</td>
          <td class="px-3 py-3 text-adm-base text-secondary-900">{{ row.name }}</td>
          <td class="px-3 py-3 text-adm-sm text-secondary-500">{{ TYPES[row.type] ?? row.type }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">{{ dayjs(row.created_at).format("DD/MM/YYYY") }}</td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-900">
            {{ row.due_at ? dayjs(row.due_at).format("DD/MM/YYYY") : "—" }}
            <div class="text-adm-label text-secondary-400">{{ leftText(row) }}</div>
          </td>
          <td class="px-5.5 py-3 text-right">
            <span class="font-mono text-adm-xs font-bold px-2 py-0.5 rounded-pill" :class="DUE_STATES[row.due_state].class">
              {{ DUE_STATES[row.due_state].label }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
