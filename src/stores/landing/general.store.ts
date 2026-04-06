import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingGeneralService } from '@/services/landing/general.service'
import { isApiError, type ApiError } from '@/types/response/api'
import { useLandingGeneralAdapter } from '@/composables/useLandingAdapter'

const landingGeneralService = new LandingGeneralService()

type LandingGeneralAdapted = ReturnType<typeof useLandingGeneralAdapter>

export const useLandingGeneralStore = defineStore('general', () => {
  const data = ref<LandingGeneralAdapted | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingGeneral = async () => {
    loading.value = true
    error.value = null
    try {
      const items = await landingGeneralService.fetchLandingGeneralData()
      data.value = useLandingGeneralAdapter(items)
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

  return { data, loading, error, fetchLandingGeneral }
})