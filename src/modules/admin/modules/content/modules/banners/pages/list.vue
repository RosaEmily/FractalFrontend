<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import bannerService from "../services/banner.service";
import type { Banner } from "../models/banner.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import dayjs from "dayjs";

/** Quita el `**acento**` del título para el listado: es marcado, no contenido. */
const plainTitle = (title: string | null): string =>
  (title ?? "").replace(/\*\*/g, "") || "—";

const formatShortDate = (date: string | null): string =>
  date ? dayjs(date).format("DD MMM").toUpperCase() : "—";

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
  {
    field: "title",
    header: "Contenido",
    showFilterMenu: false,
    type: "custom",
    render: (row: Banner) =>
      h(StackedCell, {
        primary: plainTitle(row.title),
        secondary: [row.tag, row.kicker].filter(Boolean).join(" · ") || null,
        mono: false,
        plain: true,
      }),
  },
  {
    field: "cta",
    header: "Botones",
    showFilterMenu: false,
    type: "custom",
    render: (row: Banner) =>
      row.cta
        ? h("div", { class: "flex flex-col gap-1 items-start" }, [
            h(StatusPill, { label: row.cta, tone: "accent", dot: false }),
            row.cta2
              ? h(StatusPill, { label: row.cta2, tone: "neutral", dot: false })
              : null,
          ])
        : h("span", { class: "text-adm-sm text-secondary-400" }, "Sin botón"),
  },
  {
    field: "offerId",
    header: "Oferta asociada",
    showFilterMenu: false,
    type: "custom",
    render: (row: Banner) =>
      row.meta?.offerName
        ? h(StackedCell, {
            primary: row.meta.offerName,
            secondary: `${formatShortDate(row.meta.offerEnrollmentStartDate)} – ${formatShortDate(row.meta.offerEnrollmentEndDate)}`,
            mono: false,
            plain: true,
          })
        : h("span", { class: "text-adm-sm text-secondary-400" }, "Sin oferta"),
  },
  {
    field: "order",
    header: "Orden",
    style: "width: 90px",
    showFilterMenu: false,
    type: "custom",
    render: (row: Banner) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-900" },
        row.order ?? "—",
      ),
  },
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
