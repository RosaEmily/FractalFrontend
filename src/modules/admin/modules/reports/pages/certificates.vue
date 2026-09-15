<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { SelectCore } from "@/shared/components";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { CertificateReport, CertificateRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";

const { data, loading, apply } = useReport<CertificateReport>((filters) =>
  reportService.certificates(filters),
);

/** Filtro local: la API devuelve todo y el corte es sobre lo ya cargado. */
const status = ref<"pending" | "up_to_date" | null>(null);

const STATUS_OPTIONS = [
  { label: "Con pendientes", value: "pending" },
  { label: "Al día", value: "up_to_date" },
];

const items = computed<CertificateRow[]>(() => {
  const rows = data.value?.items ?? [];
  if (status.value === "pending") return rows.filter((r) => r.pending > 0);
  if (status.value === "up_to_date") return rows.filter((r) => r.pending === 0);
  return rows;
});

const totals = computed(() => data.value?.totals);

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Emitidos en el periodo",
      value: t.issued,
      hint: `de ${t.approved} aprobados`,
      tone: "success" as const,
    },
    {
      label: "Pendientes de emitir",
      value: t.pending,
      hint: "aprobados sin certificado",
      tone: t.pending > 0 ? ("danger" as const) : ("default" as const),
    },
    {
      label: "Cobertura",
      value: t.coverage === null ? "—" : `${t.coverage}%`,
      hint: "emitidos sobre aprobados",
    },
    {
      label: "Cursos al día",
      value: `${t.up_to_date}/${t.courses}`,
      hint: "sin nada por emitir",
    },
  ];
});

const date = (value: string | null) =>
  value ? dayjs(value).format("DD/MM/YYYY") : "—";

const onExport = () =>
  exportCsv<CertificateRow>("certificados-emitidos", [
    { header: "Curso", value: (r) => r.course_name },
    { header: "Cohorte", value: (r) => r.offer_name },
    { header: "Aprobados", value: (r) => r.approved },
    { header: "Emitidos", value: (r) => r.issued },
    { header: "Pendientes", value: (r) => r.pending },
    { header: "Último emitido", value: (r) => date(r.last_issued) },
    { header: "Cobertura %", value: (r) => r.coverage },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Certificados emitidos"
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
      >
        <template #extra>
          <div class="min-w-47.5">
            <span
              class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
            >
              ESTADO
            </span>
            <SelectCore
              v-model="status"
              :options="STATUS_OPTIONS"
              option-label="label"
              option-value="value"
              placeholder="Todos"
              show-clear
            />
          </div>
        </template>
      </ReportFiltersBar>
    </template>

    <table class="w-full min-w-237.5 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Curso</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cohorte</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Aprobados</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Emitidos</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Pendientes</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Último emitido</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">Cobertura</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in items"
          :key="row.offer_course_id"
          class="adm-row border-t border-line-soft"
        >
          <td class="px-5.5 py-3 text-adm-base font-semibold text-secondary-900">
            {{ row.course_name }}
          </td>
          <td class="px-3 py-3 text-adm-sm text-secondary-500">
            {{ row.offer_name }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.approved }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ row.issued }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.pending > 0 ? 'text-danger-DEFAULT font-bold' : 'text-secondary-400'"
          >
            {{ row.pending || "—" }}
          </td>
          <td class="px-3 py-3 font-mono text-adm-sm text-secondary-500">
            {{ date(row.last_issued) }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar :percent="row.coverage" :threshold="95" />
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
