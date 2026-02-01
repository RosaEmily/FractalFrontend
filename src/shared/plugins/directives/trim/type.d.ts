export type TrimMode = "blur" | "input";

export interface TrimConfig {
  mode: TrimMode;
}

declare global {
  interface HTMLElement {
    _trimConfig?: TrimConfig;
    _trimHandler?: (e: Event) => void;
    _trimBlurHandler?: () => void;
  }
}
