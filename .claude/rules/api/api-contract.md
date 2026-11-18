---
paths:
  - "src/**/repositories/**"
  - "src/**/services/**"
  - "src/**/adapters/**"
  - "src/**/dto/**"
  - "src/**/stores/**"
---

# Contrato de integración con la API

## Transporte y paginación

`api-fractal.ts` utiliza `${VITE_API_FRACTAL_V2}/v1`, `withCredentials` y `X-Fractal-Zone`. El token no se lee desde JavaScript. Ver `architecture/auth.md`.

La respuesta ordinaria es `{ success, error: { code, message, details }, data }`. Los listados paginados usan `data.items` y `data.meta`; `page` empieza en 1, `limit` vale 10 por defecto y la paginación SQL limita a 200. `paginate=false` omite la paginación: reservarlo para catálogos pequeños. El grid no envía `offset` como página.

`GET landing/offers` también devuelve `items/meta`. `OfferAdapter` transforma `items` en `offers` del modelo UI; no atribuir ese nombre al JSON del servidor. La consulta de resultados de importación sí usa `offset` como índice de fila, con páginas de 25.

## Presentación y cálculo

- `price` puede venir formateado (`"$ 199.99"`); calcular con `price_raw` o el número normalizado por el adapter. No aplicar `Number()` al texto con símbolo.
- `JSON.stringify(NaN)` produce `null`. El carrito revisa datos persistidos con `refreshStaleItems()`. El precio y cupo de compra se recalculan en servidor.
- No sustituir por un valor constante un dato que ya conoce el backend: usar `passing_score` resuelto por la API.
- Renderizar contenido editorial y datos académicos desde sus fuentes reales. Landing combina S3 y base de datos; testimonios, páginas, footer y formularios ya tienen integración.

## Mutaciones y relaciones

- Si un POST devuelve el recurso actualizado, propagarlo desde el servicio y usarlo para refrescar; no reducirlo a `boolean` y disparar un GET innecesario.
- Sí hace falta releer cuando la respuesta no es el recurso completo: cierre de acta y alta de material tienen contratos específicos.
- Mantener los `id` asignados por el servidor en evaluaciones, cursos de oferta y horarios. Reenviar `id: null` puede crear filas nuevas y romper referencias.
- `toFormData` debe representar objetos/arrays con claves anidadas que Laravel reconozca. Un array serializado como string JSON no equivale a `courses.0.course_id`.
- Actualizar archivos mediante POST con `_method: PUT` cuando el endpoint requiere multipart; PHP no procesa esos archivos en PUT directo.
- La validación de materiales del aula permite extensiones de formatos técnicos. No trasladar esa excepción a todas las subidas: imágenes y otros archivos mantienen las reglas de MIME/contenido del backend.
- Los filtros de relaciones complejas necesitan una query explícita en servidor; no inventar columnas inexistentes. Incluir relaciones en `defaultWith()` y claves necesarias en el `select` para evitar N+1 o relaciones nulas.

## Errores e importación

401 inicia la expiración de la zona; 403 no desconecta; 409/422 se resuelven en la pantalla. `background: true` mantiene los errores 429/5xx dentro del flujo de importación sin anular el manejo de 401. No reintentar automáticamente una creación ordinaria: la importación utiliza UUID, posiciones y hashes para su propia idempotencia.

Importación: crear borrador → subir lotes → iniciar → consultar/pausar/reanudar → descargar reporte. Las contraseñas temporales solo se entregan en el CSV del propietario; no forman parte del listado ni de los logs.
