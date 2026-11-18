<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BulkImport from "@/modules/admin/components/ui/bulk-import.vue";
import { generatePassword } from "@/shared/utils/password-schema";
import { useToastStore } from "@/shared/stores/useToastStore";
import userService from "@/modules/admin/modules/security/modules/users/services/user.service";
import roleService from "@/modules/admin/modules/security/modules/roles/services/role.service";
import { STUDENT_IMPORT_COLUMNS, studentImportSchema } from "../constants/import";

/**
 * Alta masiva de estudiantes. Igual que el alta individual, cada fila crea un
 * USUARIO con rol STUDENT (`security/users`) con una contraseña temporal
 * generada aquí: el reporte final es la única vez que se muestra.
 */
const router = useRouter();
const toast = useToastStore();
const roleId = ref<number | null>(null);

onMounted(async () => {
  const roles = await roleService.all();
  roleId.value = roles.find((role) => role.name === "STUDENT")?.id ?? null;
  if (!roleId.value) {
    toast.showToastError({ detail: "No encontramos el rol STUDENT. Créalo en Seguridad → Roles." });
    router.replace({ name: "students.list" });
  }
});

const build = (row: Record<string, unknown>) => {
  const password = generatePassword();
  return { body: { ...row, password, roles: [roleId.value] } as Record<string, unknown>, secret: password };
};
</script>

<template>
  <BulkImport
    title="Importar estudiantes"
    entity="estudiantes"
    redirect="students.list"
    :columns="STUDENT_IMPORT_COLUMNS"
    :schema="studentImportSchema"
    :unique-keys="['email', 'document_number']"
    :identity="['first_name', 'last_name', 'email']"
    secret-label="Contraseña temporal"
    :build="build"
    :send="(body) => userService.create(body as never)"
  />
</template>
