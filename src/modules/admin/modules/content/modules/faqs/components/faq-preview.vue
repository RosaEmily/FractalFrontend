<script setup lang="ts">
/** Vista previa de una pregunta con el acordeón real de la página de contacto. */
import { ref } from "vue";
import FaqItem from "@/modules/landing/components/blocks/FaqItem.vue";
import LandingFrame from "../../../components/landing-frame.vue";

defineProps<{ question: string | null; answer: string | null }>();

const open = ref(true);
</script>

<template>
  <LandingFrame :width="900">
    <div class="bg-surface-paper p-8">
      <FaqItem
        :question="question || 'Tu pregunta aquí'"
        :answer="answer || 'Tu respuesta aquí'"
        :open="open"
        @toggle="open = !open"
      />
    </div>
  </LandingFrame>
</template>
