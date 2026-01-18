import { type Ref, onMounted, onBeforeUnmount, unref } from "vue";

// Overloads
export function useClickOutsideMulti(
  elements: Ref<HTMLElement | null>,
  onOutside: () => void,
  onInside?: () => void,
  active?: Ref<boolean> | boolean,
): void;

export function useClickOutsideMulti(
  elements: Ref<HTMLElement | null>[],
  onOutside: () => void,
  onInside?: () => void,
  active?: Ref<boolean> | boolean,
): void;

// Implementación
export function useClickOutsideMulti(
  elements: Ref<HTMLElement | null> | Ref<HTMLElement | null>[],
  onOutside: () => void,
  onInside?: () => void,
  active: Ref<boolean> | boolean = true,
) {
  const refsArray = Array.isArray(elements) ? elements : [elements];

  const handleClick = (event: MouseEvent) => {
    if (!unref(active)) return;

    const target = event.target as Node;

    const clickedInside = refsArray.some(
      (el) => el.value && el.value.contains(target),
    );

    if (clickedInside) {
      onInside?.();
    } else {
      onOutside();
    }
  };

  onMounted(() => document.addEventListener("click", handleClick));
  onBeforeUnmount(() => document.removeEventListener("click", handleClick));
}
