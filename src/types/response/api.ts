export interface ApiError {
  code: number
  message: string
  details: { [key: string]: unknown } | null
}

export interface ApiResponse<T> {
  success: boolean
  error: ApiError
  data: T | null
}

export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj
  )
}