import type { TextareaProps } from "primevue/textarea";

export interface TextareaCoreProps {
  label?: string;
  defaultValue?: TextareaProps["defaultValue"];
  name?: TextareaProps["name"];
  size?: TextareaProps["size"];
  invalid?: TextareaProps["invalid"];
  variant?: TextareaProps["variant"];
  fluid?: TextareaProps["fluid"];
  formControl?: TextareaProps["formControl"];
  autoResize?: TextareaProps["autoResize"];
  dt?: TextareaProps["dt"];
  pt?: TextareaProps["pt"];
  ptOptions?: TextareaProps["ptOptions"];
  unstyled?: TextareaProps["unstyled"];
  messageError?: string | null;
  /** Marca visual de campo obligatorio en el label. */
  required?: boolean;
  /** Aclaración corta junto al label (el diseño la llama hint). */
  hintLabel?: string | null;
  messagesInfo?: string | string[] | null;
}
