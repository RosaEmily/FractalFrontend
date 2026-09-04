<script setup lang="ts">
import { computed } from "vue";

/**
 * Marca del medio de pago.
 *
 * Son marcas de TEXTO estilizadas, no los logos oficiales: usar los logotipos
 * reales exige permiso de cada marca y archivos de alta resolución que el
 * proyecto no tiene. El objetivo es solo que el usuario reconozca la opción.
 */
const props = withDefaults(
  defineProps<{ name: string; height?: number }>(),
  { height: 26 },
);

const MARKS: Record<string, { bg: string; fg: string; text: string }> = {
  niubiz: { bg: "#ED1C24", fg: "#fff", text: "niubiz" },
  izipay: { bg: "#0A2540", fg: "#9ED54B", text: "izipay" },
  alignet: { bg: "#1B3C8C", fg: "#fff", text: "Alignet" },
  yape: { bg: "#742384", fg: "#fff", text: "yape" },
  plin: { bg: "#0A1A4A", fg: "#1FD3D8", text: "plin" },
  visa: { bg: "#1A1F71", fg: "#fff", text: "VISA" },
  amex: { bg: "#016FD0", fg: "#fff", text: "AMEX" },
  diners: { bg: "#0079BE", fg: "#fff", text: "Diners" },
};

/** El nombre llega del backend ("Niubiz", "Yape"); la clave es en minúsculas. */
const mark = computed(() => MARKS[props.name.toLowerCase()] ?? null);

const isMastercard = computed(() => props.name.toLowerCase() === "mastercard");
</script>

<template>
  <span
    v-if="isMastercard"
    class="inline-flex items-center"
    :style="{ height: `${height}px` }"
    aria-label="Mastercard"
  >
    <span
      class="rounded-pill"
      :style="{ width: `${height * 0.62}px`, height: `${height * 0.62}px`, background: '#EB001B' }"
    />
    <span
      class="rounded-pill"
      :style="{
        width: `${height * 0.62}px`,
        height: `${height * 0.62}px`,
        background: '#F79E1B',
        marginLeft: `-${height * 0.24}px`,
        mixBlendMode: 'multiply',
      }"
    />
  </span>

  <span
    v-else-if="mark"
    class="inline-flex items-center justify-center font-display font-extrabold tracking-tight"
    :style="{
      height: `${height}px`,
      padding: `0 ${height * 0.42}px`,
      borderRadius: `${height * 0.28}px`,
      background: mark.bg,
      color: mark.fg,
      fontSize: `${height * 0.5}px`,
      lineHeight: 1,
    }"
  >
    {{ mark.text }}
  </span>
</template>
