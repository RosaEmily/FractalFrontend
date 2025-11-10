import { ref } from 'vue'
import { formatKpi } from '@/utils/format'

export function useCountUp(target: number, format: string, duration = 2000) {
  const currentValue = ref(formatKpi(0, format))
  const hasAnimated = ref(false)

  const start = () => {
    if (hasAnimated.value) return // evita reiniciar el conteo
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      currentValue.value = formatKpi(target * eased, format)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        currentValue.value = formatKpi(target, format)
        hasAnimated.value = true
      }
    }

    requestAnimationFrame(animate)
  }

  return { currentValue, start, hasAnimated }
}
