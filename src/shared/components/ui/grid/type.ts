import type { DataPaginationMeta } from "@/shared/interface/api-response";
import type { DataTableProps } from "primevue/datatable";
import type { GridUiColumnProps } from "./column/type";
export type { GridUiColumnProps } from "./column/type";
import type { InjectionKey } from "vue";

export type Action<T> = {
  buttonType?: "link" | "button";
  severity?: "success" | "warn" | "info" | "danger" | "secondary";
  icon?: string;
  label?: string;
  href?: string;
  handler?: (row: T) => void;
  type?: "link" | "button" | "action";
};

export interface GridUiTableProps<T> {
  data?: DataTableProps<T>["value"];
  dataKey?: DataTableProps<T>["dataKey"];
  rows?: DataTableProps<T>["rows"];
  first?: DataTableProps<T>["first"];
  totalRecords?: DataTableProps<T>["totalRecords"];
  paginator?: DataTableProps<T>["paginator"];
  paginatorPosition?: DataTableProps<T>["paginatorPosition"];
  alwaysShowPaginator?: DataTableProps<T>["alwaysShowPaginator"];
  paginatorTemplate?: DataTableProps<T>["paginatorTemplate"];
  pageLinkSize?: DataTableProps<T>["pageLinkSize"];
  rowsPerPageOptions?: DataTableProps<T>["rowsPerPageOptions"];
  currentPageReportTemplate?: DataTableProps<T>["currentPageReportTemplate"];
  lazy?: DataTableProps<T>["lazy"];
  loading?: DataTableProps<T>["loading"];
  loadingIcon?: DataTableProps<T>["loadingIcon"];
  sortField?: DataTableProps<T>["sortField"];
  sortOrder?: DataTableProps<T>["sortOrder"];
  nullSortOrder?: DataTableProps<T>["nullSortOrder"];
  defaultSortOrder?: DataTableProps<T>["defaultSortOrder"];
  multiSortMeta?: DataTableProps<T>["multiSortMeta"];
  sortMode?: DataTableProps<T>["sortMode"];
  removableSort?: DataTableProps<T>["removableSort"];
  filters?: DataTableProps<T>["filters"];
  filterDisplay?: DataTableProps<T>["filterDisplay"];
  globalFilterFields?: DataTableProps<T>["globalFilterFields"];
  filterLocale?: DataTableProps<T>["filterLocale"];
  selection?: DataTableProps<T>["selection"];
  selectionMode?: DataTableProps<T>["selectionMode"];
  compareSelectionBy?: DataTableProps<T>["compareSelectionBy"];
  metaKeySelection?: DataTableProps<T>["metaKeySelection"];
  contextMenu?: DataTableProps<T>["contextMenu"];
  contextMenuSelection?: DataTableProps<T>["contextMenuSelection"];
  selectAll?: DataTableProps<T>["selectAll"];
  rowHover?: DataTableProps<T>["rowHover"];
  csvSeparator?: DataTableProps<T>["csvSeparator"];
  exportFilename?: DataTableProps<T>["exportFilename"];
  exportFunction?: DataTableProps<T>["exportFunction"];
  resizableColumns?: DataTableProps<T>["resizableColumns"];
  columnResizeMode?: DataTableProps<T>["columnResizeMode"];
  reorderableColumns?: DataTableProps<T>["reorderableColumns"];
  expandedRows?: DataTableProps<T>["expandedRows"];
  expandedRowIcon?: DataTableProps<T>["expandedRowIcon"];
  collapsedRowIcon?: DataTableProps<T>["collapsedRowIcon"];
  rowGroupMode?: DataTableProps<T>["rowGroupMode"];
  groupRowsBy?: DataTableProps<T>["groupRowsBy"];
  expandableRowGroups?: DataTableProps<T>["expandableRowGroups"];
  expandedRowGroups?: DataTableProps<T>["expandedRowGroups"];
  stateStorage?: DataTableProps<T>["stateStorage"];
  stateKey?: DataTableProps<T>["stateKey"];
  editMode?: DataTableProps<T>["editMode"];
  editingRows?: DataTableProps<T>["editingRows"];
  rowClass?: DataTableProps<T>["rowClass"];
  rowStyle?: DataTableProps<T>["rowStyle"];
  scrollable?: DataTableProps<T>["scrollable"];
  scrollHeight?: DataTableProps<T>["scrollHeight"];
  virtualScrollerOptions?: DataTableProps<T>["virtualScrollerOptions"];
  frozenValue?: DataTableProps<T>["frozenValue"];
  breakpoint?: DataTableProps<T>["breakpoint"];
  showHeaders?: DataTableProps<T>["showHeaders"];
  showGridlines?: DataTableProps<T>["showGridlines"];
  stripedRows?: DataTableProps<T>["stripedRows"];
  highlightOnSelect?: DataTableProps<T>["highlightOnSelect"];
  size?: DataTableProps<T>["size"];
  tableStyle?: DataTableProps<T>["tableStyle"];
  tableClass?: DataTableProps<T>["tableClass"];
  tableProps?: DataTableProps<T>["tableProps"];
  filterInputProps?: DataTableProps<T>["filterInputProps"];
  filterButtonProps?: DataTableProps<T>["filterButtonProps"];
  editButtonProps?: DataTableProps<T>["editButtonProps"];
  dt?: DataTableProps<T>["dt"];
  pt?: DataTableProps<T>["pt"];
  ptOptions?: DataTableProps<T>["ptOptions"];
  unstyled?: DataTableProps<T>["unstyled"];

  argsFunction?: unknown[];
  checkable?: boolean;
  reload?: (...args: unknown[]) => Promise<DataPaginationMeta>;
  noPagination?: boolean;
  columns: GridUiColumnProps<T>[];
  title?: string;
}

export interface GridUiTableProvider {
  setLoading: (value: boolean) => void;
  refreshData: () => Promise<void>;
}

export const GridKey: InjectionKey<GridUiTableProvider> = Symbol("Grid");

export interface GridUiTableExpose {
  refreshData: () => Promise<void>;
  rowsSelected: NoInfer<any>[] | NoInfer<any>;
}
