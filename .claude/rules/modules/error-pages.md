---
paths:
  - "src/modules/error/**"
---

## Pantallas de estado (400–504)

`src/modules/error/` tiene las **14** del diseño, generadas desde
`constants/codes.ts` — las rutas se derivan de ahí, así que un código nuevo solo
se agrega en un sitio. Traen `BlueprintGrid`, `ErrorFigure`, el número gigante
de fondo y el id de referencia `FRA-` en los errores de servidor.

Reemplazan al módulo `error/` heredado de Joinnus (la ilustración de
binoculares). Ya están en `dev-v2`.

`handleHttpError(status)` en `shared/utils/session.ts` lleva a la pantalla
completa **solo** en `[429, 500, 502, 503, 504]`. Un 422 o un 409 **no** sacan
al usuario de donde está: esos los muestra el formulario junto al campo que
falló.
