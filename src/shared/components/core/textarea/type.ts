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
  messagesInfo?: string | string[] | null;
}
