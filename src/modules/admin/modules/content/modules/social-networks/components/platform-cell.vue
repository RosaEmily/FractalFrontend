<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import type { SocialNetwork } from "../models/social-network.model";

defineProps<{ row: SocialNetwork }>();
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="size-6.5 rounded-full bg-accent-soft text-primary-600 inline-flex items-center justify-center shrink-0"
    >
      <HeroCore :path="row.icon" class="size-3.5" />
    </span>
    <span class="text-adm-base font-semibold text-secondary-900 capitalize">
      {{ row.name }}
    </span>
  </div>
</template>
