import type { PasswordProps } from "primevue/password";

export interface InputPasswordCoreProps {
  label?: string;

  name?: PasswordProps["name"];
  promptLabel?: PasswordProps["promptLabel"];
  mediumRegex?: PasswordProps["mediumRegex"];
  strongRegex?: PasswordProps["strongRegex"];
  weakLabel?: PasswordProps["weakLabel"];
  mediumLabel?: PasswordProps["mediumLabel"];
  strongLabel?: PasswordProps["strongLabel"];
  feedback?: PasswordProps["feedback"];
  appendTo?: PasswordProps["appendTo"];
  toggleMask?: PasswordProps["toggleMask"];
  maskIcon?: PasswordProps["maskIcon"];
  unmaskIcon?: PasswordProps["unmaskIcon"];
  showClear?: PasswordProps["showClear"];
  size?: PasswordProps["size"];
  invalid?: PasswordProps["invalid"];
  disabled?: PasswordProps["disabled"];
  variant?: PasswordProps["variant"];
  placeholder?: PasswordProps["placeholder"];
  required?: PasswordProps["required"];
  fluid?: PasswordProps["fluid"];
  autofocus?: PasswordProps["autofocus"];
  inputId?: PasswordProps["inputId"];
  inputStyle?: PasswordProps["inputStyle"];
  inputClass?: PasswordProps["inputClass"];
  inputProps?: PasswordProps["inputProps"];
  panelId?: PasswordProps["panelId"];
  panelClass?: PasswordProps["panelClass"];
  panelStyle?: PasswordProps["panelStyle"];
  panelProps?: PasswordProps["panelProps"];
  overlayId?: PasswordProps["overlayId"];
  overlayClass?: PasswordProps["overlayClass"];
  overlayStyle?: PasswordProps["overlayStyle"];
  overlayProps?: PasswordProps["overlayProps"];
  ariaLabelledby?: PasswordProps["ariaLabelledby"];
  ariaLabel?: PasswordProps["ariaLabel"];
  formControl?: PasswordProps["formControl"];
  dt?: PasswordProps["dt"];
  pt?: PasswordProps["pt"];
  ptOptions?: PasswordProps["ptOptions"];
  unstyled?: PasswordProps["unstyled"];

  messageError?: string | null;
}
