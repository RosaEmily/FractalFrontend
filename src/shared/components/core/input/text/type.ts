import type { InputTextProps } from "primevue/inputtext";

export interface InputTextCoreProps {
  label?: string;
  defaultValue?: InputTextProps["defaultValue"];
  name?: InputTextProps["name"];
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
  messagesInfo?: string | string[] | null;
}
