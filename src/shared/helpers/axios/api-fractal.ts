// infra/api/api-client.ts
import axios from "axios";
import Cookies from "js-cookie";
import { ApiRequest } from "./base";
const { VITE_API_FRACTAL_V2, VITE_COOKIE_NAME_SESSION } = import.meta.env;

const apiAxios = axios.create({
  baseURL: `${VITE_API_FRACTAL_V2}/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Interceptor de auth (infraestructura)
apiAxios.interceptors.request.use((config) => {
  const NAME_SESSION = VITE_COOKIE_NAME_SESSION || "session_token";

  const token = Cookies.get(NAME_SESSION);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Cliente final
export const apiClient = new ApiRequest(apiAxios);
export default apiClient;
