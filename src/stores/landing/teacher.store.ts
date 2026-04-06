import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LandingTeacherService } from '@/services/landing/teacher.service'
import { isApiError, type ApiError } from '@/types/response/api'
import { useLandingTeacherAdapter } from '@/composables/useLandingAdapter'

const landingTeacherService = new LandingTeacherService()

type LandingTeacherAdapted = ReturnType<typeof useLandingTeacherAdapter>

export const useLandingTeacherStore = defineStore('teacher', () => {
  const data = ref<LandingTeacherAdapted | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const fetchLandingTeacher = async () => {
    loading.value = true
    error.value = null
    try {
      const items = await landingTeacherService.fetchLandingTeacherData()
      data.value = useLandingTeacherAdapter(items)
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

  return { data, loading, error, fetchLandingTeacher }
})