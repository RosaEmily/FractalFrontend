<script setup lang="ts">
import { CardCore, GripUi } from "@/shared/components";
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
  {
    field: "actions",
    header: "Acciones",
    actions: [
      {
        type: "edit",
        redirect: "/admin/security/permissions/edit/{id}",
      },
      {
        type: "state",
        handler: (ids: (number | string)[], state?: 0 | 1) =>
          permissionService.status(ids, state ?? 1),
      },
      {
        type: "delete",
        handler: (ids: (number | string)[]) => permissionService.delete(ids),
      },
    ],
  },
];
</script>
<template>
  <CardCore>
    <GripUi
      :reload="(params: unknown) => permissionService.list(params)"
      :columns="columns"
      title="Lista de Permisos"
    />
  </CardCore>
</template>
