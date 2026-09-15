import type { Offer } from "@/modules/landing/models/offer.model";
import type { PaymentMethodDTO } from "../dto/checkout.dto";
import type { CartItem, PaymentMethod } from "../models/checkout.model";

export const PaymentMethodAdapter = {
  one: (dto: PaymentMethodDTO): PaymentMethod => ({
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    type: dto.type,
    sort_order: dto.sort_order,
  }),

  many: (dtos: PaymentMethodDTO[]): PaymentMethod[] =>
    dtos.map(PaymentMethodAdapter.one),
};

/**
 * Convierte un programa de la landing en una línea de carrito.
 *
 * Se guarda una copia de los datos que la línea necesita para pintarse en vez
 * de la oferta entera: el carrito vive en `localStorage` y sobrevive a recargas,
 * así que guardar el objeto completo lo llenaría de cursos, horarios y docentes
 * que la línea no muestra.
 *
 * ⚠️ El PRECIO guardado es solo para pintar el resumen. El importe que se cobra
 * lo recalcula el backend en cada validación: si la oferta cambia de precio
 * entre que se agregó al carrito y se paga, manda el del servidor.
 */
export const CartItemAdapter = {
  fromOffer: (offer: Offer): CartItem => {
    const courseCount = offer.courses?.length ?? 0;
    // Igual que el detalle del programa: la forma la da el nº de cursos, no
    // el campo `type`.
    const isPath = courseCount > 1;
    const months = offer.duration_months ?? 0;

    return {
      offerId: offer.id,
      name: offer.name,
      prefix: offer.prefix,
      imageUrl: offer.image_url,
      /*
       * ⚠️ `price_raw`, NO `price`: el listado público devuelve `price` ya
       * FORMATEADO (`"$ 199.99"`), y `Number()` sobre eso da NaN — el carrito
       * entero mostraba `S/ NaN`. `price_raw` trae el decimal crudo, que la API
       * serializa como string.
       */
      price: Number(offer.price_raw ?? 0),
      isPath,
      kind: isPath ? "Línea de carrera" : "Curso individual",
      /*
       * La duración se deriva de las fechas de los cursos, así que un programa
       * sin fechas cargadas no la tiene. Se omite en vez de escribir "0 meses",
       * que afirma algo falso.
       */
      meta: [
        isPath ? `${courseCount} cursos` : null,
        months ? `${months} ${months === 1 ? "mes" : "meses"}` : null,
        isPath
          ? null
          : `${offer.courses?.[0]?.schedules?.length ?? 0} días/sem`,
      ]
        .filter(Boolean)
        .join(" · "),
      courseCount,
      durationMonths: months,
      currencyId: offer.currency_id ?? 1,
    };
  },
};
