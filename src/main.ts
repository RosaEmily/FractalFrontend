import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import { DirectiveKeyFilter, DirectiveTrim } from "./shared/plugins/directives";
import "./style.css";
import { CONFIG } from "@/shared/constants/primevue";
import { setSessionExpiredHandler } from "@/shared/utils/session";

/*
 * Se inyecta aquí porque el interceptor de axios no puede importar el router
 * sin crear un ciclo. Ante un 401 la sesión ya fue limpiada: solo queda
 * navegar al login guardando la ruta actual para volver luego.
 */
setSessionExpiredHandler((redirect) => {
  router.replace({ name: "login", query: { redirect } });
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, CONFIG);
app.use(ToastService);
app.use(ConfirmationService);
app.use(DirectiveKeyFilter);
app.use(DirectiveTrim);
app.mount("#app");
