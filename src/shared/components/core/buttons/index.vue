<script setup lang="ts">
import { Button } from "primevue";
import type { ButtonCoreProps } from "./type";

const props = withDefaults(defineProps<ButtonCoreProps>(), {
  size: "small",
});

/**
 * Ancho completo por DEFECTO, no impuesto.
 *
 * ⚠️ Antes el template llevaba `class="w-full"` fijo, que gana siempre al
 * fusionarse con la clase del padre: cualquier botón fuera de un formulario
 * salía estirado y, dentro de un flex, empujaba a los demás a su propia línea
 * (pasó con "Agregar evaluación" / "Guardar cuadro" del cuadro de evaluación).
 *
 * Se notaba el problema: 10 sitios del admin ya lo parcheaban con `!w-auto`.
 * Ahora `w-full` solo se aplica si quien usa el componente no dio su propia
 * clase de ancho, así que los formularios siguen igual sin tocarlos.
 */
const widthClass = (): string => {
  const own = String(props.class ?? "");

  return /(^|\s)!?w-/.test(own) ? "" : "w-full";
};
</script>
<template>
  <Button v-bind="props" :class="[widthClass(), props.class]">
    <template #default>
      <slot />
    </template>
    <template #icon>
      <slot name="icon" />
    </template>
  </Button>
</template>
