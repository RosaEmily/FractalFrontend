<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  sub?: string;
}>();
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div class="min-w-0">
      <span
        v-if="eyebrow"
        class="font-mono text-adm-xs text-secondary-400 tracking-[0.08em] uppercase"
      >
        {{ eyebrow }}
      </span>
      <h1
        class="font-display text-aula-title font-bold text-secondary-900 tracking-tight leading-[1.05]"
        :class="eyebrow ? 'mt-2' : ''"
      >
        {{ title }}
      </h1>
      <p v-if="sub" class="text-adm-base text-secondary-500 mt-2 max-w-160">
        {{ sub }}
      </p>
    </div>
    <div class="shrink-0"><slot name="actions" /></div>
  </header>
</template>
