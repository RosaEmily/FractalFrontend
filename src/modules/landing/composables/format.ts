export function formatKpi(value: number, format?: string): string {
  const n = Math.floor(value)
  if (!format) return n.toString()
  return format.replace('{n}', n.toString())
}
