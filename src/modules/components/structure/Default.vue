<script lang="ts" setup>
import type { ClassNameValue } from "@/shared/interface/class";

withDefaults(
  defineProps<{
    classMain?: ClassNameValue;
    classContainer?: ClassNameValue;
    classFooter?: ClassNameValue;

    showLeft?: boolean;
    showHeader?: boolean;
    showContainer?: boolean;
    showRight?: boolean;
    showFooter?: boolean;
    showContainerFooter?: boolean;
  }>(),
  {
    showLeft: true,
    showHeader: true,
    showContainer: true,
    showRight: true,
    showFooter: true,
    showContainerFooter: true,
  }
);
</script>

<template>
  <div class="flex min-h-0 h-full">
    <slot name="left" v-if="showLeft" />
    <main class="bg-gray-200 flex-1 min-w-0 flex flex-col" :class="classMain">
      <slot name="header" v-if="showHeader" />
      <div
        class="flex flex-1 px-10 py-5 gap-5 overflow-y-auto mr-1 my-1"
        :class="classContainer"
      >
        <slot name="container" v-if="showContainer">
          <div class="flex-1 min-w-0">
            <slot />
          </div>
          <div class="sticky top-0" v-if="showRight">
            <slot name="right" />
          </div>
        </slot>
      </div>
      <slot name="container-footer" v-if="showContainerFooter">
        <footer
          class="bg-white border-t border-grayscale-600 p-5"
          :class="classFooter"
        >
          <slot name="footer" v-if="showFooter" />
        </footer>
      </slot>
    </main>
  </div>
</template>
