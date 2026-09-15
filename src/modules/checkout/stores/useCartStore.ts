import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Offer } from "@/modules/landing/models/offer.model";
import { CartItemAdapter } from "../adapters/checkout.adapter";
import type { CartItem, CartProblem, CartTotals } from "../models/checkout.model";
import { checkoutService } from "../services/checkout.service";

const STORAGE_KEY = "fractal.cart";

/**
 * Carrito de compra.
 *
 * Vive en el cliente y se persiste en `localStorage`: el visitante puede no
 * tener sesión cuando agrega el primer programa, así que no hay dónde guardarlo
 * en el servidor todavía. Al pagar, el backend revalida todo — el carrito es
 * una intención, no una reserva.
 *
 * ⚠️ **Ningún importe se calcula acá.** Los totales y el IGV los devuelve
 * `checkout/validate`: duplicar la fórmula en el front garantiza que algún día
 * muestre una cifra distinta de la que se cobra.
 */
export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>(readStorage());
  const problems = ref<CartProblem[]>([]);
  const totals = ref<CartTotals | null>(null);
  const validating = ref(false);

  function readStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Un carrito corrupto no debe romper la landing entera.
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
    } catch {
      // Modo incógnito o cuota llena: el carrito sigue vivo en memoria.
    }
  }

  const offerIds = computed(() => items.value.map((i) => i.offerId));
  const count = computed(() => items.value.length);
  const isEmpty = computed(() => items.value.length === 0);

  /**
   * Importe calculado en el cliente.
   *
   * Es el respaldo mientras `validate()` responde, y **es lo que se pinta si el
   * usuario entra directo a un paso intermedio**: los totales del servidor no
   * se persisten (los precios pueden cambiar), así que sin este respaldo el
   * resumen mostraría S/ 0.00 en cada recarga.
   *
   * El importe que se cobra siempre es el del backend.
   */
  const localTotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price, 0),
  );

  /**
   * Asegura que haya totales para pintar.
   *
   * Cada paso del checkout es una URL propia y recargable, así que el store
   * puede montarse sin haber pasado por el carrito. Se revalida una sola vez;
   * llamarlo de nuevo con totales ya cargados no repite la petición.
   */
  async function ensureValidated(): Promise<void> {
    if (isEmpty.value || totals.value || validating.value) return;
    await validate();
  }

  const has = (offerId: number) =>
    items.value.some((i) => i.offerId === offerId);

  /** Problema que afecta a una línea concreta, para marcarla en la lista. */
  const problemOf = (offerId: number) =>
    problems.value.find((p) => p.offer_id === offerId) ?? null;

  /** Problemas que no son de una línea (moneda mixta, por ejemplo). */
  const globalProblems = computed(() =>
    problems.value.filter((p) => p.offer_id === null),
  );

  function add(offer: Offer) {
    // Sin cantidades: un programa entra una vez. Matricularse dos veces en la
    // misma cohorte no significa nada, y el backend lo rechaza igual.
    if (has(offer.id)) return;

    items.value.push(CartItemAdapter.fromOffer(offer));
    persist();
  }

  function remove(offerId: number) {
    items.value = items.value.filter((i) => i.offerId !== offerId);
    problems.value = problems.value.filter((p) => p.offer_id !== offerId);
    persist();
  }

  function clear() {
    items.value = [];
    problems.value = [];
    totals.value = null;
    persist();
  }

  /**
   * Revalida contra el servidor. Devuelve si el carrito se puede comprar.
   *
   * Se llama al entrar al checkout y antes de pagar: entre una cosa y otra el
   * cupo puede llenarse o el precio cambiar.
   */
  async function validate(): Promise<boolean> {
    if (isEmpty.value) {
      problems.value = [];
      totals.value = null;
      return false;
    }

    validating.value = true;
    try {
      const result = await checkoutService.validate(offerIds.value);
      problems.value = result?.problems ?? [];
      totals.value = result?.totals ?? null;
      return result?.valid ?? false;
    } finally {
      validating.value = false;
    }
  }

  return {
    items,
    problems,
    totals,
    validating,
    offerIds,
    count,
    isEmpty,
    localTotal,
    globalProblems,
    has,
    problemOf,
    add,
    remove,
    clear,
    validate,
    ensureValidated,
  };
});
