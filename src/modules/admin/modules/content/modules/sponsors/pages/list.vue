<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import sponsorService from "../services/sponsor.service";
import type { Sponsor } from "../models/sponsor.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Sponsor>[] = [
  {
    field: "image",
    header: "Logo",
    type: "image",
    showFilterMenu: false,
    // Los logos vienen en proporciones distintas: contain los respeta.
    image: { fit: "contain", class: "h-10 w-auto max-w-32" },
  },
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => sponsorService.list(params),
      delete: (ids: (number | string)[]) => sponsorService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Patrocinadores"
    module="content/sponsors"
  />
</template>
