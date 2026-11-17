import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGeneralStore } from "../stores/useGeneralStore";

/**
 * Canales de contacto del sitio, tal cual los configura el panel.
 *
 * Todo sale de `landing/general`: si el panel no cargó un dato, el getter
 * devuelve `null` y quien lo pinta lo omite — nunca un número o correo de
 * relleno, que es lo que había escrito a mano en seis componentes.
 */
export function useSiteContact() {
  const store = useGeneralStore();
  const router = useRouter();
  onMounted(() => store.ensure());

  const contacts = computed(() => store.data?.contact ?? []);
  const valueOf = (...types: string[]) =>
    contacts.value.find((c) => types.includes(c.type))?.value ?? null;

  const email = computed(() => valueOf("email"));
  const phone = computed(() => valueOf("mobile", "phone"));
  const address = computed(() => valueOf("address"));

  /** `whatsapp` de Configuración; si no está, el celular de Contactos. */
  const whatsappDigits = computed(() => {
    const raw = store.data?.whatsapp || valueOf("mobile") || "";
    return raw.replace(/\D/g, "") || null;
  });

  const whatsappHref = (text?: string): string | null =>
    whatsappDigits.value
      ? `https://wa.me/${whatsappDigits.value}${text ? `?text=${encodeURIComponent(text)}` : ""}`
      : null;

  /**
   * "Hablar con un asesor": WhatsApp si el panel configuró un número y, si no,
   * la página de Contacto — mejor eso que un número de ejemplo.
   */
  const advisorHref = (text?: string): string =>
    whatsappHref(text) ?? router.resolve({ name: "contact" }).href;

  const telHref = computed(() => (phone.value ? `tel:${phone.value.replace(/[^\d+]/g, "")}` : null));
  const mailHref = computed(() => (email.value ? `mailto:${email.value}` : null));

  return {
    loaded: computed(() => store.data !== null),
    email,
    phone,
    address,
    whatsappDigits,
    whatsappHref,
    advisorHref,
    telHref,
    mailHref,
    socialNetworks: computed(() => store.data?.social_networks ?? []),
    faqs: computed(() => store.data?.faqs ?? []),
    complaintsBook: computed(() => store.data?.complaints_book ?? null),
    footer: computed(() => store.data?.footer ?? null),
  };
}
