/**
 * Formatea un importe en soles.
 *
 * ⚠️ El símbolo NO está fijo en el código aunque el catálogo de hoy sea solo en
 * soles: `offers.currency_id` existe y hay 9 monedas sembradas, así que el
 * símbolo se recibe y la función lo respeta. Por defecto usa soles porque es la
 * moneda de la operación en Perú.
 */
export const formatMoney = (
  amount: number,
  symbol = "S/",
  decimals = 2,
): string =>
  `${symbol} ${Number(amount).toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
