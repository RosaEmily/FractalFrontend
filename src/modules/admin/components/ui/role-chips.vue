<script setup lang="ts">
/**
 * Selector de roles en chips (`usuarios.jsx` del diseño).
 *
 * El diseño los dibuja como píldoras que se marcan con un check, no como un
 * multiselect: los roles son pocos y elegirlos abre campos adicionales abajo,
 * así que conviene verlos todos a la vez en vez de detrás de un desplegable.
 */
import { HeroCore } from "@/shared/components";
import { mdiCheck } from "@mdi/js";

interface RoleOption {
  id: number;
  name: string;
}

const props = defineProps<{
  options: RoleOption[];
  label?: string;
  hint?: string;
  invalid?: boolean;
  messageError?: string;
}>();

const model = defineModel<number[]>({ default: () => [] });

const isChecked = (id: number) => model.value?.includes(id) ?? false;

const toggle = (id: number) => {
  const current = model.value ?? [];
  model.value = current.includes(id)
    ? current.filter((value) => value !== id)
    : [...current, id];
};
</script>

<template>
  <div>
    <label
      v-if="props.label"
      class="block mb-1.5 text-adm-sm font-semibold text-secondary-900"
    >
      {{ props.label }}
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="role in props.options"
        :key="role.id"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-pill border-[1.5px] px-3.5 py-1.5 text-adm-sm font-semibold transition-colors"
        :class="
          isChecked(role.id)
            ? 'border-primary-500 bg-accent-soft text-primary-600'
            : 'border-line bg-surface-paper text-secondary-500 hover:border-secondary-300'
        "
        :aria-pressed="isChecked(role.id)"
        @click="toggle(role.id)"
      >
        <HeroCore v-if="isChecked(role.id)" :path="mdiCheck" size="12" />
        {{ role.name }}
      </button>
    </div>

    <p
      v-if="props.hint && !props.invalid"
      class="mt-1.5 text-adm-xs text-secondary-400"
    >
      {{ props.hint }}
    </p>
    <p
      v-if="props.invalid && props.messageError"
      class="mt-1.5 text-adm-xs text-danger-DEFAULT"
    >
      {{ props.messageError }}
    </p>
  </div>
</template>
