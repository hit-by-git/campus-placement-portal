export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse<T> {
  public readonly success = true;

  constructor(
    public readonly data: T,
    public readonly message = "Success",
    public readonly meta?: PaginationMeta
  ) {}
}
