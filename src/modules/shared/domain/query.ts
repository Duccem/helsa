export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
};

export type PaginatedQuery = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: Pagination;
};
