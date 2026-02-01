import type { SelectProps } from "primevue/select";

export interface SelectCoreProps {
  label?: string;
  defaultValue?: SelectProps["defaultValue"];
  name?: SelectProps["name"];

  options?: SelectProps["options"];
  optionLabel?: SelectProps["optionLabel"];
  optionValue?: SelectProps["optionValue"];
  optionDisabled?: SelectProps["optionDisabled"];
  optionGroupLabel?: SelectProps["optionGroupLabel"];
  optionGroupChildren?: SelectProps["optionGroupChildren"];

  scrollHeight?: SelectProps["scrollHeight"];

  filter?: SelectProps["filter"];
  filterPlaceholder?: SelectProps["filterPlaceholder"];
  filterLocale?: SelectProps["filterLocale"];
  filterMatchMode?: SelectProps["filterMatchMode"];
  filterFields?: SelectProps["filterFields"];

  editable?: SelectProps["editable"];
  placeholder?: SelectProps["placeholder"];
  size?: SelectProps["size"];

  invalid?: SelectProps["invalid"];
  disabled?: SelectProps["disabled"];
  variant?: SelectProps["variant"];

  dataKey?: SelectProps["dataKey"];
  showClear?: SelectProps["showClear"];
  fluid?: SelectProps["fluid"];

  inputId?: SelectProps["inputId"];
  inputStyle?: SelectProps["inputStyle"];
  inputClass?: SelectProps["inputClass"];

  labelId?: SelectProps["labelId"];
  labelStyle?: SelectProps["labelStyle"];
  labelClass?: SelectProps["labelClass"];

  panelStyle?: SelectProps["panelStyle"];
  panelClass?: SelectProps["panelClass"];
  overlayStyle?: SelectProps["overlayStyle"];
  overlayClass?: SelectProps["overlayClass"];

  appendTo?: SelectProps["appendTo"];

  loading?: SelectProps["loading"];
  clearIcon?: SelectProps["clearIcon"];
  dropdownIcon?: SelectProps["dropdownIcon"];
  filterIcon?: SelectProps["filterIcon"];
  loadingIcon?: SelectProps["loadingIcon"];

  resetFilterOnHide?: SelectProps["resetFilterOnHide"];
  resetFilterOnClear?: SelectProps["resetFilterOnClear"];

  virtualScrollerOptions?: SelectProps["virtualScrollerOptions"];

  autoOptionFocus?: SelectProps["autoOptionFocus"];
  autoFilterFocus?: SelectProps["autoFilterFocus"];
  selectOnFocus?: SelectProps["selectOnFocus"];
  focusOnHover?: SelectProps["focusOnHover"];
  highlightOnSelect?: SelectProps["highlightOnSelect"];
  checkmark?: SelectProps["checkmark"];

  filterMessage?: SelectProps["filterMessage"];
  selectionMessage?: SelectProps["selectionMessage"];
  emptySelectionMessage?: SelectProps["emptySelectionMessage"];
  emptyFilterMessage?: SelectProps["emptyFilterMessage"];
  emptyMessage?: SelectProps["emptyMessage"];

  tabindex?: SelectProps["tabindex"];
  ariaLabel?: SelectProps["ariaLabel"];
  ariaLabelledby?: SelectProps["ariaLabelledby"];

  formControl?: SelectProps["formControl"];

  dt?: SelectProps["dt"];
  pt?: SelectProps["pt"];
  ptOptions?: SelectProps["ptOptions"];

  unstyled?: SelectProps["unstyled"];
  messageError?: string | null;
  service?: () => Promise<unknown[]>;
  autoLoad?: boolean;
}
