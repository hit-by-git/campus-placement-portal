import { PaginationMeta } from "./ApiResponse";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePagination = ({ page, limit }: PaginationQuery) => {
  const safePage = Math.max(1, Math.trunc(page ?? 1));
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit ?? DEFAULT_LIMIT)));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
