import type { Directive, DirectiveBinding } from "vue";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from "@floating-ui/dom";

/**
 * Tooltip v2 (`v-tooltip`). Misma sintaxis que el de PrimeVue, que reemplaza:
 *
 *   v-tooltip.top="'Texto'"                       (top | bottom | left | right)
 *   v-tooltip="{ value, disabled, showDelay, hideDelay, html }"
 *
 * Qué mejora respecto al de PrimeVue:
 *  - Un solo nodo compartido (no uno por elemento) y se crea al primer uso.
 *  - Posición con Floating UI: se voltea al lado contrario si no cabe y se
 *    desplaza para no salirse de la pantalla; la flecha sigue apuntando al
 *    elemento aunque el cuadro se haya movido.
 *  - Con un tooltip recién visto el siguiente aparece sin espera (se navega
 *    una fila de iconos sin pausa entre cada uno).
 *  - Teclado: aparece con el foco (solo `:focus-visible`), Esc lo cierra y el
 *    elemento queda enlazado con `aria-describedby` para lectores de pantalla.
 *  - Se cierra al hacer clic o al hacer scroll y sigue al elemento si este se
 *    mueve mientras está abierto (`autoUpdate`).
 *  - Entra con una animación corta desde el lado del elemento; sin ella con
 *    `prefers-reduced-motion`.
 *  - Solo con mouse: en táctil no se queda pegado tras un toque.
 */

interface TooltipOptions {
  value?: string | null;
  disabled?: boolean;
  /** Interpreta `value` como HTML. Solo con texto propio, nunca de usuarios. */
  html?: boolean;
  showDelay?: number;
  hideDelay?: number;
  /**
   * Selector de un hijo al que apuntar. Se activa al pasar por todo el elemento
   * (zona de hover amplia) pero se ancla a ese hijo: p. ej. la barra de un
   * gráfico y no la columna entera.
   */
  anchor?: string;
  /** Lado preferido; alternativa a los modificadores (útil cuando es dinámico). */
  position?: "top" | "bottom" | "left" | "right";
}

interface TooltipState extends Required<Pick<TooltipOptions, "showDelay" | "hideDelay">> {
  value: string;
  disabled: boolean;
  html: boolean;
  anchor: string;
  placement: Placement;
}

const SHOW_DELAY = 140;
/** Ventana en la que un nuevo tooltip aparece sin espera tras cerrar otro. */
const WARM_MS = 400;
const GAP = 8;
const EDGE = 8;
const ID = "fx-tooltip";

const states = new WeakMap<HTMLElement, TooltipState>();

let box: HTMLDivElement | null = null;
let text: HTMLSpanElement | null = null;
let tip: HTMLSpanElement | null = null;
let current: HTMLElement | null = null;
let stopAuto: (() => void) | null = null;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let lastClosed = 0;

const SIDES: Record<string, string> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function ensureBox() {
  if (box) return box;
  box = document.createElement("div");
  box.id = ID;
  box.setAttribute("role", "tooltip");
  box.className = "fx-tooltip";
  text = document.createElement("span");
  text.className = "fx-tooltip__text";
  tip = document.createElement("span");
  tip.className = "fx-tooltip__arrow";
  box.append(text, tip);
  document.body.appendChild(box);
  return box;
}

function clearTimers() {
  if (showTimer) clearTimeout(showTimer);
  if (hideTimer) clearTimeout(hideTimer);
  showTimer = hideTimer = null;
}

async function place(target: HTMLElement, state: TooltipState) {
  if (!box || !tip) return;
  const reference = (state.anchor && target.querySelector<HTMLElement>(state.anchor)) || target;
  const { x, y, placement, middlewareData } = await computePosition(reference, box, {
    placement: state.placement,
    strategy: "fixed",
    middleware: [
      offset(GAP),
      flip({ padding: EDGE }),
      shift({ padding: EDGE }),
      arrow({ element: tip, padding: 10 }),
    ],
  });

  box.style.left = `${Math.round(x)}px`;
  box.style.top = `${Math.round(y)}px`;
  box.dataset.placement = placement;

  const side = placement.split("-")[0]!;
  const a = middlewareData.arrow;
  tip.style.left = a?.x != null ? `${a.x}px` : "";
  tip.style.top = a?.y != null ? `${a.y}px` : "";
  tip.style.right = tip.style.bottom = "";
  tip.style[SIDES[side] as "top"] = "-4px";
}

function show(target: HTMLElement) {
  const state = states.get(target);
  if (!state || state.disabled || !state.value) return;

  const el = ensureBox();
  if (current && current !== target) current.removeAttribute("aria-describedby");
  current = target;

  if (state.html) text!.innerHTML = state.value;
  else text!.textContent = state.value;
  target.setAttribute("aria-describedby", ID);

  // Se mide antes de mostrar: oculto no tiene tamaño y la posición saldría mal.
  el.dataset.state = "measuring";
  stopAuto?.();
  const reference = (state.anchor && target.querySelector<HTMLElement>(state.anchor)) || target;
  stopAuto = autoUpdate(reference, el, () => place(target, state), {
    animationFrame: false,
  });
  place(target, state).then(() => {
    if (current === target) el.dataset.state = "open";
  });
}

function hide() {
  clearTimers();
  if (!box || !current) return;
  stopAuto?.();
  stopAuto = null;
  current.removeAttribute("aria-describedby");
  current = null;
  box.dataset.state = "closed";
  lastClosed = Date.now();
}

function schedule(target: HTMLElement) {
  const state = states.get(target);
  if (!state || state.disabled || !state.value) return;
  clearTimers();
  const warm = Date.now() - lastClosed < WARM_MS;
  const delay = warm || current ? 0 : state.showDelay;
  if (delay === 0) show(target);
  else showTimer = setTimeout(() => show(target), delay);
}

function leave(target: HTMLElement) {
  const state = states.get(target);
  if (showTimer) clearTimeout(showTimer);
  showTimer = null;
  if (current !== target) return;
  if (state?.hideDelay) hideTimer = setTimeout(hide, state.hideDelay);
  else hide();
}

function read(binding: DirectiveBinding): TooltipState {
  const raw = binding.value as string | TooltipOptions | null | undefined;
  const options: TooltipOptions =
    raw && typeof raw === "object" ? raw : { value: (raw as string | null | undefined) ?? "" };
  const side =
    options.position ?? (["top", "bottom", "left", "right"] as const).find((m) => binding.modifiers[m]) ?? "top";

  return {
    value: options.value == null ? "" : String(options.value),
    disabled: !!options.disabled,
    html: !!options.html,
    anchor: options.anchor ?? "",
    showDelay: options.showDelay ?? SHOW_DELAY,
    hideDelay: options.hideDelay ?? 0,
    placement: side,
  };
}

/*
 * Delegación de eventos: 5 listeners en `document` para toda la app, sin
 * importar cuántos elementos tengan tooltip (una tabla con cientos de botones
 * de acción no suma listeners). Cada elemento solo se marca con
 * `data-fx-tooltip` y guarda su estado en el WeakMap.
 */
const MARK = "data-fx-tooltip";

const owner = (node: EventTarget | null): HTMLElement | null =>
  node instanceof Element ? node.closest<HTMLElement>(`[${MARK}]`) : null;

let globalBound = false;
function bindGlobal() {
  if (globalBound) return;
  globalBound = true;

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = owner(e.target);
    if (el && el !== owner(e.relatedTarget)) schedule(el);
  });
  document.addEventListener("pointerout", (e) => {
    const el = owner(e.target);
    if (el && el !== owner(e.relatedTarget)) leave(el);
  });
  document.addEventListener("focusin", (e) => {
    const el = owner(e.target);
    // Solo foco de teclado; el clic ya cierra y no debe reabrirlo.
    if (el && (e.target as HTMLElement).matches?.(":focus-visible")) schedule(el);
  });
  document.addEventListener("focusout", (e) => {
    const el = owner(e.target);
    if (el) leave(el);
  });
  document.addEventListener("pointerdown", () => hide());
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  // `capture`: el scroll de cualquier contenedor interno (el panel scrollea
  // dentro de un div, no en la ventana) también cierra el tooltip.
  document.addEventListener("scroll", hide, true);
  window.addEventListener("blur", hide);
}

const vTooltip: Directive<HTMLElement> = {
  mounted(el, binding) {
    bindGlobal();
    states.set(el, read(binding));
    el.setAttribute(MARK, "");
  },

  updated(el, binding) {
    if (!states.has(el)) return;
    states.set(el, read(binding));
    // Si cambió el texto con el tooltip abierto, se refresca en su sitio.
    if (current === el) {
      const state = states.get(el)!;
      if (!state.value || state.disabled) hide();
      else show(el);
    }
  },

  unmounted(el) {
    if (current === el) hide();
    states.delete(el);
  },
};

export default vTooltip;
