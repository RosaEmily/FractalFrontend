<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import socialNetworkService from "../services/social-network.service";
import PlatformCell from "../components/platform-cell.vue";
import type { SocialNetwork } from "../models/social-network.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<SocialNetwork>[] = [
  {
    field: "name",
    header: "Plataforma",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // El diseño muestra el icono de la red junto al nombre capitalizado.
    type: "custom",
    render: (row: SocialNetwork) => h(PlatformCell, { row }),
  },
  {
    field: "url",
    header: "URL",
    showFilterMenu: false,
    // Texto mono gris, no enlace subrayado (así está en el diseño).
    type: "custom",
    render: (row: SocialNetwork) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500 truncate" },
        row.url,
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => socialNetworkService.list(params),
      delete: (ids: (number | string)[]) => socialNetworkService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Redes sociales"
    module="content/social-networks"
  />
</template>
