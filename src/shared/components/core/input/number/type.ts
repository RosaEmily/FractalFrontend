import type { InputNumberProps } from "primevue/inputnumber";

export interface InputNumberCoreProps {
  label?: string;
  name?: InputNumberProps["name"];
  size?: InputNumberProps["size"];
  invalid?: InputNumberProps["invalid"];
  variant?: InputNumberProps["variant"];
  fluid?: InputNumberProps["fluid"];
  placeholder?: InputNumberProps["placeholder"];

  mode?: InputNumberProps["mode"];
  currency?: InputNumberProps["currency"];
  locale?: InputNumberProps["locale"];
  prefix?: InputNumberProps["prefix"];
  suffix?: InputNumberProps["suffix"];

  min?: InputNumberProps["min"];
  max?: InputNumberProps["max"];
  step?: InputNumberProps["step"];
  minFractionDigits?: InputNumberProps["minFractionDigits"];
  maxFractionDigits?: InputNumberProps["maxFractionDigits"];
  useGrouping?: InputNumberProps["useGrouping"];
  showButtons?: InputNumberProps["showButtons"];
  buttonLayout?: InputNumberProps["buttonLayout"];

  dt?: InputNumberProps["dt"];
  pt?: InputNumberProps["pt"];
  ptOptions?: InputNumberProps["ptOptions"];
  unstyled?: InputNumberProps["unstyled"];
  messageError?: string | null;
  /** Marca visual de campo obligatorio en el label. */
  required?: boolean;
  /** Aclaración corta junto al label (el diseño la llama hint). */
  hintLabel?: string | null;
  messagesInfo?: string | string[] | null;
}
