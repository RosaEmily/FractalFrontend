import type { App } from "vue";
import KeyFilter from "primevue/keyfilter";
export default {
  install(app: App) {
    app.directive("keyfilter", KeyFilter);
  },
};
