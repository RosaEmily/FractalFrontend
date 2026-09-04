<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    body: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }>(),
  { confirmLabel: "Confirmar", cancelLabel: "Volver", danger: false },
);

const emit = defineEmits<{ confirm: []; dismiss: [] }>();

/*
 * El fondo no debe poder scrollearse mientras el diálogo está abierto: en móvil
 * el usuario arrastra la página y pierde de vista los botones.
 */
watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
  },
);

// Si el componente se desmonta con el diálogo abierto (navegación), el scroll
// del body se quedaría bloqueado para siempre.
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") emit("dismiss");
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-secondary-900/45 p-5 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      @click="emit('dismiss')"
      @keydown="onKeydown"
    >
      <!-- El clic dentro de la tarjeta no debe cerrar: solo el del fondo. -->
      <div
        class="w-full max-w-100 rounded-adm-lg bg-surface-paper p-7 shadow-lg"
        @click.stop
      >
        <div
          class="mb-4 grid size-11 place-items-center rounded-pill"
          :class="danger ? 'bg-danger-soft' : 'bg-surface-cream'"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            :class="danger ? 'text-danger-DEFAULT' : 'text-secondary-500'"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <h3 class="font-display text-[1.188rem] font-bold text-secondary-900">
          {{ title }}
        </h3>
        <p class="mt-2.5 mb-[1.375rem] font-body text-sm leading-relaxed text-secondary-500">
          {{ body }}
        </p>

        <div class="flex gap-2.5">
          <LandingButton
            variant="secondary"
            size="md"
            :arrow="false"
            class="flex-1 justify-center"
            @click="emit('dismiss')"
          >
            {{ cancelLabel }}
          </LandingButton>
          <LandingButton
            :variant="danger ? 'primary' : 'ink'"
            size="md"
            :arrow="false"
            class="flex-1 justify-center"
            :class="danger ? '!border-danger-DEFAULT !bg-danger-DEFAULT hover:!bg-danger-DEFAULT/90' : ''"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </LandingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
