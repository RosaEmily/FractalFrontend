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
  <div class="flex min-h-0 h-dvh">
    <slot name="left" v-if="showLeft" />

    <main class="bg-gray-200 flex-1 flex flex-col" :class="classMain">
      <slot name="header" v-if="showHeader" />

      <div class="flex flex-1 gap-3 overflow-y-auto" :class="classContainer">
        <slot name="container" v-if="showContainer">
          <div class="flex-1 flex flex-col">
            <div class="flex-1 px-10 py-5 overflow-y-auto my-1 mr-1">
              <slot />
            </div>

            <slot name="container-footer" v-if="showContainerFooter">
              <footer class="p-5" :class="classFooter">
                <slot name="footer" v-if="showFooter" />
              </footer>
            </slot>
          </div>
        </slot>
      </div>
    </main>

    <slot name="right" v-if="showRight" />
  </div>
</template>
