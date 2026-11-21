<script setup lang="ts">
/**
 * Tarjeta de una métrica del home. La usan la landing (`KpisSection`) y la
 * vista previa del panel (Sitio web → KPIs): una sola fuente para que lo que
 * ve marketing al editar sea exactamente lo que se publica.
 */
defineProps<{
  value: string | number;
  prefix?: string | null;
  suffix?: string | null;
  label: string;
  /** Tarjeta destacada (naranja), la segunda de la fila. */
  accent?: boolean;
  /** SVG del icono (marcado propio, no entrada de usuario). */
  svgIcon: string;
}>();
</script>

<template>
  <div
    :class="[
      'rounded-lg p-5 sm:p-8 flex flex-col relative overflow-hidden border',
      accent
        ? 'bg-primary-500 border-primary-500 shadow-accent'
        : 'bg-surface-paper border-line shadow-sm hover:-translate-y-1 transition-transform duration-300',
    ]"
  >
    <div
      :class="[
        'w-13 h-13 rounded-xl flex items-center justify-center mb-6',
        accent ? 'bg-white/18' : 'bg-accent-soft',
      ]"
      :style="{ color: accent ? 'white' : '#e94e1b' }"
      v-html="svgIcon"
    />

    <div class="flex items-baseline gap-0.5 font-display font-bold leading-none tracking-tight mb-5">
      <span v-if="prefix" :class="['text-[1.5rem] sm:text-[2rem] mr-0.5', accent ? 'text-white/70' : 'text-primary-500']">
        {{ prefix }}
      </span>
      <span :class="['text-[3.25rem] sm:text-[4.5rem]', accent ? 'text-white' : 'text-secondary-900']">
        {{ value }}
      </span>
      <span v-if="suffix" :class="['text-[1.5rem] sm:text-[2rem]', accent ? 'text-white/70' : 'text-primary-500']">
        {{ suffix }}
      </span>
    </div>

    <p :class="['font-body text-[0.906rem] leading-snug', accent ? 'text-white/85' : 'text-secondary-500']">
      {{ label }}
    </p>

    <div
      :class="[
        'absolute -right-5 -top-5 w-22 h-22 rounded-full opacity-60',
        accent ? 'bg-white/6' : 'bg-accent-soft',
      ]"
    />
  </div>
</template>
