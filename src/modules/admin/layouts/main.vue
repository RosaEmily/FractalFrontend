<script setup lang="ts">
import LayoutStructure from "@/modules/components/structure/index.vue";
</script>
<template>
  <div>
    <LayoutStructure :show-container-footer="false" :show-right="false">
      <template #left>
        <div>asdasd</div>
      </template>
      <section>
        <router-view />
      </section>
    </LayoutStructure>
  </div>
</template>
