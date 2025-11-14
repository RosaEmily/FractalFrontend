import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingService } from '@/services/landing.service'
import type { LandingData } from '@/types/landing'

const landingService = new LandingService()

export const useLandingStore = defineStore('landing', () => {
  //console.log('useLandingStore initialized')
  const data = ref<LandingData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchLanding = async () => {
    //console.log('fetchLanding called')
    loading.value = true
    error.value = null
    try {
      //console.log('landingService.fetchLanding awaited')
      const items = await landingService.fetchLanding()
      data.value = items[0] ?? null
      //console.log('landingService.fetchLanding succeeded', data.value)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchLanding }
})