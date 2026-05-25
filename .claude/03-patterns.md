# Patrones — Repository, Adapter, Service

## Flujo de datos

```
API JSON (DTO)
    ↓ Adapter.one() / Adapter.many()
Model (interno UI)
    ↓ Repository (BaseRepository)
    ↓ Service (BaseService)
Page / Component
```

## RepositoryTypes — Tipado genérico

`src/modules/admin/interface/base-repository.ts` define el contrato que cada entidad debe declarar:

```ts
interface RepositoryTypes {
  base: RepositoryBase;        // DTO y Model por defecto
  list?: Partial<RepositoryBase>;   // Overrides para list
  edit?: Partial<RepositoryBase>;   // Overrides para edit
  create?: Partial<RepositoryBase> & { body: unknown };
  update?: Partial<RepositoryBase> & { body: unknown };
}
```

Si `list.dto` no se declara, usa `base.dto`. Esto permite DTOs distintos por operación.

**Ejemplo:**
```ts
// models/role.model.ts
export interface RoleRepositoryTypes {
  base: RepositoryBase<Role, RoleDTO>;  // Role = model, RoleDTO = DTO API
  create: { body: RoleBodyDTO };        // Body diferente para POST
  update: { body: RoleBodyDTO };
}
```

## BaseRepository

`src/modules/admin/repositories/base.repository.ts`

```ts
class RoleRepository extends BaseRepository<RoleRepositoryTypes> {
  constructor() {
    super("security/roles", RoleAdapter);
    //          ↑ ruta API         ↑ adapter base (fallback)
  }
}
export default new RoleRepository();
```

**Métodos disponibles:**

| Método | HTTP | Endpoint |
|---|---|---|
| `list(params)` | GET | `/route?limit=&offset=&filters=&order=` |
| `all(params)` | GET | `/route?paginate=false` |
| `edit(id)` | GET | `/route/:id` |
| `create(body)` | POST | `/route` |
| `update(id, body)` | PUT | `/route/:id` |
| `delete(ids[])` | POST | `/route/bulk-delete` |
| `status(ids[], 0\|1)` | PATCH | `/route/actions/update-status` |

## Adapter

```ts
// adapters/entity.adapter.ts
export const RoleAdapter = {
  one: (dto: RoleDTO): Role => ({
    id: dto.id,
    name: dto.name,
    // mapping...
  }),
  many: (dtos: RoleDTO[]): Role[] => dtos.map((d) => RoleAdapter.one(d)),
};
```

El adapter se puede separar por operación si el DTO de list es distinto al de edit:
```ts
super("security/roles", RoleAdapter, {
  edit: RoleEditAdapter,  // adapter específico para GET /:id
});
```

## BaseService

`src/modules/admin/services/base.service.ts`

```ts
class RoleService extends BaseService<RoleRepository, RoleRepositoryTypes> {
  constructor() {
    super(roleRepository);
  }
  // Puede sobrescribir o agregar métodos específicos
}
export default new RoleService();
```

Métodos heredados: `list()`, `all()`, `edit()`, `create()`, `update()`, `delete()`, `status()`.

## ApiRequest — Cliente HTTP

`src/shared/helpers/axios/base.ts`

- Auto-cancela requests del mismo `method:url` con `AbortController`
- Errores Axios → `RequestError` → `BusinessError` (en `handleRequest`)
- Métodos: `get`, `post`, `put`, `patch`, `delete`, `uploadFile`, `getFileBlob`

`src/shared/helpers/axios/api-fractal.ts` instancia `ApiRequest` con:
- `baseURL`: `${VITE_API_FRACTAL_V2}/v1`
- Interceptor que inyecta `Authorization: Bearer <token_cookie>`

## safeRequest

`src/shared/utils/request.ts`

```ts
const { status, data, error } = await safeRequest(
  () => roleService.list(params),
  { showAlert: false }  // opcional: no mostrar modal de error automático
);

if (!status) {
  // error.message, error.code, error.details disponibles
}
```

- Nunca lanza — siempre devuelve `{ status, data, error }`
- Por defecto muestra modal de alerta global en caso de error
- Usar en páginas/componentes; los services propagan errores normalmente

## useFormFields

`src/shared/composables/useFormFields.ts`

```ts
const { fields, errors, handleSubmit, setValues, setFieldError } =
  useFormFields<FormType>({
    initialValues: { name: null, description: null },
    schema: z.object({ ... }),
  });

// En template:
// v-model="fields.name.value"
// :invalid="!!errors.name"
// :message-error="errors.name"
```

Integra `vee-validate` + `@vee-validate/zod`. Cada campo en `fields` es un `Ref<T>`.
