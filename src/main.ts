import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import PrimeVue from "primevue/config";

import "./style.css";
import { CONFIG } from "@/shared/constants/primevue";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, CONFIG);
app.mount("#app");
