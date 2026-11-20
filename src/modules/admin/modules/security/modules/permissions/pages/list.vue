<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import permissionService from "../services/permission.service";
import type { Permission } from "../models/permission.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

/*
 * Los permisos del catálogo los define el backend: de ellos solo se edita la
 * descripción. Crear, deshabilitar y eliminar existen solo para ADMIN y solo
 * sobre permisos creados a mano (los del catálogo quedan bloqueados por fila).
 * Los botones aparecen únicamente con los permisos PERMISSIONS_*.
 */
const columns: GridUiColumnProps<Permission>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  },
  {
    field: "description",
    header: "Descripción",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => permissionService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        permissionService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => permissionService.delete(ids),
    }"
    :row-locked="(permission: Permission) => permission.isSystem"
    title="Lista de permisos"
    module="security/permissions"
  />
</template>
