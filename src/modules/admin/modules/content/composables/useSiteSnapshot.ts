import { computed, onMounted } from "vue";
import { useGeneralStore } from "@/modules/landing/stores/useGeneralStore";

/**
 * Lo que la landing tiene publicado hoy (contactos, redes, textos del pie).
 * Las vistas previas parten de esto y le superponen el borrador que se edita,
 * así se ve el pie completo y no solo el dato nuevo.
 */
export function useSiteSnapshot() {
  const store = useGeneralStore();
  onMounted(() => store.ensure());

  const contacts = computed(() => store.data?.contact ?? []);
  const valueOf = (...types: string[]) =>
    contacts.value.find((c) => types.includes(c.type))?.value ?? null;

  return {
    ready: computed(() => store.data !== null),
    contacts,
    email: computed(() => valueOf("email")),
    phone: computed(() => valueOf("mobile", "phone")),
    address: computed(() => valueOf("address")),
    whatsapp: computed(() => store.data?.whatsapp ?? null),
    socialNetworks: computed(() => store.data?.social_networks ?? []),
    footer: computed(() => store.data?.footer ?? null),
  };
}
