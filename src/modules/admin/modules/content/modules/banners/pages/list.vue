<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import bannerService from "../services/banner.service";
import type { Banner } from "../models/banner.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const columns: GridUiColumnProps<Banner>[] = [
  {
    field: "desktop",
    header: "Escritorio",
    type: "image",
    showFilterMenu: false,
    // Banner apaisado: se muestra completo, sin recortar.
    image: { fit: "contain", class: "h-12 w-auto max-w-56" },
  },
  {
    field: "mobile",
    header: "Móvil",
    type: "image",
    showFilterMenu: false,
    // El de móvil es más vertical: menos ancho máximo.
    image: { fit: "contain", class: "h-12 w-auto max-w-28" },
  },
  { field: "alt_desktop", header: "Alt escritorio", showFilterMenu: false },
  { field: "alt_mobile", header: "Alt móvil", showFilterMenu: false },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => bannerService.list(params),
      delete: (ids: (number | string)[]) => bannerService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Lista de banners"
    module="content/banners"
  />
</template>
