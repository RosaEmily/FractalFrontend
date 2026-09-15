<script setup lang="ts">
import { ref } from "vue";
import LandingImage from "@/modules/landing/components/ui/LandingImage.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import type { CartItem, CartProblem } from "../models/checkout.model";
import { formatMoney } from "../utils/money";

const props = defineProps<{ item: CartItem; problem?: CartProblem | null }>();
const emit = defineEmits<{ remove: [offerId: number] }>();

/*
 * Quitar se confirma: el botón está junto al precio y es fácil de pulsar por
 * error, y volver a agregar obliga a rehacer el camino desde el catálogo.
 */
const confirmRemove = ref(false);

const doRemove = () => {
  confirmRemove.value = false;
  emit("remove", props.item.offerId);
};
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-adm-lg border bg-surface-paper p-4 sm:flex-row sm:items-center sm:p-5"
    :class="problem ? 'border-danger-DEFAULT/40 bg-danger-soft/30' : 'border-line'"
  >
    <!-- LandingImage expone `imgClass`, no `class`: un `class` suelto cae en el
         wrapper y la imagen queda sin dimensionar. Y resuelve solo el caso de
         `image_url` vacío, frecuente en las ofertas de prueba. -->
    <LandingImage
      :src="item.imageUrl"
      :alt="`Imagen de ${item.name}`"
      :fallback-text="item.prefix"
      img-class="h-20 w-full shrink-0 rounded-adm-md object-cover sm:w-28"
      fallback-class="grid h-20 w-full shrink-0 place-items-center rounded-adm-md bg-surface-cream font-mono text-xs text-secondary-400 sm:w-28"
    />

    <div class="min-w-0 flex-1">
      <p class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
        {{ item.prefix }} · {{ item.kind }}
      </p>
      <h3 class="mt-1 font-display text-base font-bold text-secondary-900">
        {{ item.name }}
      </h3>
      <p class="mt-1 text-[0.813rem] text-secondary-500">{{ item.meta }}</p>

      <!-- El motivo se muestra en la propia línea: en un carrito mixto, un
           aviso global no dice cuál de los programas falla. -->
      <p
        v-if="problem"
        class="mt-2 flex items-start gap-1.5 text-[0.813rem] font-medium text-danger-DEFAULT"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" class="mt-0.5 shrink-0" aria-hidden="true">
          <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 5v3.4M8 10.8v.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span>{{ problem.message }}</span>
      </p>
    </div>

    <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
      <span class="font-display text-lg font-bold whitespace-nowrap text-secondary-900">
        {{ formatMoney(item.price) }}
      </span>
      <button
        type="button"
        class="cursor-pointer text-[0.813rem] font-medium text-secondary-400 underline transition-colors hover:text-danger-DEFAULT"
        @click="confirmRemove = true"
      >
        Quitar
      </button>
    </div>

    <ConfirmDialog
      :open="confirmRemove"
      danger
      title="¿Quitar este programa?"
      :body="`Se eliminará «${item.name}» de tu carrito. Puedes volver a agregarlo desde el catálogo.`"
      confirm-label="Sí, quitar"
      cancel-label="Mantenerlo"
      @confirm="doRemove"
      @dismiss="confirmRemove = false"
    />
  </article>
</template>
