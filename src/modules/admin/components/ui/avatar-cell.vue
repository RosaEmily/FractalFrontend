<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ImageCore } from "@/shared/components";

/**
 * Celda de identidad del diseño: avatar con iniciales (no depende de que
 * exista foto), nombre en negrita y una línea secundaria opcional.
 */
interface Props {
  name: string;
  /** Segunda línea: correo, prefijo, etc. */
  secondary?: string | null;
  /** Si la línea secundaria va en mono (prefijos, correos). */
  mono?: boolean;
  photo?: string | null;
}

const props = withDefaults(defineProps<Props>(), { mono: true });

/*
 * La foto puede no cargar: la URL de S3 puede estar caída, el archivo borrado
 * o el enlace mal guardado. Sin esto quedaba el icono de imagen rota, que se
 * ve peor que no tener foto — así que se cae a las iniciales.
 */
const failed = ref(false);

// Una foto nueva merece otro intento: si no, al cambiarla seguiría en iniciales.
watch(
  () => props.photo,
  () => (failed.value = false),
);

const showPhoto = computed(() => !!props.photo && !failed.value);

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase(),
);
</script>

<template>
  <div class="flex items-center gap-2.5">
    <!--
      `preview`: 32px no alcanzan para reconocer una cara. El clic la abre a
      tamaño completo.

      ⚠️ `@click.stop`: la celda vive dentro de una fila de tabla que navega a
      editar, así que sin detener la propagación ampliar la foto sacaría al
      usuario del listado.

      `ImageCore` reenvía el evento `error` de PrimeVue (`emits: ['show',
      'hide', 'error']`), así que el fallback a iniciales se conserva.
    -->
    <ImageCore
      v-if="showPhoto"
      :src="photo ?? undefined"
      preview
      image-class="size-8 rounded-full object-cover shrink-0"
      class="shrink-0 cursor-zoom-in"
      @click.stop
      @error="failed = true"
    />
    <span
      v-else
      class="size-8 rounded-full bg-accent-soft text-primary-600 inline-flex items-center justify-center shrink-0 font-display text-adm-sm font-bold"
    >
      {{ initials }}
    </span>

    <div class="min-w-0">
      <div class="text-adm-base font-bold text-secondary-900 truncate">
        {{ name }}
      </div>
      <div
        v-if="secondary"
        class="text-adm-xs text-secondary-400 truncate mt-0.5"
        :class="mono ? 'font-mono' : ''"
      >
        {{ secondary }}
      </div>
    </div>
  </div>
</template>
