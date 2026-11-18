<script setup lang="ts">
import BulkImport from "@/modules/admin/components/ui/bulk-import.vue";
import { TEACHER_IMPORT_COLUMNS } from "../constants/import";
</script>

<template>
  <BulkImport
    title="Importar docentes"
    entity="docentes"
    kind="teachers"
    redirect="teachers.list"
    :columns="TEACHER_IMPORT_COLUMNS"
  />
</template>
