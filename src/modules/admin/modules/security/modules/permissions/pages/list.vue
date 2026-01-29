<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import permissionService from "../services/permission.service";
import type { Permission } from "../models/permission.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const columns: GridUiColumnProps<Permission>[] = [
  {
    field: "name",
    header: "Nombre",
  },
  {
    field: "description",
    header: "Descripción",
  },
  {
    field: "created_at",
    header: "Fecha de creación",
    type: "date",
  },
  {
    field: "updated_at",
    header: "Fecha de actualización",
    type: "date",
  },
  {
    field: "status",
    header: "Estado",
    type: "state",
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
    title="Lista de Permisos"
    module="security/permissions"
  />
</template>
