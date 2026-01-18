// infra/api/api-client.ts
import axios from "axios";
import Cookies from "js-cookie";
import { ApiRequest } from "./base";

import {
  COOKIE_NAME_SESSION,
  API_FRACTAL_V2,
} from "@/shared/config/env.config";

const apiAxios = axios.create({
  baseURL: `${API_FRACTAL_V2}/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Interceptor de auth (infraestructura)
apiAxios.interceptors.request.use((config) => {
  const NAME_SESSION = COOKIE_NAME_SESSION;

  const token = Cookies.get(NAME_SESSION);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Cliente final
export const apiClient = new ApiRequest(apiAxios);
export default apiClient;
