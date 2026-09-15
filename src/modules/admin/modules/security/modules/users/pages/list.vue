<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import AvatarCell from "@/modules/admin/components/ui/avatar-cell.vue";
import userService from "../services/user.service";
import roleService from "../../roles/services/role.service";
import type { User } from "../models/user.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<User>[] = [
  {
    field: "full_name",
    header: "Usuario",
    sortable: true,
    // `full_name` se compone en el Resource; la columna real es `first_name`.
    sortField: "first_name",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // El diseño usa una sola celda: avatar de iniciales + nombre + correo.
    type: "custom",
    render: (row: User) =>
      h(AvatarCell, {
        name: row.full_name,
        secondary: row.email,
        photo: row.photo_url,
      }),
  },
  {
    field: "roles",
    header: "Rol",
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.IN },
    filterConfig: {
      component: "multiselect",
      multiselectProps: {
        filter: true,
        optionLabel: "name",
        optionValue: "id",
        placeholder: "Ingrese roles",
        service: () => roleService.all(),
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
      list: (params: unknown) => userService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        userService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => userService.delete(ids),
    }"
    :show-updated-at="false"
    title="Usuarios del panel"
    module="security/users"
  />
</template>
