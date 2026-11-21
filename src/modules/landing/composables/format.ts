export function formatKpi(value: number, format?: string): string {
  const n = Math.floor(value)
  if (!format) return n.toString()
  return format.replace('{n}', n.toString())
}

/**
 * Parte el formato de una métrica en lo que va antes y después del número:
 * "+{n}%" → prefijo "+", sufijo "%". Antes solo se conservaba el sufijo y
 * "+{n}%" se pintaba como "95+%".
 */
export function splitKpiFormat(format?: string | null): { prefix: string; suffix: string } {
  const [before = '', after = ''] = (format ?? '').split('{n}')
  return { prefix: before.trim(), suffix: after.trim() }
}
