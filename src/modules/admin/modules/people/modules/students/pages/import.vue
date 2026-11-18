<script setup lang="ts">
import BulkImport from "@/modules/admin/components/ui/bulk-import.vue";
import { STUDENT_IMPORT_COLUMNS } from "../constants/import";
</script>

<template>
  <BulkImport
    title="Importar estudiantes"
    entity="estudiantes"
    kind="students"
    redirect="students.list"
    :columns="STUDENT_IMPORT_COLUMNS"
  />
</template>
