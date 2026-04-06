import axios from 'axios'
import type { ApiError } from '@/types/response/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_FRACTAL,
  timeout: 5000
})

// Interceptor de request
api.interceptors.request.use(config => {
  console.info('[API Request]', config.method?.toUpperCase(), config.url)
  return config
})

// Interceptor de response
api.interceptors.response.use(
  response => {
    console.info('[API Response]', response.status, response.config.url)
    return response
  },
  error => {
    const apiError: ApiError = error.response?.data?.error ?? {
      code: error.response?.status ?? 500,
      message: error.message,
      details: null
    }
    console.error('[API Error]', apiError.code, apiError.message, apiError.details)
    return Promise.reject(apiError)
  }
)