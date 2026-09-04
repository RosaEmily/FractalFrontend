import type { MultiSelectProps } from "primevue/multiselect";

export interface MultiSelectCoreProps {
  label?: string;
  defaultValue?: MultiSelectProps["defaultValue"];
  name?: MultiSelectProps["name"];
  options?: MultiSelectProps["options"];
  optionLabel?: MultiSelectProps["optionLabel"];
  optionValue?: MultiSelectProps["optionValue"];
  optionDisabled?: MultiSelectProps["optionDisabled"];
  placeholder?: MultiSelectProps["placeholder"];
  size?: MultiSelectProps["size"];
  disabled?: MultiSelectProps["disabled"];
  showClear?: MultiSelectProps["showClear"];
  filter?: MultiSelectProps["filter"];
  filterPlaceholder?: MultiSelectProps["filterPlaceholder"];
  filterFields?: MultiSelectProps["filterFields"];
  display?: MultiSelectProps["display"];
  selectionLimit?: MultiSelectProps["selectionLimit"];
  scrollHeight?: MultiSelectProps["scrollHeight"];
  selectedItemsLabel?: MultiSelectProps["selectedItemsLabel"];
  maxSelectedLabels?: MultiSelectProps["maxSelectedLabels"];
  loading?: MultiSelectProps["loading"];
  loadingIcon?: MultiSelectProps["loadingIcon"];

  dt?: MultiSelectProps["dt"];
  pt?: MultiSelectProps["pt"];
  ptOptions?: MultiSelectProps["ptOptions"];

  unstyled?: MultiSelectProps["unstyled"];
  messageError?: string | null;
  /** Marca visual de campo obligatorio en el label. */
  required?: boolean;
  /** Aclaración corta junto al label (el diseño la llama hint). */
  hintLabel?: string | null;
  service?: () => Promise<unknown[]>;
  autoLoad?: boolean;
}
