<script setup lang="ts">
import { ref } from "vue";
import LandingImage from "@/modules/landing/components/ui/LandingImage.vue";
import LandingBadge from "@/modules/landing/components/ui/LandingBadge.vue";
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
    class="rounded-adm-lg border bg-surface-paper p-4 shadow-sm md:flex md:items-center md:gap-5 md:p-[1.125rem]"
    :class="problem ? 'border-danger-DEFAULT/40 bg-danger-soft/30' : 'border-line'"
  >
    <!-- `md:contents` aplana este bloque en escritorio: imagen, info y precio
         pasan a ser hijos directos de la fila. -->
    <div class="flex items-start gap-3.5 md:contents">
    <!-- LandingImage expone `imgClass`, no `class`: un `class` suelto cae en el
         wrapper y la imagen queda sin dimensionar. Y resuelve solo el caso de
         `image_url` vacío, frecuente en las ofertas de prueba. -->
    <LandingImage
      :src="item.imageUrl"
      :alt="`Imagen de ${item.name}`"
      :fallback-text="item.prefix"
      img-class="size-16 shrink-0 rounded-adm-md object-cover md:size-24"
      fallback-class="grid size-16 shrink-0 place-items-center rounded-adm-md bg-surface-cream font-mono text-[0.5rem] text-secondary-400 md:size-24 md:text-xs"
    />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <LandingBadge :variant="item.isPath ? 'tint' : 'soft'" size="sm">{{ item.kind }}</LandingBadge>
        <span class="hidden font-mono text-[0.656rem] tracking-[0.04em] text-secondary-400 md:inline">{{ item.prefix }}</span>
      </div>
      <h3 class="mt-1.5 font-display text-base leading-tight font-bold tracking-tight text-secondary-900 md:text-[1.188rem]">
        {{ item.name }}
      </h3>
      <p v-if="item.meta" class="mt-1 flex items-center gap-1.5 text-[0.813rem] text-secondary-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-secondary-400" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 7V12L15.5 14" />
        </svg>
        {{ item.meta }}
      </p>

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

      <span class="shrink-0 font-display text-lg font-extrabold tracking-tight whitespace-nowrap text-secondary-900 md:hidden">
        {{ formatMoney(item.price) }}
      </span>
    </div>

    <div class="mt-3.5 flex items-center justify-between gap-4 border-t border-line-soft pt-3.5 md:mt-0 md:flex-col md:items-end md:gap-2.5 md:border-0 md:pt-0">
      <span class="hidden font-display text-[1.438rem] font-extrabold tracking-tight whitespace-nowrap text-secondary-900 md:inline">
        {{ formatMoney(item.price) }}
      </span>
      <span class="font-mono text-[0.656rem] tracking-[0.04em] text-secondary-400">
        1 CUPO<span class="md:hidden"> · NO ACUMULABLE</span>
      </span>
      <button
        type="button"
        class="flex cursor-pointer items-center gap-1.5 text-[0.781rem] text-secondary-400 transition-colors hover:text-danger-DEFAULT"
        @click="confirmRemove = true"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
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
