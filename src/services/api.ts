import axios from "axios";
import { API_FRACTAL } from "@/shared/config/env.config";

export const api = axios.create({
  baseURL: API_FRACTAL,
  timeout: 5000,
});

// Interceptor de request
api.interceptors.request.use((config) => {
  console.log("[API Request]", config.method?.toUpperCase(), config.url);
  return config;
});

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    console.log("[API Response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    const message = error.response?.data?.error?.message || error.message;
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  },
);
