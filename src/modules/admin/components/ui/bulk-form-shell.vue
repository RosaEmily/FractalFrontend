<script setup lang="ts">
import { CardCore, ButtonCore } from "@/shared/components";

/**
 * Carcasa de los formularios de alta MASIVA.
 *
 * Replica el marco de `CrudForm` (tarjeta + barra de acciones inferior) sin su
 * motor de vee-validate: un formulario masivo tiene un número variable de filas
 * que nacen al elegir el select padre, y el `schema` de `CrudForm` es fijo. Lo
 * que se valida por fila lo resuelve el servidor, que es donde vive la regla.
 */
withDefaults(
  defineProps<{
    title: string;
    submitLabel: string;
    /** Ruta a la que vuelve Cancelar. */
    redirect: string;
    loading?: boolean;
    /** Sin filas que guardar no se habilita el botón. */
    disabled?: boolean;
  }>(),
  { loading: false, disabled: false },
);

const emit = defineEmits<{ (e: "submit"): void }>();
</script>

<template>
  <CardCore>
    <template #title>
      <span
        class="font-display text-adm-xl font-bold tracking-tight text-secondary-900"
      >
        {{ title }}
      </span>
    </template>

    <form @submit.prevent="emit('submit')">
      <div class="space-y-4">
        <slot />
      </div>

      <div
        class="flex gap-2.5 justify-end items-center mt-7 -mx-6 -mb-6 px-7 py-4.5 border-t border-line-soft bg-admin-bg rounded-b-adm-lg"
      >
        <ButtonCore
          as="RouterLink"
          :to="{ name: redirect }"
          class="!w-auto"
          severity="secondary"
          outlined
          label="Cancelar"
        />
        <ButtonCore
          class="!w-auto"
          type="submit"
          :label="submitLabel"
          :loading="loading"
          :disabled="disabled"
        />
      </div>
    </form>
  </CardCore>
</template>
