import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingOfferService } from '@/services/landing/offer.service'
import { isApiError, type ApiError } from '@/types/response/api'
import { useLandingOfferAdapter, useLandingOfferListAdapter } from '@/composables/useLandingAdapter'

const landingOfferService = new LandingOfferService()

type LandingOfferAdapted = ReturnType<typeof useLandingOfferAdapter>
type LandingOfferListAdapted = ReturnType<typeof useLandingOfferListAdapter>

export const useLandingOfferStore = defineStore('offer', () => {
  const data = ref<LandingOfferAdapted | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingOffer = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await landingOfferService.fetchLandingOfferData({
        'offset': '0',
        'limit': '4',
        'order': 'enrollment_end_date:desc',
        'filters': JSON.stringify({ type: { matchMode: 'equals', value: 'course' } })
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

export const useLandingOfferListStore = defineStore('offer-list', () => {
  const data = ref<LandingOfferListAdapted | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingOfferList = async (params: Record<string, string>) => {
    loading.value = true
    error.value = null
    try {
      const res = await landingOfferService.fetchLandingOfferData(params)
      data.value = useLandingOfferListAdapter(res)
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

  return { data, loading, error, fetchLandingOfferList }
})