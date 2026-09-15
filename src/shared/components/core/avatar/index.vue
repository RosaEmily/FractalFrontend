<script setup lang="ts">
import { computed, h, ref, watch } from "vue";
import { Avatar } from "primevue";
import type { AvatarCoreProps } from "./type";

// Props originales
const props = withDefaults(defineProps<AvatarCoreProps>(), {});

/*
 * ¿`text` es una foto o un nombre?
 *
 * Antes se decidía con `/\.(jpeg|jpg|gif|png|svg)$/`, que exige que la URL
 * TERMINE en una de esas extensiones. Fallaba en cuatro casos reales:
 *   - `.webp` y `.avif` — no estaban en la lista, y las fotos de perfil que
 *     sube el admin son `.webp`: la del usuario admin lo es.
 *   - query string (`?v=2`, firmas de S3) — la extensión deja de ser el final.
 *   - mayúsculas (`.PNG`).
 * En todos ellos la URL se trataba como un NOMBRE y el avatar mostraba las
 * iniciales de la propia URL: una "H" de `https`.
 *
 * Se decide por lo que realmente importa —que sea una URL— igual que hace
 * `admin/components/ui/avatar-cell.vue`, y la extensión deja de ser relevante.
 */
const isImageUrl = (value: string): boolean =>
  /^(https?:\/\/|\/|data:image\/|blob:)/i.test(value.trim());

/*
 * Una URL puede no cargar (archivo borrado, S3 caído). Ahí se cae a iniciales:
 * el icono de imagen rota se ve peor que no tener foto. Mismo criterio que
 * `AvatarCell`.
 */
const failed = ref(false);
watch(() => props.text, () => (failed.value = false));

/*
 * Con qué se calculan las iniciales cuando no hay foto (o falló).
 *
 * `text` suele venir como `photo ?? fullName`: si la foto existe pero no carga,
 * `text` ES la URL y las iniciales saldrían de ella ("H" de `https`). Por eso
 * el nombre se pasa aparte en `fallbackText`.
 */
const initialsSource = computed(() => {
  const { text, fallbackText } = props;
  if (text && typeof text === "string" && isImageUrl(text)) return fallbackText ?? "";
  return text ?? fallbackText ?? "";
});

const avatarProps = computed(() => {
  const baseProps: Record<string, unknown> = { ...props };
  // `fallbackText` es propio del wrapper: PrimeVue no lo conoce.
  delete baseProps.fallbackText;
  if (props.text) {
    if (typeof props.text === "string" && isImageUrl(props.text) && !failed.value) {
      baseProps.image = props.text;
      baseProps.label = undefined;
    } else if (typeof props.text === "object") {
      baseProps.label = undefined;
      baseProps.image = undefined;
      baseProps.custom = props.text;
    } else if (typeof props.text === "string") {
      const words = initialsSource.value.trim().split(/\s+/).filter(Boolean);
      const firstThreeWords = words.slice(0, 2);
      const initials = firstThreeWords
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
      baseProps.label = initials;
      baseProps.image = undefined;
    }
  }

  return baseProps;
});
</script>

<template>
  <!--
    `@error` en el <img> interno: si la foto no carga (archivo borrado, S3
    caído) se cae a las iniciales en vez de dejar el icono de imagen rota.
    PrimeVue no expone el evento, así que se captura en la fase de captura del
    propio Avatar — `error` no burbujea.
  -->
  <Avatar
    v-if="!avatarProps.custom"
    v-bind="avatarProps"
    @error.capture="failed = true"
  />
  <component v-else :is="avatarProps.custom" />
</template>
