import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingOfferService } from '@/services/landing/offer.service'
import { isApiError, type ApiError } from '@/types/response/api'
import { useLandingOfferAdapter } from '@/composables/useLandingAdapter'

const landingOfferService = new LandingOfferService()

type LandingOfferAdapted = ReturnType<typeof useLandingOfferAdapter>

export const useLandingOfferStore = defineStore('offer', () => {
  const data = ref<LandingOfferAdapted | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingOffer = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await landingOfferService.fetchLandingOfferData({
        'page': '1',
        'take': '4',
        'order': 'enrollment_end_date:desc',
        'filters': JSON.stringify({ type: { matchMode: 'equals', value: 'curso' } })
      })
      data.value = useLandingOfferAdapter(res)
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

  return { data, loading, error, fetchLandingOffer }
})