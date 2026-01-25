import type { ToggleSwitchProps } from "primevue";

export interface ToggleCoreProps {
  modelValue?: ToggleSwitchProps["modelValue"];
  defaultValue?: ToggleSwitchProps["defaultValue"];
  name?: ToggleSwitchProps["name"];
  trueValue?: ToggleSwitchProps["trueValue"];
  falseValue?: ToggleSwitchProps["falseValue"];
  invalid?: ToggleSwitchProps["invalid"];
  disabled?: ToggleSwitchProps["disabled"];
  readonly?: ToggleSwitchProps["readonly"];
  tabindex?: ToggleSwitchProps["tabindex"];
  inputId?: ToggleSwitchProps["inputId"];
  inputClass?: ToggleSwitchProps["inputClass"];
  inputStyle?: ToggleSwitchProps["inputStyle"];
  ariaLabelledby?: ToggleSwitchProps["ariaLabelledby"];
  ariaLabel?: ToggleSwitchProps["ariaLabel"];
  formControl?: ToggleSwitchProps["formControl"];
  dt?: ToggleSwitchProps["dt"];
  pt?: ToggleSwitchProps["pt"];
  ptOptions?: ToggleSwitchProps["ptOptions"];
  unstyled?: ToggleSwitchProps["unstyled"];
}

export interface ToggleCoreEmits {
  (e: "update:model-value", value: string | boolean | undefined): void;
}
