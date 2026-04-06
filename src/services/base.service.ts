import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export class BaseService {
  protected api: AxiosInstance

  constructor(apiInstance: AxiosInstance) {
    this.api = apiInstance
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.api.get<T>(url, config)
    return res.data
  }

  async post<T, U>(url: string, payload: U, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.api.post<T>(url, payload, config)
    return res.data
  }

  async put<T, U>(url: string, payload: U, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.api.put<T>(url, payload, config)
    return res.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.api.delete<T>(url, config)
    return res.data
  }
}