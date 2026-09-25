<script setup lang="ts">
import { computed, ref, watch } from "vue";

/**
 * Avatar de iniciales del aula (`AulaAvatar`, aula/shell.jsx:78).
 *
 * ⚠️ NO es `AvatarCell` del admin: ese pinta todas las iniciales en el mismo
 * naranja, y el aula ROTA seis colores por posición en la lista. Con 10 filas
 * de alumnos el color es lo que distingue una de otra de un vistazo.
 */
const props = withDefaults(
  defineProps<{
    name: string;
    /** Posición en la lista: de ahí sale el color. */
    index?: number;
    size?: number;
    /** Foto de perfil. Si falta o falla, caen las iniciales. */
    photo?: string | null;
  }>(),
  { index: 0, size: 32, photo: null },
);

/*
 * La URL puede estar caída o el archivo borrado. Sin esto quedaría el icono de
 * imagen rota, que se ve peor que no tener foto — mismo criterio que
 * `AvatarCell` del admin.
 */
const failed = ref(false);

// Una foto nueva merece otro intento.
watch(
  () => props.photo,
  () => (failed.value = false),
);

const showPhoto = computed(() => !!props.photo && !failed.value);

/*
 * Los 6 del diseño (`AULA_ACCENTS`, aula/data.jsx:41). Van literales porque
 * se componen en runtime con alfa: un token de Tailwind no serviría, ya que
 * la clase resultante no existiría en el CSS compilado.
 */
const ACCENTS = [
  "#E94E1B",
  "#2D6FCF",
  "#2D9A7D",
  "#F5A623",
  "#8A4FD3",
  "#D6336C",
] as const;

const color = computed(
  () => ACCENTS[props.index % ACCENTS.length] ?? ACCENTS[0],
);

const initials = computed(() => {
  const value = props.name?.trim();
  if (!value) return "?";

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
});
</script>

<template>
  <!-- `1F` es el alfa del fondo en el diseño: el mismo color al 12%. -->
  <img
    v-if="showPhoto"
    :src="photo ?? undefined"
    alt=""
    class="shrink-0 rounded-full object-cover"
    :style="{ width: `${size}px`, height: `${size}px` }"
    @error="failed = true"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-extrabold leading-none tracking-[-0.02em]"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${size * 0.38}px`,
      background: `${color}1F`,
      color,
      /*
       * ⚠️ `letter-spacing` se aplica también DESPUÉS de la última letra, así
       * que con un valor negativo el contenido queda corrido a la izquierda.
       * Se compensa con el mismo espacio del otro lado.
       */
      paddingLeft: '0.02em',
    }"
  >
    {{ initials }}
  </span>
</template>
