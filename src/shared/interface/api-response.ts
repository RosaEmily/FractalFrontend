/**
 * Representa un historial evaluado, que puede ser una clave,
 * un objeto arbitrario o null.
 */
export type EvaluatedKey = string | Record<string, unknown> | null;

/**
 * Meta de paginación estándar.
 */
export interface PaginationMeta {
  /** Página actual */
  page: number;
  /** Cantidad de elementos por página */
  take: number;
  /** Total de registros */
  total: number;

  /** Total de páginas */
  pageCount?: number;
  /** Última página disponible */
  lastPage?: number | null;
  /** Primera página disponible */
  firstPage?: number | null;

  /** ¿Hay página anterior? */
  hasPreviousPage?: boolean;
  /** ¿Hay página siguiente? */
  hasNextPage?: boolean;

  /** Página anterior */
  previousPage?: number | null;
  /** Página siguiente */
  nextPage?: number | null;

  /** Dirección del ordenamiento (ASC, DESC) */
  order?: "ASC" | "DESC";
  /** Campo por el cual se ordena */
  sort?: string | null;

  /** Índice del primer elemento mostrado */
  from?: number;
  /** Índice del último elemento mostrado */
  to?: number;
}

/**
 * Contenedor genérico de datos paginados.
 */
export interface DataPaginationDynamo<T = unknown> {
  data: T[];
  page: number;
  limit: number;
  totalRegister: number;

  /** Total de páginas (derivable pero permitido) */
  totalPages?: number;

  /** Historial de claves evaluadas */
  evaluatedKeysHistory?: EvaluatedKey[];
}

/**
 * Estructura alternativa para datos paginados.
 */
export interface DataPaginationMeta<T = unknown> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Respuesta API estándar sin paginación.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  error: ApiError;
  data: T | null;
}

/**
 * Información para exportaciones.
 */
export interface DataExport {
  blob: Blob;
  fileName?: string;
}

export interface ApiError {
  code: number | string;
  message: string;
  details?: unknown | null;
}
