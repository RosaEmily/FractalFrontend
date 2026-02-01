import type { App, DirectiveBinding } from "vue";
import type { TrimMode } from "./type";
import { getField } from "./utils";
export default {
  install(app: App) {
    app.directive("trim", {
      mounted(el: HTMLElement, binding: DirectiveBinding<TrimMode>) {
        const field = getField(el);
        if (!field) return;

        const mode: TrimMode = binding.value ?? "input";

        const normalizeSpaces = (value: string): string => {
          value = value.replace(/^\s+/, "").replace(/ {2,}/g, " ");
          return value;
        };

        const handleInput = (e: Event) => {
          if (mode === "blur") return;

          const target = e.target as HTMLInputElement | HTMLTextAreaElement;

          const normalized = normalizeSpaces(target.value);
          if (normalized !== target.value) {
            target.value = normalized;
            target.dispatchEvent(new Event("input", { bubbles: true }));
          }
        };

        const handleBlur = () => {
          const value = field.value.trim();

          if (value !== field.value) {
            field.value = value;
            field.dispatchEvent(new Event("input", { bubbles: true }));
          }
        };

        field.addEventListener("input", handleInput);
        field.addEventListener("blur", handleBlur);

        el._trimHandler = handleInput;
        el._trimBlurHandler = handleBlur;
        el._trimConfig = { mode };
      },

      updated(el: HTMLElement, binding: DirectiveBinding<TrimMode>) {
        const field = getField(el);
        if (!field || !el._trimConfig) return;

        const newMode: TrimMode = binding.value ?? "input";
        const oldMode = el._trimConfig.mode;

        if (newMode !== oldMode) {
          el._trimConfig.mode = newMode;
        }
      },

      unmounted(el: HTMLElement) {
        const field = getField(el);
        if (!field) return;

        if (el._trimHandler) {
          field.removeEventListener("input", el._trimHandler);
        }

        if (el._trimBlurHandler) {
          field.removeEventListener("blur", el._trimBlurHandler);
        }

        delete el._trimHandler;
        delete el._trimBlurHandler;
        delete el._trimConfig;
      },
    });
  },
};
