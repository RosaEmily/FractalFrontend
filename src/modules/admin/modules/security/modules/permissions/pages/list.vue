<script setup lang="ts">
import { onMounted } from "vue";
import permissionService from "../services/permission.service";

onMounted(async () => {
  await permissionService.list({ order: "created_at:desc" });
});
</script>
<template>list permission</template>
