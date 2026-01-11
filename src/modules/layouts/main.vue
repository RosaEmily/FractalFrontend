<script setup lang="ts">
import { ToastCore } from "@/shared/components";
import AlertComponent from "../components/alert/index.vue";
</script>
<template>
  <main>
    <router-view />
  </main>
  <ToastCore />
  <AlertComponent />
</template>
