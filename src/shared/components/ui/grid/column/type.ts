import type { ApiResponse } from "@/shared/interface/api-response";
import type { ColumnProps } from "primevue/column";
import type { Component } from "vue";
import type { ButtonCoreProps } from "@/shared/components/core/buttons/type";

export interface GridUiColumnProps<T> {
  columnKey?: ColumnProps["columnKey"];
  sortField?: ColumnProps["sortField"];
  filterField?: ColumnProps["filterField"];
  dataType?: ColumnProps["dataType"];
  sortable?: ColumnProps["sortable"];
  header?: ColumnProps["header"];
  footer?: ColumnProps["footer"];
  style?: ColumnProps["style"];
  class?: ColumnProps["class"];
  headerStyle?: ColumnProps["headerStyle"];
  headerClass?: ColumnProps["headerClass"];
  bodyStyle?: ColumnProps["bodyStyle"];
  bodyClass?: ColumnProps["bodyClass"];
  footerStyle?: ColumnProps["footerStyle"];
  footerClass?: ColumnProps["footerClass"];
  showFilterMenu?: ColumnProps["showFilterMenu"];
  showFilterOperator?: ColumnProps["showFilterOperator"];
  showClearButton?: ColumnProps["showClearButton"];
  showApplyButton?: ColumnProps["showApplyButton"];
  showFilterMatchModes?: ColumnProps["showFilterMatchModes"];
  showAddButton?: ColumnProps["showAddButton"];
  filterMatchModeOptions?: ColumnProps["filterMatchModeOptions"];
  maxConstraints?: ColumnProps["maxConstraints"];
  excludeGlobalFilter?: ColumnProps["excludeGlobalFilter"];
  filterHeaderStyle?: ColumnProps["filterHeaderStyle"];
  filterHeaderClass?: ColumnProps["filterHeaderClass"];
  filterMenuStyle?: ColumnProps["filterMenuStyle"];
  filterMenuClass?: ColumnProps["filterMenuClass"];
  selectionMode?: ColumnProps["selectionMode"];
  expander?: ColumnProps["expander"];
  colspan?: ColumnProps["colspan"];
  rowspan?: ColumnProps["rowspan"];
  rowReorder?: ColumnProps["rowReorder"];
  rowReorderIcon?: ColumnProps["rowReorderIcon"];
  reorderableColumn?: ColumnProps["reorderableColumn"];
  rowEditor?: ColumnProps["rowEditor"];
  frozen?: ColumnProps["frozen"];
  alignFrozen?: ColumnProps["alignFrozen"];
  exportable?: ColumnProps["exportable"];
  exportHeader?: ColumnProps["exportHeader"];
  exportFooter?: ColumnProps["exportFooter"];
  filterMatchMode?: ColumnProps["filterMatchMode"];
  hidden?: ColumnProps["hidden"];
  dt?: ColumnProps["dt"];
  pt?: ColumnProps["pt"];
  ptOptions?: ColumnProps["ptOptions"];
  unstyled?: ColumnProps["unstyled"];

  field: keyof T | "actions";
  type?: "currency" | "number" | "date" | "image" | "url" | "custom" | "state";

  /** --- CUSTOM RENDER --- */
  render?: (row: T) => Component;

  /** --- FORMATO PARA MONEDAS --- */
  currency?: {
    key?: keyof T;
    symbol?: string; // símbolo (si no viene → “S/”)
    position?: "left" | "right"; // lado del símbolo (por defecto left)
    formatOptions?: Intl.NumberFormatOptions; // extra para formatNumber
  };

  /** --- FORMATO PARA NUMBER --- */
  number?: {
    formatOptions?: Intl.NumberFormatOptions;
  };

  /** --- FORMATO PARA URLS --- */
  url?: {
    hrefKey?: keyof T; // nombre del key que contiene la URL
    textKey?: keyof T; // texto a mostrar
    fallbackText?: string; // si no viene textKey → usar URL
    target?: "_blank" | "_self" | "_parent" | "_top"; // target del enlace
  };

  /** --- FORMATO PARA FECHAS --- */
  date?: {
    format?: string; // ejemplo "DD/MM/YY - h:mm A"
  };

  keyToRender?: string;
  keySeparator?: string;
  displaySeparator?: string;
  actions?: Action[];
  filterOptionsMatchMode?: string[];
}

export interface Action {
  type: "redirect" | "button" | "delete" | "state" | "edit";
  icon?: string;
  redirect?: string;
  params?: string | string[];
  handler?:
    | ((data?: any) => void)
    | ((data?: any) => Promise<ApiResponse<unknown>>)
    | ((ids: (number | string)[]) => Promise<null>)
    | ((ids: (number | string)[], state: 0 | 1) => Promise<null>);
  columnKey?: string;
  columnKeyId?: string;
  buttonProps?: ButtonCoreProps;
}
