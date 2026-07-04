export type SortOrder = "asc" | "desc";

/** Builds a safe Prisma orderBy clause, restricting sortBy to an allow-list. */
export const parseSort = <T extends string>(
  sortBy: string | undefined,
  sortOrder: string | undefined,
  allowed: readonly T[],
  fallback: T
): Record<string, SortOrder> => {
  const field = (allowed as readonly string[]).includes(sortBy ?? "") ? (sortBy as T) : fallback;
  const order: SortOrder = sortOrder === "asc" ? "asc" : "desc";
  return { [field]: order };
};
