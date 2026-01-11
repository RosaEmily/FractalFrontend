<script setup lang="ts">
import type { ContentWrapperProps } from "./type";
withDefaults(defineProps<ContentWrapperProps>(), {});
</script>
<template>
    <div class="flex flex-col space-y-6 min-h-0 h-dvh">
        <div :class="headerClass" class="px-4 pt-4">
            <slot name="header" />
        </div>
        <div
            class="flex-1 overflow-y-auto mr-2 pr-2 pl-4"
            :class="containerClass"
        >
            <slot name="container" />
        </div>
        <div :class="footerClass" class="px-4 pb-4">
            <slot name="footer" />
        </div>
    </div>
</template>
