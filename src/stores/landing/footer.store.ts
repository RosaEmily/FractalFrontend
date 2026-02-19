import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingFooterService } from '@/services/landing/footer.service'
import { type LandingFooterData } from '@/types/response/footer'
import { isApiError, type ApiError } from '@/types/response/api'
import { useLandingFooterAdapter } from '@/composables/useLandingAdapter'

const landingFooterService = new LandingFooterService()

export const useLandingFooterStore = defineStore('footer', () => {
  const data = ref<LandingFooterData | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingFooter = async () => {
    loading.value = true
    error.value = null
    try {
      const items = await landingFooterService.fetchLandingFooterData()
      data.value = useLandingFooterAdapter(items)
    } catch (err: unknown) {
      error.value = isApiError(err) ? err : {
        code: 500,
        message: 'Unexpected error',
        details: null
      }  
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchLandingFooter }
})