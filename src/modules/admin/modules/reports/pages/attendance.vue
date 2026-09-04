<script setup lang="ts">
import { computed, ref } from "vue";
import { HeroCore, SelectCore } from "@/shared/components";
import { mdiInformationOutline } from "@mdi/js";
import reportService from "../services/report.service";
import { useReport } from "../composables/useReport";
import type { AttendanceReport, AttendanceRow } from "../models/report.model";
import ReportLayout from "../components/report-layout.vue";
import ReportTotals from "../components/report-totals.vue";
import ReportFiltersBar from "../components/report-filters.vue";
import ReportBar from "../components/report-bar.vue";
import { exportCsv } from "../utils/export-csv";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";

const { data, loading, apply } = useReport<AttendanceReport>((filters) =>
  reportService.attendance(filters),
);

const offerId = ref<number | null>(null);
const loadOffers = () => offerService.all();

const items = computed<AttendanceRow[]>(() => data.value?.items ?? []);
const totals = computed(() => data.value?.totals);

const totalCards = computed(() => {
  const t = totals.value;
  if (!t) return [];

  return [
    {
      label: "Asistencia promedio",
      value: t.percent === null ? "—" : `${t.percent}%`,
      hint: "presentes + tardanzas",
      tone: "success" as const,
    },
    {
      label: "Clases dictadas",
      value: t.sessions,
      hint: "en el periodo",
    },
    {
      label: `Cursos bajo el ${t.risk_threshold}%`,
      value: t.at_risk,
      hint: "requieren seguimiento",
      tone: t.at_risk > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Sesiones sin tomar",
      value: t.not_taken,
      hint: "el docente no registró",
      tone: t.not_taken > 0 ? ("danger" as const) : ("default" as const),
    },
  ];
});

const onExport = () =>
  exportCsv<AttendanceRow>("asistencia", [
    { header: "Curso", value: (r) => r.course_name },
    { header: "Cohorte", value: (r) => r.offer_name },
    { header: "Clases", value: (r) => r.sessions },
    { header: "Alumnos", value: (r) => r.students },
    { header: "Presentes", value: (r) => r.present },
    { header: "Tardanzas", value: (r) => r.late },
    { header: "Ausencias", value: (r) => r.absent },
    { header: "Sesiones sin tomar", value: (r) => r.not_taken },
    { header: "% asistencia", value: (r) => r.percent },
  ], items.value);
</script>

<template>
  <ReportLayout
    title="Asistencia"
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

    <table class="w-full min-w-262.5 border-collapse">
      <thead>
        <tr class="bg-admin-bg">
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Curso</th>
          <th class="text-left px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Cohorte</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Clases</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Alumnos</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Presentes</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Tardanzas</th>
          <th class="text-right px-3 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold">Ausencias</th>
          <th class="text-left px-5.5 py-2.5 font-mono text-adm-label text-secondary-500 tracking-wider uppercase font-semibold w-45">% asistencia</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in items"
          :key="row.offer_course_id"
          class="adm-row border-t border-line-soft"
        >
          <td class="px-5.5 py-3">
            <div class="text-adm-base font-semibold text-secondary-900">
              {{ row.course_name }}
            </div>
            <div
              v-if="row.not_taken > 0"
              class="text-adm-sm text-danger-DEFAULT font-semibold mt-0.5"
            >
              {{ row.not_taken }}
              {{ row.not_taken === 1 ? "sesión" : "sesiones" }} sin asistencia
              tomada
            </div>
          </td>
          <td class="px-3 py-3 text-adm-sm text-secondary-500">
            {{ row.offer_name }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.sessions }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-secondary-500">
            {{ row.students }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm font-bold text-success-DEFAULT">
            {{ row.present }}
          </td>
          <td class="px-3 py-3 text-right font-mono text-adm-sm text-amber-DEFAULT">
            {{ row.late }}
          </td>
          <td
            class="px-3 py-3 text-right font-mono text-adm-sm"
            :class="row.absent > 0 ? 'text-danger-DEFAULT' : 'text-secondary-400'"
          >
            {{ row.absent }}
          </td>
          <td class="px-5.5 py-3">
            <ReportBar
              :percent="row.percent"
              :threshold="totals?.risk_threshold ?? 85"
              empty-label="Sin asistencia"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Nota del diseño: qué se reporta y qué no -->
    <div
      class="px-5.5 py-3.5 border-t border-line bg-admin-bg flex gap-2.5 items-start"
    >
      <HeroCore
        :path="mdiInformationOutline"
        class="size-4 shrink-0 mt-0.5 text-secondary-400"
      />
      <p class="text-adm-sm text-secondary-500 leading-relaxed">
        Solo se reportan los estados oficiales de asistencia: presente,
        tardanza y ausente. Hora de ingreso, hora de salida y puntaje de
        participación existen en la base pero no están en ninguna migración —
        se agregan cuando el negocio los confirme.
      </p>
    </div>
  </ReportLayout>
</template>
