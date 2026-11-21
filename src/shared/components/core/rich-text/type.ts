export interface RichTextCoreProps {
  label?: string;
  required?: boolean;
  /** Aclaración corta junto al label. */
  hintLabel?: string | null;
  messageError?: string | null;
  invalid?: boolean;
  /** Alto mínimo del área de escritura (px). */
  minHeight?: number;
  disabled?: boolean;
  placeholder?: string;
}
