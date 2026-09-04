<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import jobOfferService from "../services/job-offer.service";
import type { JobOffer } from "../models/job-offer.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<JobOffer>[] = [
  {
    field: "title",
    header: "Puesto",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: JobOffer) =>
      h("span", { class: "text-adm-base font-bold text-secondary-900" }, row.title),
  },
  {
    field: "company",
    header: "Empresa",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "location",
    header: "Ubicación",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "source",
    header: "Fuente",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: JobOffer) =>
      row.source
        ? h(StatusPill, { label: row.source, tone: "neutral", dot: false })
        : h("span", { class: "text-secondary-400" }, "—"),
  },
  {
    field: "postedAt",
    header: "Publicado",
    sortable: true,
    sortField: "posted_at",
    showFilterMenu: false,
    type: "custom",
    render: (row: JobOffer) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.postedAt ?? "—",
      ),
  },
  {
    // El diseño marca en rojo las ofertas cuyo scraping falló.
    field: "scrapeFailed",
    header: "Scraping",
    showFilterMenu: false,
    type: "custom",
    render: (row: JobOffer) =>
      row.scrapeFailed
        ? h(StatusPill, { label: "Error de scraping", tone: "danger" })
        : h("span", { class: "text-secondary-400" }, "—"),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => jobOfferService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        jobOfferService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => jobOfferService.delete(ids),
    }"
    :show-updated-at="false"
    title="Bolsa de trabajo"
    module="jobs/job-offers"
  />
</template>
