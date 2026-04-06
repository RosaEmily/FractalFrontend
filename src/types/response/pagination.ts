export interface PaginationMeta {
  page: number
  take: number
  total: number
  pageCount: number
  lastPage: number
  firstPage: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  previousPage: number | null
  nextPage: number | null
  order: string
  sort: string
  from: number
  to: number
}