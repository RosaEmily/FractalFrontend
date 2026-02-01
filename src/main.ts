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

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, CONFIG);
app.use(ToastService);
app.use(ConfirmationService);
app.use(DirectiveKeyFilter);
app.use(DirectiveTrim);
app.mount("#app");
