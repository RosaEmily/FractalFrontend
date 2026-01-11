import type { ImageProps } from "primevue/image";
export interface ImageCoreProps {
  src?: ImageProps["src"];
  preview?: ImageProps["preview"];
  imageStyle?: ImageProps["imageStyle"];
  imageClass?: ImageProps["imageClass"];
  indicatorIcon?: ImageProps["indicatorIcon"];
  previewIcon?: ImageProps["previewIcon"];
  zoomInDisabled?: ImageProps["zoomInDisabled"];
  zoomOutDisabled?: ImageProps["zoomOutDisabled"];
  dt?: ImageProps["dt"];
  pt?: ImageProps["pt"];
  ptOptions?: ImageProps["ptOptions"];
  unstyled?: ImageProps["unstyled"];
}
