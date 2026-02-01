export function getField(
  el: HTMLElement,
): HTMLInputElement | HTMLTextAreaElement | null {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el;
  }

  return el.querySelector("input, textarea");
}
