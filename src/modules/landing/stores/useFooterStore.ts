import { defineStore } from "pinia";
import { ref } from "vue";
import { footerService } from "../services/footer.service";
import type { Footer } from "../models/footer.model";

export const useFooterStore = defineStore("landing-footer", () => {
  const data = ref<Footer | null>(null);

  function load() {
    data.value = footerService.get();
  }

  return { data, load };
});
