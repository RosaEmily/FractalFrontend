import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingService } from '@/services/landing.service'
import { type LandingData } from '@/types/response/landing'
import { isApiError, type ApiError } from '@/types/response/api'

const landingService = new LandingService()

export const useLandingStore = defineStore('landing', () => {
  const data = ref<LandingData | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLanding = async () => {
    loading.value = true
    error.value = null
    try {
      const items = await landingService.fetchLanding()
      data.value = items ?? null
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

  return { data, loading, error, fetchLanding }
})