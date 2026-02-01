import type { App, DirectiveBinding } from "vue";
import { getField, resolveRegex } from "./utils";

export default {
  install(app: App) {
    app.directive("keyfilter", {
      mounted(el: HTMLElement, binding: DirectiveBinding<RegExp | undefined>) {
        const field = getField(el);
        if (!field) return;

        const regex = resolveRegex(binding);

        if (!regex) return;

        const handler = (e: KeyboardEvent) => {
          if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) {
            return;
          }

          if (!regex.test(e.key)) {
            e.preventDefault();
          }
        };

        field.addEventListener("keypress", handler);

        el._keyFilterRegex = regex;
        el._keyFilterHandler = handler;
      },

      updated(el: HTMLElement, binding: DirectiveBinding<RegExp | undefined>) {
        const field = getField(el);
        if (!field) return;

        const newRegex = resolveRegex(binding);
        const oldRegex = el._keyFilterRegex;

        if (newRegex?.toString() === oldRegex?.toString()) return;

        if (el._keyFilterHandler) {
          field.removeEventListener("keypress", el._keyFilterHandler);
        }

        if (!newRegex) return;

        const handler = (e: KeyboardEvent) => {
          if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) {
            return;
          }

          if (!newRegex.test(e.key)) {
            e.preventDefault();
          }
        };

        field.addEventListener("keypress", handler);

        el._keyFilterRegex = newRegex;
        el._keyFilterHandler = handler;
      },

      unmounted(el: HTMLElement) {
        const field = getField(el);
        if (!field) return;

        if (el._keyFilterHandler) {
          field.removeEventListener("keypress", el._keyFilterHandler);
        }

        delete el._keyFilterHandler;
        delete el._keyFilterRegex;
      },
    });
  },
};
