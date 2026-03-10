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

export const buildPagination = (total: number, page: number, pageSize: number): Pagination => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};
