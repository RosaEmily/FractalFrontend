import type { DialogProps } from "primevue/dialog";

export interface ModalCoreProps {
  header?: DialogProps["header"];
  footer?: DialogProps["footer"];
  modal?: DialogProps["modal"];
  contentStyle?: DialogProps["contentStyle"];
  contentClass?: DialogProps["contentClass"];
  contentProps?: DialogProps["contentProps"];
  closable?: DialogProps["closable"];
  dismissableMask?: DialogProps["dismissableMask"];
  closeOnEscape?: DialogProps["closeOnEscape"];
  showHeader?: DialogProps["showHeader"];
  blockScroll?: DialogProps["blockScroll"];
  baseZIndex?: DialogProps["baseZIndex"];
  autoZIndex?: DialogProps["autoZIndex"];
  position?: DialogProps["position"];
  maximizable?: DialogProps["maximizable"];
  breakpoints?: DialogProps["breakpoints"];
  draggable?: DialogProps["draggable"];
  keepInViewport?: DialogProps["keepInViewport"];
  minX?: DialogProps["minX"];
  minY?: DialogProps["minY"];
  appendTo?: DialogProps["appendTo"];
  style?: DialogProps["style"];
  closeIcon?: DialogProps["closeIcon"];
  maximizeIcon?: DialogProps["maximizeIcon"];
  minimizeIcon?: DialogProps["minimizeIcon"];
  closeButtonProps?: DialogProps["closeButtonProps"];
  maximizeButtonProps?: DialogProps["maximizeButtonProps"];
  dt?: DialogProps["dt"];
  pt?: DialogProps["pt"];
  ptOptions?: DialogProps["ptOptions"];
  unstyled?: DialogProps["unstyled"];
}

export interface ModalCoreEmits {
  (e: "hide" | "after-hide" | "show"): void;
  (e: "maximize" | "unmaximize" | "dragstart" | "dragend", event: Event): void;
}
