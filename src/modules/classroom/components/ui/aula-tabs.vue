<script setup lang="ts">
/**
 * Pestañas con subrayado, integradas bajo el encabezado de página
 * (`shell.jsx` → `AulaTabs`).
 *
 * ⚠️ No sustituyen a `AulaCourseSelect`: el diseño usa las tarjetas cuando hay
 * que elegir entre cursos equivalentes (clases, notas, cuadro) y estas cuando
 * cada opción lleva su propio ESTADO en la etiqueta —"Revit Architecture · por
 * cerrar"—, que es el caso de las actas: lo que importa no es qué curso sino
 * cuál se puede cerrar.
 */
export interface AulaTabItem {
  key: number | string;
  label: string;
}

defineProps<{ tabs: AulaTabItem[] }>();

const model = defineModel<number | string | null>({ default: null });
</script>

<template>
  <div class="flex gap-1 border-b border-line overflow-x-auto mt-5.5">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="cursor-pointer px-4 py-2.5 whitespace-nowrap text-[0.906rem] font-semibold border-b-2 transition-colors"
      :class="
        tab.key === model
          ? 'text-secondary-900 border-primary-500'
          : 'text-secondary-400 border-transparent hover:text-secondary-700'
      "
      @click="model = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
