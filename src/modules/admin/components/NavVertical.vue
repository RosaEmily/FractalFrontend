<script setup lang="ts">
import { ContentWrapperUi, AvatarCore } from "@/shared/components";

const props = withDefaults(
  defineProps<{
    avatar?: string;
    fullName?: string;
    role?: string;
  }>(),
  {
    avatar: "",
    fullName: "",
    role: "",
  }
);
</script>
<template>
  <ContentWrapperUi class="w-72 !h-auto">
    <template #header>
      <div class="flex gap-5 items-center">
        <div>
          <AvatarCore size="large" :text="avatar" shape="circle" />
        </div>
        <div class="text-sm">
          <div>
            {{ fullName }}
          </div>
          <div>
            {{ role }}
          </div>
        </div>
      </div>
    </template>
    <template #container>
      <div>contenido</div>
    </template>
  </ContentWrapperUi>
</template>
