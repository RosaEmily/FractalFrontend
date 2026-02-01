<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import roleService from "../services/role.service";
import permissionService from "../../permissions/services/permission.service";
import type { Role } from "../models/role.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Role>[] = [
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
  {
    field: "permissions",
    header: "Permisos",
    showFilterMenu: false,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.IN },
    filterConfig: {
      component: "multiselect",
      multiselectProps: {
        filter: true,
        optionLabel: "name",
        optionValue: "id",
        placeholder: "Ingrese permisos",
        service: () => permissionService.all(),
        autoLoad: true,
      },
    },
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => roleService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        roleService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => roleService.delete(ids),
    }"
    title="Lista de Roles"
    module="security/roles"
  />
</template>
