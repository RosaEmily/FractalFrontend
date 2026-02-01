import type { DirectiveBinding } from "vue";
import { STRING_REGEX } from "@/shared/constants/zod";
import type { KeyFilterPreset } from "./type";

export function getField(
  el: HTMLElement,
): HTMLInputElement | HTMLTextAreaElement | null {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el;
  }
  return el.querySelector("input, textarea");
}

export function resolveRegex(
  binding: DirectiveBinding<RegExp | undefined>,
): RegExp | null {
  const modifiers = Object.keys(binding.modifiers);
  if (modifiers.length > 0) {
    const preset = modifiers[0] as KeyFilterPreset;
    return STRING_REGEX[preset] ?? null;
  }
  if (binding.value instanceof RegExp) {
    return binding.value;
  }

  return null;
}
