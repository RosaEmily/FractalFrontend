<script setup lang="ts">
import { ToastCore, ConfirmationCore } from "@/shared/components";
import AlertComponent from "../components/alert/index.vue";
</script>
<template>
  <main>
    <router-view />
  </main>
  <ToastCore />
  <ConfirmationCore />
  <AlertComponent />
</template>
