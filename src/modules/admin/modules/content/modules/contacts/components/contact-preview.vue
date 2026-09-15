<script setup lang="ts">
/**
 * Cómo se ve el contacto en el pie de página de la landing.
 *
 * El pie es oscuro, así que la previsualización lo es también: sobre fondo
 * claro no se sabría si el texto contrasta.
 */
import { computed } from "vue";
import { HeroCore } from "@/shared/components";
import {
  mdiEmailOutline,
  mdiWhatsapp,
  mdiPhoneOutline,
  mdiMapMarkerOutline,
  mdiShimmer,
} from "@mdi/js";

const props = defineProps<{ type: string | null; value: string | null }>();

/** Un icono por tipo, como en el diseño. */
const ICONS: Record<string, string> = {
  email: mdiEmailOutline,
  mobile: mdiWhatsapp,
  phone: mdiPhoneOutline,
  address: mdiMapMarkerOutline,
  other: mdiShimmer,
};

const icon = computed(() => ICONS[props.type ?? ""] ?? mdiShimmer);
const text = computed(() => props.value || "contacto@proyectofractal.com");
</script>

<template>
  <div
    class="w-full flex items-center gap-3 rounded-adm-md bg-secondary-900 px-[1.125rem] py-3.5"
  >
    <span
      class="size-8 shrink-0 grid place-items-center rounded-full bg-surface-paper/10"
    >
      <HeroCore :path="icon" size="14" class="text-surface-paper" />
    </span>
    <span class="text-adm-sm text-surface-paper/85 truncate">{{ text }}</span>
  </div>
</template>
