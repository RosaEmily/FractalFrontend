<script setup lang="ts">
/**
 * Editor de texto enriquecido (Tiptap/ProseMirror). Entrega y recibe HTML.
 *
 * Seguridad, en tres capas:
 *  1. El documento solo admite los nodos y marcas del esquema de abajo: lo que
 *     se pegue desde Word o una web (scripts, imágenes, iframes, estilos
 *     ajenos) no existe en el esquema y se descarta.
 *  2. Los enlaces se validan con `safeHref` (sin `javascript:`).
 *  3. La API vuelve a sanear al guardar (`HtmlSanitizer`) y el visitante lo
 *     pinta tras `sanitizeRichHtml`. El editor nunca usa `v-html`.
 *
 * Lo que se habilite aquí debe estar también en la lista blanca de ambos
 * sanitizers (`utils/rich-text.ts` y `HtmlSanitizer.php`), o se perdería al guardar.
 * El valor viejo en Markdown se convierte al abrirlo (`toRichHtml`).
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight,
  mdiCodeTags,
  mdiFormatBold,
  mdiFormatClear,
  mdiFormatColorHighlight,
  mdiFormatColorText,
  mdiFormatItalic,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiFormatQuoteClose,
  mdiFormatStrikethrough,
  mdiFormatSubscript,
  mdiTable,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiTableColumnPlusAfter,
  mdiTableColumnPlusBefore,
  mdiTableColumnRemove,
  mdiTableRowPlusAfter,
  mdiTableRowPlusBefore,
  mdiTableRowRemove,
  mdiTableMergeCells,
  mdiTableSplitCell,
  mdiTableRemove,
  mdiTableHeadersEye,
  mdiFormatSuperscript,
  mdiFormatUnderline,
  mdiLink,
  mdiLinkOff,
  mdiMinus,
  mdiRedo,
  mdiUndo,
} from "@mdi/js";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import HeroCore from "../hero/index.vue";
import SelectCore from "../select/index.vue";
import { safeHref } from "@/shared/utils/safe-url";
import { RICH_COLORS, RICH_FONTS, RICH_FONT_SIZES, RICH_HIGHLIGHTS, RICH_LINE_HEIGHTS, sanitizeRichHtml, toRichHtml } from "@/shared/utils/rich-text";
import type { RichTextCoreProps } from "./type";

const props = withDefaults(defineProps<RichTextCoreProps>(), { minHeight: 260, placeholder: "Escribe el contenido de la página…" });
const model = defineModel<string | null>({ default: null });

/** Aviso cuando al pegar se descartó algo (scripts, eventos, estilos o etiquetas no permitidos). */
const notice = ref("");
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
const showNotice = (text: string) => {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 6000);
};
const textOf = (html: string) => new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";

/**
 * Ancho de columna: el editor lo guarda como `colwidth` (arreglo, uno por columna que
 * ocupa la celda); en el HTML se guarda como `width="px"` (suma), que es lo que
 * conserva la API. Al leer, se reparte en partes iguales si la celda abarca varias.
 */
const colwidthAttr = {
  default: null,
  parseHTML: (el: HTMLElement) => {
    const w = parseInt(el.getAttribute("width") ?? "", 10);
    if (!Number.isFinite(w) || w < 30 || w > 1200) return null;
    const span = Math.min(Math.max(parseInt(el.getAttribute("colspan") ?? "1", 10) || 1, 1), 6);
    return Array.from({ length: span }, () => Math.round(w / span));
  },
  renderHTML: (attrs: { colwidth?: number[] | null }) => {
    const total = (attrs.colwidth ?? []).reduce((a, b) => a + (Number(b) || 0), 0);
    return total >= 30 && total <= 1200 ? { width: String(Math.round(total)) } : {};
  },
};
const withWidth = { addAttributes() { return { ...this.parent?.(), colwidth: colwidthAttr }; } };

const lastEmitted = ref<string>(model.value ?? "");

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] }, // el h1 es el título de la página
      codeBlock: false,
      hardBreak: false,
      link: {
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
        HTMLAttributes: { target: null, rel: null },
        isAllowedUri: (url) => !!safeHref(url),
      },
    }),
    TextStyleKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Table.configure({ resizable: true, cellMinWidth: 60 }),
    TableRow,
    TableHeader.extend(withWidth),
    TableCell.extend(withWidth),
    Subscript,
    Superscript,
    Placeholder.configure({ placeholder: props.placeholder }),
    CharacterCount,
  ],
  content: toRichHtml(model.value),
  editable: !props.disabled,
  editorProps: {
    attributes: { class: "rt-content", "aria-label": props.label ?? "Contenido" },
    // Capa 0: lo pegado se sanea ANTES de entrar al documento.
    transformPastedHTML: (html) => {
      const safe = sanitizeRichHtml(html);
      if (textOf(safe).trim() !== textOf(html).trim() || /<(script|iframe|object|embed|form|style)|\son\w+\s*=|javascript:/i.test(html)) {
        showNotice("Se eliminó contenido no permitido del texto pegado (scripts, código o elementos no admitidos).");
      }
      return safe;
    },
    // Lo pegado como texto plano nunca se interpreta como HTML.
    transformPastedText: (text) => text,
  },
  onUpdate: ({ editor: e }) => {
    const html = e.isEmpty ? "" : e.getHTML();
    lastEmitted.value = html;
    model.value = html;
  },
});

// Cambios externos (carga del registro, reset): se reflejan sin pisar lo que se está escribiendo.
watch(
  () => model.value,
  (value) => {
    const next = value ?? "";
    if (!editor.value || next === lastEmitted.value) return;
    lastEmitted.value = next;
    editor.value.commands.setContent(toRichHtml(next), { emitUpdate: false });
  },
);
watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

const is = (name: string, attrs?: Record<string, unknown>) => editor.value?.isActive(name, attrs) ?? false;
const chain = () => editor.value?.chain().focus();

const blockValue = () => {
  for (const level of [2, 3, 4]) if (is("heading", { level })) return String(level);
  return "p";
};
const setBlock = (value: string | number | null) => {
  if (value === "p" || value === null) chain()?.setParagraph().run();
  else chain()?.setHeading({ level: Number(value) as 2 | 3 | 4 }).run();
};
const blockOptions = [
  { label: "Párrafo", value: "p" },
  { label: "Subtítulo", value: "2" },
  { label: "Sección", value: "3" },
  { label: "Subsección", value: "4" },
];
const fontOptions = RICH_FONTS.map((f) => ({ label: f.label, value: f.value }));
const sizeOptions = RICH_FONT_SIZES.map((n) => ({ label: `${n}`, value: `${n}px` }));
const lineOptions = RICH_LINE_HEIGHTS.map((l) => ({ label: l.label, value: l.value }));

const clean = (v: unknown) => String(v ?? "").replace(/^["']|["']$/g, "");
const fontValue = () => clean(editor.value?.getAttributes("textStyle").fontFamily);
const sizeValue = () => clean(editor.value?.getAttributes("textStyle").fontSize);
const lineValue = () => clean(editor.value?.getAttributes("textStyle").lineHeight);
// `showClear` del select emite null: equivale a quitar el formato.
const setFont = (v: string | number | null) => (v ? chain()?.setFontFamily(String(v)).run() : chain()?.unsetFontFamily().run());
const setSize = (v: string | number | null) => (v ? chain()?.setFontSize(String(v)).run() : chain()?.unsetFontSize().run());
const setLine = (v: string | number | null) => (v ? chain()?.setLineHeight(String(v)).run() : chain()?.unsetLineHeight().run());

// Colores: paleta fija + selector libre. `#rrggbb` validado antes de aplicar.
const menu = ref<"color" | "highlight" | null>(null);
const HEX = /^#[0-9a-f]{6}$/i;
const applyColor = (kind: "color" | "highlight", value: string | null) => {
  if (value && !HEX.test(value)) return;
  if (kind === "color") (value ? chain()?.setColor(value) : chain()?.unsetColor())?.run();
  else (value ? chain()?.setBackgroundColor(value) : chain()?.unsetBackgroundColor())?.run();
  menu.value = null;
};
const rootEl = ref<HTMLElement | null>(null);
const onDocClick = (e: MouseEvent) => {
  if (menu.value && rootEl.value && !rootEl.value.contains(e.target as Node)) menu.value = null;
};
onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKey);
  document.body.style.overflow = "";
  clearTimeout(noticeTimer);
  editor.value?.destroy();
});

const marks = [
  { label: "Negrita (Ctrl+B)", icon: mdiFormatBold, active: () => is("bold"), run: () => chain()?.toggleBold().run() },
  { label: "Cursiva (Ctrl+I)", icon: mdiFormatItalic, active: () => is("italic"), run: () => chain()?.toggleItalic().run() },
  { label: "Subrayado (Ctrl+U)", icon: mdiFormatUnderline, active: () => is("underline"), run: () => chain()?.toggleUnderline().run() },
  { label: "Tachado", icon: mdiFormatStrikethrough, active: () => is("strike"), run: () => chain()?.toggleStrike().run() },
  { label: "Subíndice", icon: mdiFormatSubscript, active: () => is("subscript"), run: () => chain()?.toggleSubscript().run() },
  { label: "Superíndice", icon: mdiFormatSuperscript, active: () => is("superscript"), run: () => chain()?.toggleSuperscript().run() },
  { label: "Código en línea", icon: mdiCodeTags, active: () => is("code"), run: () => chain()?.toggleCode().run() },
];
const aligns = [
  { label: "Alinear a la izquierda", icon: mdiFormatAlignLeft, value: "left" },
  { label: "Centrar", icon: mdiFormatAlignCenter, value: "center" },
  { label: "Alinear a la derecha", icon: mdiFormatAlignRight, value: "right" },
  { label: "Justificar", icon: mdiFormatAlignJustify, value: "justify" },
];
const blocks = [
  { label: "Lista con viñetas", icon: mdiFormatListBulleted, active: () => is("bulletList"), run: () => chain()?.toggleBulletList().run() },
  { label: "Lista numerada", icon: mdiFormatListNumbered, active: () => is("orderedList"), run: () => chain()?.toggleOrderedList().run() },
  { label: "Cita", icon: mdiFormatQuoteClose, active: () => is("blockquote"), run: () => chain()?.toggleBlockquote().run() },
  { label: "Línea separadora", icon: mdiMinus, active: () => false, run: () => chain()?.setHorizontalRule().run() },
];

// Tabla: se inserta con filas/columnas acotadas; dentro de una tabla aparece su barra.
const fullscreen = ref(false);
const toggleFullscreen = () => (fullscreen.value = !fullscreen.value);
watch(fullscreen, (on) => {
  document.body.style.overflow = on ? "hidden" : "";
});
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && fullscreen.value) fullscreen.value = false;
};
const tableRows = ref(3);
const tableCols = ref(3);
const clamp = (n: number, max: number) => Math.min(max, Math.max(1, Math.floor(Number(n)) || 1));
const insertTable = () => {
  chain()?.insertTable({ rows: clamp(tableRows.value, 12), cols: clamp(tableCols.value, 6), withHeaderRow: true }).run();
  menu.value = null;
};
const tableTools = [
  { label: "Fila arriba", icon: mdiTableRowPlusBefore, run: () => chain()?.addRowBefore().run() },
  { label: "Fila abajo", icon: mdiTableRowPlusAfter, run: () => chain()?.addRowAfter().run() },
  { label: "Eliminar fila", icon: mdiTableRowRemove, run: () => chain()?.deleteRow().run() },
  { label: "Columna a la izquierda", icon: mdiTableColumnPlusBefore, run: () => chain()?.addColumnBefore().run() },
  { label: "Columna a la derecha", icon: mdiTableColumnPlusAfter, run: () => chain()?.addColumnAfter().run() },
  { label: "Eliminar columna", icon: mdiTableColumnRemove, run: () => chain()?.deleteColumn().run() },
  { label: "Fila de encabezado", icon: mdiTableHeadersEye, run: () => chain()?.toggleHeaderRow().run() },
  { label: "Combinar celdas", icon: mdiTableMergeCells, run: () => chain()?.mergeCells().run() },
  { label: "Dividir celda", icon: mdiTableSplitCell, run: () => chain()?.splitCell().run() },
  { label: "Eliminar tabla", icon: mdiTableRemove, run: () => chain()?.deleteTable().run() },
];

// Enlace: barra propia en vez de `window.prompt` (se valida y se muestra el error).
const linkOpen = ref(false);
const linkUrl = ref("");
const linkError = ref("");
const linkInput = ref<HTMLInputElement | null>(null);
const openLink = async () => {
  linkUrl.value = (editor.value?.getAttributes("link").href as string | undefined) ?? "";
  linkError.value = "";
  linkOpen.value = true;
  await nextTick();
  linkInput.value?.focus();
};
const closeLink = () => {
  linkOpen.value = false;
  chain()?.run();
};
const applyLink = () => {
  const href = safeHref(linkUrl.value);
  if (!href) {
    linkError.value = "Usa https://…, mailto:, tel: o una ruta como /contact.";
    return;
  }
  // Una ruta del propio sitio abre en la misma pestaña; el resto, en una nueva.
  const attrs = href.startsWith("/") ? { href, target: null, rel: null } : { href, target: "_blank", rel: "noopener noreferrer" };
  chain()?.extendMarkRange("link").setLink(attrs).run();
  linkOpen.value = false;
};
const removeLink = () => {
  chain()?.extendMarkRange("link").unsetLink().run();
  linkOpen.value = false;
};
</script>

<template>
  <div ref="rootEl" :class="fullscreen ? 'rt-full' : ''">
    <LabelCore v-if="label" :text="label" :required="required" :hint="hintLabel" />

    <div
      class="rt rounded-adm-sm border bg-white transition-colors focus-within:border-primary-500"
      :class="invalid || messageError ? 'border-red-500' : 'border-line'"
    >
      <div class="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-line bg-surface-page px-2 py-1.5" role="toolbar" aria-label="Formato del texto">
        <SelectCore class="rt-sel w-36" :model-value="blockValue()" :options="blockOptions" option-label="label" option-value="value" aria-label="Estilo de párrafo" :disabled="disabled" @update:model-value="setBlock" />
        <SelectCore class="rt-sel w-44" :model-value="fontValue() || null" :options="fontOptions" option-label="label" option-value="value" placeholder="Tipo de letra" aria-label="Tipo de letra" show-clear :disabled="disabled" @update:model-value="setFont" />
        <SelectCore class="rt-sel w-28" :model-value="sizeValue() || null" :options="sizeOptions" option-label="label" option-value="value" placeholder="Tamaño" aria-label="Tamaño de letra" show-clear :disabled="disabled" @update:model-value="setSize" />
        <SelectCore class="rt-sel w-32" :model-value="lineValue() || null" :options="lineOptions" option-label="label" option-value="value" placeholder="Interlineado" aria-label="Interlineado" show-clear :disabled="disabled" @update:model-value="setLine" />

        <span class="rt-sep" aria-hidden="true" />

        <button v-for="b in marks" :key="b.label" v-tooltip.top="b.label" type="button" class="rt-btn" :class="{ 'rt-btn--on': b.active() }" :aria-label="b.label" :aria-pressed="b.active()" :disabled="disabled" @click="b.run()">
          <HeroCore :path="b.icon" :size="18" />
        </button>

        <span class="relative">
          <button v-tooltip.top="'Color del texto'" type="button" class="rt-btn" aria-label="Color del texto" aria-haspopup="true" :aria-expanded="menu === 'color'" :disabled="disabled" @click="menu = menu === 'color' ? null : 'color'">
            <HeroCore :path="mdiFormatColorText" :size="18" />
          </button>
          <div v-if="menu === 'color'" class="rt-menu" role="menu">
            <button v-for="c in RICH_COLORS" :key="c" type="button" class="rt-swatch" :style="{ background: c }" :aria-label="`Color ${c}`" @click="applyColor('color', c)" />
            <label class="rt-custom">Otro <input type="color" aria-label="Color personalizado" @input="applyColor('color', ($event.target as HTMLInputElement).value)" /></label>
            <button type="button" class="rt-reset" @click="applyColor('color', null)">Quitar color</button>
          </div>
        </span>
        <span class="relative">
          <button v-tooltip.top="'Resaltado'" type="button" class="rt-btn" aria-label="Resaltado" aria-haspopup="true" :aria-expanded="menu === 'highlight'" :disabled="disabled" @click="menu = menu === 'highlight' ? null : 'highlight'">
            <HeroCore :path="mdiFormatColorHighlight" :size="18" />
          </button>
          <div v-if="menu === 'highlight'" class="rt-menu" role="menu">
            <button v-for="c in RICH_HIGHLIGHTS" :key="c" type="button" class="rt-swatch" :style="{ background: c }" :aria-label="`Resaltado ${c}`" @click="applyColor('highlight', c)" />
            <label class="rt-custom">Otro <input type="color" aria-label="Resaltado personalizado" @input="applyColor('highlight', ($event.target as HTMLInputElement).value)" /></label>
            <button type="button" class="rt-reset" @click="applyColor('highlight', null)">Quitar resaltado</button>
          </div>
        </span>

        <span class="rt-sep" aria-hidden="true" />

        <button v-for="a in aligns" :key="a.value" v-tooltip.top="a.label" type="button" class="rt-btn" :class="{ 'rt-btn--on': is('paragraph', { textAlign: a.value }) || is('heading', { textAlign: a.value }) }" :aria-label="a.label" :disabled="disabled" @click="chain()?.setTextAlign(a.value).run()">
          <HeroCore :path="a.icon" :size="18" />
        </button>

        <span class="rt-sep" aria-hidden="true" />

        <button v-for="b in blocks" :key="b.label" v-tooltip.top="b.label" type="button" class="rt-btn" :class="{ 'rt-btn--on': b.active() }" :aria-label="b.label" :aria-pressed="b.active()" :disabled="disabled" @click="b.run()">
          <HeroCore :path="b.icon" :size="18" />
        </button>

        <span class="relative">
          <button v-tooltip.top="'Insertar tabla'" type="button" class="rt-btn" :class="{ 'rt-btn--on': is('table') }" aria-label="Insertar tabla" aria-haspopup="true" :aria-expanded="menu === 'table'" :disabled="disabled" @click="menu = menu === 'table' ? null : 'table'">
            <HeroCore :path="mdiTable" :size="18" />
          </button>
          <form v-if="menu === 'table'" class="rt-menu" @submit.prevent="insertTable">
            <label class="rt-custom">Filas <input v-model.number="tableRows" type="number" min="1" max="12" class="w-14 rounded-adm-sm border border-line px-1 py-0.5" aria-label="Filas" /></label>
            <label class="rt-custom">Columnas <input v-model.number="tableCols" type="number" min="1" max="6" class="w-14 rounded-adm-sm border border-line px-1 py-0.5" aria-label="Columnas" /></label>
            <button type="submit" class="rounded-adm-sm bg-primary-500 px-3 py-1 text-adm-sm font-semibold text-white">Insertar</button>
          </form>
        </span>

        <span class="rt-sep" aria-hidden="true" />

        <button v-tooltip.top="'Enlace'" type="button" class="rt-btn" :class="{ 'rt-btn--on': is('link') }" aria-label="Enlace" :aria-pressed="is('link')" :disabled="disabled" @click="openLink">
          <HeroCore :path="mdiLink" :size="18" />
        </button>
        <button v-if="is('link')" v-tooltip.top="'Quitar enlace'" type="button" class="rt-btn" aria-label="Quitar enlace" :disabled="disabled" @click="removeLink">
          <HeroCore :path="mdiLinkOff" :size="18" />
        </button>
        <button v-tooltip.top="'Quitar todo el formato'" type="button" class="rt-btn" aria-label="Quitar todo el formato" :disabled="disabled" @click="chain()?.unsetAllMarks().clearNodes().run()">
          <HeroCore :path="mdiFormatClear" :size="18" />
        </button>

        <span class="ml-auto flex items-center gap-1">
          <button v-tooltip.top="fullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'" type="button" class="rt-btn" :aria-label="fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'" :aria-pressed="fullscreen" @click="toggleFullscreen">
            <HeroCore :path="fullscreen ? mdiFullscreenExit : mdiFullscreen" :size="18" />
          </button>
          <button v-tooltip.top="'Deshacer'" type="button" class="rt-btn" aria-label="Deshacer" :disabled="disabled || !editor?.can().undo()" @click="chain()?.undo().run()">
            <HeroCore :path="mdiUndo" :size="18" />
          </button>
          <button v-tooltip.top="'Rehacer'" type="button" class="rt-btn" aria-label="Rehacer" :disabled="disabled || !editor?.can().redo()" @click="chain()?.redo().run()">
            <HeroCore :path="mdiRedo" :size="18" />
          </button>
        </span>
      </div>

      <div v-if="is('table')" class="flex flex-wrap items-center gap-1 border-b border-line bg-surface-page px-2 py-1.5" role="toolbar" aria-label="Opciones de la tabla">
        <button v-for="t in tableTools" :key="t.label" v-tooltip.top="t.label" type="button" class="rt-btn" :aria-label="t.label" :disabled="disabled" @click="t.run()">
          <HeroCore :path="t.icon" :size="18" />
        </button>
      </div>

      <form v-if="linkOpen" class="flex flex-wrap items-center gap-2 border-b border-line bg-surface-page px-2 py-1.5" @submit.prevent="applyLink">
        <input ref="linkInput" v-model="linkUrl" type="text" inputmode="url" autocomplete="off" placeholder="https://… o /contact" aria-label="Dirección del enlace" class="min-w-48 flex-1 rounded-adm-sm border border-line bg-white px-2 py-1 text-adm-sm outline-none focus:border-primary-500" @keydown.esc.prevent="closeLink" />
        <button type="submit" class="rounded-adm-sm bg-primary-500 px-3 py-1 text-adm-sm font-semibold text-white">Aplicar</button>
        <button type="button" class="rounded-adm-sm px-2 py-1 text-adm-sm text-secondary-500 hover:bg-line" @click="closeLink">Cancelar</button>
        <p v-if="linkError" class="w-full text-adm-sm text-red-600" role="alert">{{ linkError }}</p>
      </form>

      <EditorContent :editor="editor" class="rt-area" :style="fullscreen ? undefined : { minHeight: `${minHeight}px` }" />
      <div class="flex justify-end gap-3 border-t border-line bg-surface-page px-3 py-1 text-adm-sm text-secondary-400" aria-live="off">
        <span>{{ editor?.storage.characterCount.words() ?? 0 }} palabras</span>
        <span>{{ editor?.storage.characterCount.characters() ?? 0 }} caracteres</span>
      </div>
    </div>

    <p v-if="notice" class="mt-1 text-adm-sm text-amber-700" role="status">{{ notice }}</p>
    <MessageCore v-if="messageError" :text="messageError" severity="error" variant="simple" />
  </div>
</template>

<style scoped>
.rt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: var(--radius-adm-sm);
  color: var(--color-secondary-600);
  transition: background-color 0.15s, color 0.15s;
}
.rt-btn:hover:not(:disabled) { background: var(--color-line); color: var(--color-secondary-900); }
.rt-btn--on, .rt-btn--on:hover:not(:disabled) { background: var(--color-secondary-900); color: #fff; }
.rt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rt-btn:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 1px; }
.rt-sep { width: 1px; height: 1.25rem; margin: 0 0.25rem; background: var(--color-line); }

.rt-sel { min-width: 0; }
.rt-sel :deep(.p-select) { height: 1.875rem; }
.rt-sel :deep(.p-select-label) { font-size: 0.75rem; padding-block: 0.25rem; }

.rt-menu {
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 1.5rem);
  gap: 0.375rem;
  width: max-content;
  padding: 0.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-adm-sm);
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}
.rt-swatch { width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 1px solid rgb(0 0 0 / 0.15); }
.rt-swatch:hover { transform: scale(1.12); }
.rt-custom { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--color-secondary-600); }
.rt-custom input { width: 2rem; height: 1.5rem; padding: 0; border: 0; background: none; cursor: pointer; }
.rt-reset { grid-column: 1 / -1; font-size: 0.75rem; text-align: left; color: var(--color-primary-500); }
.rt-reset:hover { text-decoration: underline; }

.rt-area :deep(.rt-content) { min-height: inherit; padding: 0.75rem 0.875rem; outline: none; font-size: 0.875rem; line-height: 1.6; color: var(--color-secondary-900); }
.rt-full { position: fixed; inset: 0; height: 100dvh; z-index: 60; display: flex; flex-direction: column; background: var(--color-surface-page); padding: 0.75rem; }
.rt-full > .rt { display: flex; flex: 1; min-height: 0; flex-direction: column; }
.rt-full .rt-area { flex: 1; min-height: 0; overflow: auto; }
.rt-area :deep(.tableWrapper) { overflow-x: auto; }
.rt-area :deep(.column-resize-handle) { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background: var(--color-primary-500); pointer-events: none; }
.rt-area :deep(.resize-cursor) { cursor: col-resize; }
.rt-area :deep(.rt-content table) { border-collapse: collapse; table-layout: fixed; min-width: 100%; }
.rt-area :deep(.rt-content th), .rt-area :deep(.rt-content td) { border: 1px solid var(--color-line); padding: 0.4rem 0.6rem; vertical-align: top; text-align: left; position: relative; }
.rt-area :deep(.rt-content th) { background: var(--color-surface-page); font-weight: 600; }
.rt-area :deep(.rt-content .selectedCell::after) { content: ""; position: absolute; inset: 0; background: rgb(233 78 27 / 0.12); pointer-events: none; }
.rt-area :deep(.rt-content td > p), .rt-area :deep(.rt-content th > p) { margin: 0; }
.rt-area :deep(.rt-content > * + *) { margin-top: 0.75rem; }
.rt-area :deep(h2) { font-size: 1.375rem; font-weight: 700; line-height: 1.25; }
.rt-area :deep(h3) { font-size: 1.125rem; font-weight: 700; line-height: 1.3; }
.rt-area :deep(h4) { font-size: 1rem; font-weight: 700; line-height: 1.35; }
.rt-area :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.rt-area :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.rt-area :deep(li > p) { margin: 0; }
.rt-area :deep(blockquote) { border-left: 3px solid var(--color-line); padding-left: 0.875rem; color: var(--color-secondary-600); }
.rt-area :deep(hr) { border: 0; border-top: 1px solid var(--color-line); margin: 1rem 0; }
.rt-area :deep(code) { font-family: var(--font-mono); font-size: 0.85em; background: var(--color-line); border-radius: 4px; padding: 0.1em 0.35em; }
.rt-area :deep(p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; height: 0; pointer-events: none; color: var(--color-secondary-400); }
.rt-area :deep(a) { color: var(--color-primary-500); text-decoration: underline; cursor: text; }
</style>
