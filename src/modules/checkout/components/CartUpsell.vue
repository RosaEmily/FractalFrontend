<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { mdiPlus } from "@mdi/js";

import { HeroCore } from "@/shared/components";
import LandingImage from "@/modules/landing/components/ui/LandingImage.vue";
import { offerService } from "@/modules/landing/services/offer.service";
import type { Offer } from "@/modules/landing/models/offer.model";
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

/**
 * "Completa tu formación": hasta 2 programas que no están en el carrito.
 *
 * Sale del listado público (`landing/offers`), el mismo que la landing, así que
 * ya viene filtrado por ventana de matrícula vigente: no se recomienda un
 * programa que no se puede comprar.
 */
const cart = useCartStore();

const offers = ref<Offer[]>([]);
const loading = ref(true);

const MAX = 2;

const recommendations = computed(() =>
  offers.value.filter((offer) => !cart.has(offer.id)).slice(0, MAX),
);

/**
 * Agotado no se recomienda: el botón llevaría a un carrito que el backend
 * rechaza. `max_students = 0` significa SIN LÍMITE, no agotado.
 */
const isSoldOut = (offer: Offer): boolean =>
  offer.max_students > 0 && offer.enrolled_students_count >= offer.max_students;

onMounted(async () => {
  const data = await offerService.list();
  // ⚠️ El listado público devuelve `offers`, no `items`.
  offers.value = (data?.offers ?? []).filter((offer) => !isSoldOut(offer));
  loading.value = false;
});
</script>

<template>
  <!-- Sin recomendaciones no se dibuja el bloque: un título sin nada debajo
       ocupa lugar y no dice nada. -->
  <section v-if="!loading && recommendations.length" class="mt-9">
    <div class="mb-4 flex flex-wrap items-center gap-2.5">
      <span
        class="font-display text-xl font-bold tracking-tight text-secondary-900"
      >
        Completa tu formación
      </span>
      <span class="text-sm text-secondary-500">· suelen llevarse juntos</span>
    </div>

    <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      <article
        v-for="offer in recommendations"
        :key="offer.id"
        class="flex items-center gap-4 rounded-adm-lg border border-line bg-surface-paper p-4"
      >
        <LandingImage
          :src="offer.image_url"
          :alt="offer.name"
          class="size-16 shrink-0 rounded-adm-md border border-line object-cover"
        />

        <div class="min-w-0 flex-1">
          <span
            class="font-mono text-[0.594rem] tracking-[0.06em] text-secondary-400"
          >
            {{
              (offer.courses?.length ?? 0) > 1 ? "LÍNEA DE CARRERA" : "CURSO"
            }}
          </span>
          <p
            class="mt-0.5 truncate font-display text-base font-bold tracking-tight text-secondary-900"
          >
            {{ offer.name }}
          </p>
          <p
            class="mt-1.5 font-display text-base font-extrabold text-primary-500"
          >
            {{ formatMoney(Number(offer.price)) }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill border-[1.5px] border-primary-500 bg-accent-soft text-primary-500"
          :aria-label="`Agregar ${offer.name} al carrito`"
          @click="cart.add(offer)"
        >
          <HeroCore :path="mdiPlus" class="size-5" />
        </button>
      </article>
    </div>
  </section>
</template>
