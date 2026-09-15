import type { InputTextProps } from "primevue/inputtext";

export interface InputTextCoreProps {
  label?: string;
  defaultValue?: InputTextProps["defaultValue"];
  name?: InputTextProps["name"];
  placeholder?: InputTextProps["placeholder"];
  size?: InputTextProps["size"];
  invalid?: InputTextProps["invalid"];
  variant?: InputTextProps["variant"];
  fluid?: InputTextProps["fluid"];
  formControl?: InputTextProps["formControl"];
  dt?: InputTextProps["dt"];
  pt?: InputTextProps["pt"];
  ptOptions?: InputTextProps["ptOptions"];
  unstyled?: InputTextProps["unstyled"];
  messageError?: string | null;
  /** Marca visual de campo obligatorio en el label. */
  required?: boolean;
  /** Aclaración corta junto al label (el diseño la llama hint). */
  hintLabel?: string | null;
  messagesInfo?: string | string[] | null;
}
