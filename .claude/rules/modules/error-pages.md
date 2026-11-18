---
paths:
  - "src/modules/error/**"
  - "src/shared/helpers/axios/**"
  - "src/shared/utils/session.ts"
---

# Pantallas de estado

`src/modules/error/constants/codes.ts` es la fuente de códigos y rutas. Los componentes comparten `BlueprintGrid`, `ErrorFigure` y referencia `FRA-` en errores de servidor.

`handleHttpError(status)` lleva a pantalla completa en 429, 500, 502, 503 y 504. Los 409/422 permanecen en el formulario. `ApiRequestConfig.background` omite esa navegación para flujos que gestionan el fallo localmente, como importaciones; sigue aplicándose la expiración ante 401. Un 403 no cierra la sesión. No atribuir la cobertura a una rama publicada sin comprobar el despliegue.
