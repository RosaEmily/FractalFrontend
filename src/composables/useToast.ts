import { ref } from 'vue'

type ToastType = 'error' | 'success' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const queue = ref<ToastItem[]>([])
let nextId = 0

export function useToast() {
  function show(msg: string, toastType: ToastType = 'error', duration = 4000) {
    const id = nextId++
    queue.value.push({ id, message: msg, type: toastType })
    setTimeout(() => hide(id), duration)
  }

  function hide(id: number) {
    queue.value = queue.value.filter(t => t.id !== id)
  }

  return { queue, show, hide }
}
