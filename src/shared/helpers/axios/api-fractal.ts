import axios from "axios";
import { ApiRequest } from "./base";

import { API_FRACTAL_V2 } from "@/shared/config/env.config";
import { ZONE_HEADER, zoneFromPath } from "@/shared/utils/session";

/**
 * Cliente HTTP de la API.
 *
 * La sesión viaja en una cookie **HttpOnly** que emite el backend al iniciar
 * sesión: el JavaScript no puede leerla ni escribirla, así que un XSS no
 * alcanza para robar el token.
 *
 * Por eso ya no hay interceptor que lea una cookie y arme el header
 * `Authorization`. Lo único necesario es `withCredentials`, que le dice al
 * navegador que incluya la cookie aunque la API viva en otro subdominio
 * (`local.fractal.com` → `localapi.fractal.com`).
 *
 * Del lado de la API esto exige `supports_credentials` en CORS y un origen
 * concreto: con credenciales, el comodín `*` queda prohibido.
 *
 * ⚠️ **Cada petición declara su zona en `X-Fractal-Zone`.** Panel y aula tienen
 * cookies de sesión distintas, pero ambas van en `path=/`, así que el navegador
 * las manda LAS DOS y el backend no puede saber cuál corresponde: tomaba
 * siempre la del panel y el aula quedaba autenticada como admin.
 *
 * No sirve deducirlo del `Origin` —las dos zonas viven en el mismo dominio— ni
 * del `Referer`, que el navegador puede recortar.
 */
const apiAxios = axios.create({
  baseURL: `${API_FRACTAL_V2}/v1`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * La zona se resuelve en cada petición, no al crear el cliente: es un único
 * cliente para toda la app y el usuario navega entre zonas sin recargar, así
 * que fijarla una vez la dejaría clavada en la del arranque.
 *
 * Sale de la URL del navegador, que es la misma señal que usa el guard del
 * router — así la pantalla y sus peticiones nunca discrepan.
 */
apiAxios.interceptors.request.use((config) => {
  config.headers.set(ZONE_HEADER, zoneFromPath(window.location.pathname));
  return config;
});

export const apiClient = new ApiRequest(apiAxios);
export default apiClient;
