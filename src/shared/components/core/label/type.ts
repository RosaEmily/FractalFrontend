export interface LabelCoreProps {
  text: string;
  htmlFor?: string;
  /** Marca el campo como obligatorio con un asterisco, como en el diseño. */
  required?: boolean;
  /** Aclaración corta a la derecha del label, precedida por "·". */
  hint?: string | null;
}
