import type { AvatarProps } from "primevue/avatar";
export interface AvatarCoreProps {
  label?: AvatarProps["label"];
  icon?: AvatarProps["icon"];
  image?: AvatarProps["image"];
  size?: AvatarProps["size"];
  shape?: AvatarProps["shape"];
  ariaLabel?: AvatarProps["ariaLabel"];
  ariaLabelledby?: AvatarProps["ariaLabelledby"];
  dt?: AvatarProps["dt"];
  pt?: AvatarProps["pt"];
  ptOptions?: AvatarProps["ptOptions"];
  unstyled?: AvatarProps["unstyled"];
  /** Foto (URL) o nombre. Si es URL se muestra como imagen. */
  text?: string;
  /**
   * De dónde salen las iniciales cuando `text` es una URL que no carga.
   * Sin esto se calcularían sobre la propia URL (una "H" de `https`).
   */
  fallbackText?: string;
}
