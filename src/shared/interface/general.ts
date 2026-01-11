export interface BaseItem<T = number | string | boolean> {
  id: T;
  name: string;
}
export interface BaseCheckedItem {
  label: string;
  checked: boolean;
}

export type Position = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
export type Severity =
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "help"
  | "danger"
  | "contrast";
