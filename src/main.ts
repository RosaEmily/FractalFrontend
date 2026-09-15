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
import {
  setErrorScreenHandler,
  setSessionExpiredHandler,
  zoneFromPath,
} from "@/shared/utils/session";

/*
 * Se inyecta aquí porque el interceptor de axios no puede importar el router
 * sin crear un ciclo. Ante un 401 la sesión ya fue limpiada: solo queda
 * navegar al login guardando la ruta actual para volver luego.
 *
 * El login es el DE LA ZONA donde caducó la sesión, deducida de la ruta que se
 * estaba mirando. Mandar siempre al del panel dejaba al alumno frente al
 * formulario que rechaza su rol, sin forma obvia de volver a su aula.
 */
setSessionExpiredHandler((redirect) => {
  const name =
    zoneFromPath(new URL(redirect, window.location.origin).pathname) ===
    "classroom"
      ? "classroom-login"
      : "login";

  router.replace({ name, query: { redirect } });
});

/*
 * Pantalla de estado ante un error irrecuperable (429, 5xx). Se inyecta igual
 * que la del 401: el interceptor no puede importar el router sin crear un ciclo.
 */
setErrorScreenHandler((status) => {
  router.push({ name: `error-${status}` });
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
