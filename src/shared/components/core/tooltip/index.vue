<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { mdiClose } from "@mdi/js";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from "@floating-ui/dom";
import HeroCore from "../hero/index.vue";
import vTooltip from "@/shared/plugins/directives/tooltip";
import type { TooltipCoreProps } from "./type";

/**
 * `TooltipCore` v2. Dos caminos según el caso, para que escale:
 *
 *  - Hover/foco (el 99%): el elemento usa la directiva `v-tooltip`, que
 *    comparte UN solo cuadro flotante y 5 listeners globales para toda la app.
 *    Mil botones con tooltip no crean mil cuadros ni mil `Teleport`.
 *  - Controlado (`show`, con o sin `clearable`): se monta un cuadro propio solo
 *    mientras está visible (`v-if`); en reposo no existe en el DOM.
 *
 * Misma posición (Floating UI: flip, shift, flecha real) y mismo estilo
 * (`.fx-tooltip`) en ambos. Dos raíces (elemento + Teleport): los atributos
 * del consumidor van al elemento.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TooltipCoreProps>(), {
  position: "top",
  tag: "div",
  escape: true,
  showDelay: 140,
  hideDelay: 0,
});
const emit = defineEmits<{ (e: "clear"): void }>();

const manual = computed(() => !!props.show);
const dismissed = ref(false);
const open = computed(
  () => manual.value && !dismissed.value && !!props.value && !props.disabled,
);

/** Opciones de la directiva; en modo controlado queda apagada. */
const hover = computed(() => ({
  value: props.value ?? "",
  disabled: props.disabled || props.disableHover || manual.value,
  html: props.escape === false,
  position: props.position,
  showDelay: props.showDelay,
  hideDelay: props.hideDelay,
}));

const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const arrowEl = ref<HTMLElement | null>(null);
const placement = ref<Placement>(props.position);
const ready = ref(false);
let stop: (() => void) | null = null;

const SIDE: Record<string, string> = { top: "bottom", bottom: "top", left: "right", right: "left" };

async function place() {
  if (!reference.value || !floating.value || !arrowEl.value) return;
  const { x, y, placement: final, middlewareData } = await computePosition(
    reference.value,
    floating.value,
    {
      placement: props.position,
      strategy: "fixed",
      middleware: [
        offset(8),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        arrow({ element: arrowEl.value, padding: 10 }),
      ],
    },
  );
  floating.value.style.left = `${Math.round(x)}px`;
  floating.value.style.top = `${Math.round(y)}px`;
  placement.value = final;

  const a = middlewareData.arrow;
  const el = arrowEl.value;
  el.style.left = a?.x != null ? `${a.x}px` : "";
  el.style.top = a?.y != null ? `${a.y}px` : "";
  el.style.right = el.style.bottom = "";
  el.style[SIDE[final.split("-")[0]!] as "top"] = "-4px";
}

// El cuadro propio solo existe mientras `open`; se engancha al montarse.
watch(floating, async (el) => {
  stop?.();
  stop = null;
  ready.value = false;
  if (!el || !reference.value) return;
  stop = autoUpdate(reference.value, el, place);
  await place();
  ready.value = true;
});

watch(
  () => props.show,
  (value) => {
    if (value) dismissed.value = false;
  },
);

function clear() {
  dismissed.value = true;
  emit("clear");
}
</script>

<template>
  <component
    :is="tag"
    ref="reference"
    v-bind="$attrs"
    v-tooltip="hover"
    :class="[{ 'cursor-pointer': !noPointer && !!value && !disabled }, props.class]"
  >
    <slot />
  </component>

  <Teleport v-if="open" to="body">
    <div
      ref="floating"
      :id="id"
      role="tooltip"
      class="fx-tooltip"
      :class="[classTooltip, { 'fx-tooltip--interactive': clearable }]"
      :data-placement="placement"
      :data-state="ready ? 'open' : 'measuring'"
    >
      <span v-if="escape" class="fx-tooltip__text">{{ value }}</span>
      <span v-else class="fx-tooltip__text" v-html="value" />
      <button
        v-if="clearable"
        type="button"
        class="fx-tooltip__clear"
        aria-label="Cerrar"
        @click.stop="clear"
      >
        <HeroCore :path="mdiClose" size="14" />
      </button>
      <span ref="arrowEl" class="fx-tooltip__arrow" />
    </div>
  </Teleport>
</template>
