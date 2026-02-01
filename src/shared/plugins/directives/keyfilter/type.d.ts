import { STRING_REGEX } from "@/shared/constants/zod";

export type KeyFilterPreset = keyof typeof STRING_REGEX;
export type KeyFilterValue = KeyFilterPreset | RegExp;

declare global {
  interface HTMLElement {
    _keyFilterRegex?: RegExp | null;
    _keyFilterHandler?: (e: KeyboardEvent) => void;
  }
}
