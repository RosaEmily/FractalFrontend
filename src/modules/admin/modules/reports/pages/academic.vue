<script setup lang="ts">
import { computed, ref } from "vue";
import { SelectCore } from "@/shared/components";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { AcademicReport, AcademicRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";

const { data, loading, apply } = useReport<AcademicReport>((filters) =>
  reportService.academic(filters),
);

const offerId = ref<number | null>(null);
const loadOffers = () => offerService.all();

const items = computed<AcademicRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Tasa de aprobación",
      // null cuando no hay notas: un 0% se leería como "nadie aprobó".
      value: t.approved_percent === null ? "—" : `${t.approved_percent}%`,
      hint: `${t.approved} de ${t.graded} calificados`,
      tone: "success" as const,
    },
    {
      label: "Notas finales",
      value: t.graded,
      hint: "registradas en el periodo",
    },
    {
      label: "Cursos sin calificar",
      value: t.ungraded_courses,
      hint: "evaluaciones pendientes",
      tone: t.ungraded_courses > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Promedio general",
      value: t.average === null ? "—" : t.average.toFixed(1),
      hint: "escala 0–20",
    },
  ];
});

const onExport = () =>
  exportCsv<AcademicRow>("rendimiento-academico", [
    { header: "Curso", value: (r) => r.course_name },
    { header: "Cohorte", value: (r) => r.offer_name },
    { header: "Alumnos", value: (r) => r.students },
    { header: "Calificados", value: (r) => r.graded },
    { header: "Aprobados", value: (r) => r.approved },
    { header: "Promedio", value: (r) => r.average },
    { header: "% aprobación", value: (r) => r.approved_percent },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Rendimiento académico"
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
        @apply="(range) => apply({ ...range, offer_id: offerId ?? undefined })"
        @export="onExport"
      >
        <template #extra>
          <div class="min-w-47.5">
            <span
              class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
            >
              COHORTE
            </span>
            <SelectCore
              v-model="offerId"
              :service="loadOffers"
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

    <table class="w-full min-w-237.5 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Curso</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cohorte</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Alumnos</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Calificados</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Aprobados</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Promedio</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-47.5">% aprobación</th>
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
            {{ row.students }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.graded === 0 ? 'text-amber-DEFAULT font-bold' : 'text-secondary-500'"
          >
            {{ row.graded }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-secondary-900">
            {{ row.graded === 0 ? "—" : row.approved }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.average === null ? "—" : row.average.toFixed(1) }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar
              :percent="row.approved_percent"
              :threshold="80"
              empty-label="Sin calificar"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </ReportLayout>
</template>
