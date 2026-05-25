import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useIntersectionObserver(target: () => HTMLElement | null, options?: IntersectionObserverInit) {
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const el = target()
    if (!el) return

    observer = new IntersectionObserver(([entry = null]) => {
      isIntersecting.value = entry?.isIntersecting ?? false
    }, options)

    observer.observe(el)
  })

  onBeforeUnmount(() => {
    const el = target()
    if (observer && el) observer.unobserve(el)
  })

  return { isIntersecting }
}