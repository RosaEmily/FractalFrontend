<template>
  <router-view />
  <ToastAlert />
</template>

<script setup lang="ts">
  import ToastAlert from '@/components/ui/ToastAlert.vue'
</script>