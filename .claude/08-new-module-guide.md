# Guía para agregar un nuevo módulo CRUD

Sigue este orden exacto para crear un nuevo módulo en el panel admin.

## Ejemplo: módulo `categories` bajo `catalog`

### 1. Crear la carpeta base

```
src/modules/admin/modules/catalog/modules/categories/
├── dto/
├── models/
├── adapters/
├── repositories/
├── services/
├── pages/
└── router/
```

### 2. Definir el DTO

```ts
// dto/category.dto.ts
export interface CategoryDTO {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryBodyDTO {
  name: string;
  description: string;
}
```

### 3. Definir el Model y RepositoryTypes

```ts
// models/category.model.ts
import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { CategoryDTO, CategoryBodyDTO } from "../dto/category.dto";

export interface Category {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryRepositoryTypes {
  base: RepositoryBase<Category, CategoryDTO>;
  create: { body: CategoryBodyDTO };
  update: { body: CategoryBodyDTO };
}
```

### 4. Crear el Adapter

```ts
// adapters/category.adapter.ts
import type { Category } from "../models/category.model";
import type { CategoryDTO } from "../dto/category.dto";

export const CategoryAdapter = {
  one: (dto: CategoryDTO): Category => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    created_at: new Date(dto.created_at),
    updated_at: new Date(dto.updated_at),
  }),
  many: (dtos: CategoryDTO[]): Category[] => dtos.map(CategoryAdapter.one),
};
```

### 5. Crear el Repository

```ts
// repositories/category.repository.ts
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CategoryRepositoryTypes } from "../models/category.model";
import { CategoryAdapter } from "../adapters/category.adapter";

class CategoryRepository extends BaseRepository<CategoryRepositoryTypes> {
  constructor() {
    super("catalog/categories", CategoryAdapter);
    //          ↑ ruta del endpoint en la API
  }
}

export default new CategoryRepository();
```

### 6. Crear el Service

```ts
// services/category.service.ts
import { BaseService } from "@/modules/admin/services/base.service";
import categoryRepository from "../repositories/category.repository";
import type { CategoryRepositoryTypes } from "../models/category.model";
import type { CategoryRepository } from "../repositories/category.repository";

class CategoryService extends BaseService<typeof categoryRepository, CategoryRepositoryTypes> {
  constructor() {
    super(categoryRepository);
  }
}

export default new CategoryService();
```

### 7. Crear páginas

**list.vue:**
```vue
<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import categoryService from "../services/category.service";
import type { Category } from "../models/category.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Category>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  },
  {
    field: "description",
    header: "Descripción",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params) => categoryService.list(params),
      status: (ids, state) => categoryService.status(ids, state ?? 1),
      delete: (ids) => categoryService.delete(ids),
    }"
    title="Lista de Categorías"
    module="catalog/categories"
  />
</template>
```

**create.vue:**
```vue
<script setup lang="ts">
import { z } from "zod";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import categoryService from "../services/category.service";

const initialValues = { name: null, description: null };

const formSchema = z.object({
  name: withRefinements(
    z.string({ message: "El nombre es obligatorio" })
      .min(4).max(200)
      .regex(/^[A-Z](?:[A-Z_]*[A-Z])?$/, { message: "Solo mayúsculas y guion bajo" }),
  ),
  description: withRefinements(
    z.string({ message: "La descripción es obligatoria" }).min(6).max(200),
    lettersSpaces,
  ),
});
</script>
<template>
  <CrudForm
    title="Crear Categoría"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="categories.list"
    :service="(body) => categoryService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
        v-keyfilter="/^[A-Za-z_]+$/"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :invalid="!!errors.description"
        :message-error="errors.description"
        v-keyfilter.lettersSpaces
      />
    </template>
  </CrudForm>
</template>
```

**update.vue** (mismo que create pero cargando datos existentes con `categoryService.edit(id)`).

### 8. Crear el router

```ts
// router/index.ts
import type { RouteRecordRaw } from "vue-router";
import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

const TitleBase = "Catálogo | Categorías |";

export const routesCategories: RouteRecordRaw[] = [
  {
    path: "categories",
    name: "categories",
    children: [
      {
        path: "",
        name: "categories.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "categories.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "categories.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
```

### 9. Registrar el router en el módulo padre

```ts
// modules/admin/modules/catalog/router/index.ts
import { routesCategories } from "../modules/categories/router";
export const routesCatalog: RouteRecordRaw[] = [
  { path: "catalog", name: "catalog", children: [...routesCategories] },
];
```

Y agregar `...routesCatalog` en `src/modules/admin/router/index.ts`.

### 10. Agregar ítem al menú

```ts
// constants/menu/catalog.ts
import { mdiTag } from "@mdi/js";
export const MENU_CATALOG: MenuItem[] = [
  {
    id: "catalog",
    label: "Catálogo",
    icon: mdiTag,
    roles: ["ADMIN"],
    children: [
      {
        id: "catalog.categories",
        label: "Categorías",
        icon: mdiTag,
        roles: ["ADMIN"],
        route: { name: "categories.list" },
        module: "categories",
      },
    ],
  },
];
```

Agregar `...MENU_CATALOG` en `src/modules/admin/constants/menu/index.ts`.

## Checklist final

- [ ] `dto/entity.dto.ts` — DTO de API + BodyDTO
- [ ] `models/entity.model.ts` — Model + RepositoryTypes
- [ ] `adapters/entity.adapter.ts` — `one()` + `many()`
- [ ] `repositories/entity.repository.ts` — extiende BaseRepository
- [ ] `services/entity.service.ts` — extiende BaseService
- [ ] `pages/list.vue` — usa SectionList
- [ ] `pages/create.vue` — usa CrudForm
- [ ] `pages/update.vue` — usa CrudForm con carga de datos
- [ ] `router/index.ts` — rutas con meta.page.base.title
- [ ] Registrar router en módulo padre
- [ ] Agregar ítem en constants/menu/
