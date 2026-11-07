export type Page<T> = { items: T[]; totalItems: number; page: number; limit: number; totalPages: number };

export const paginate = <T>(items: T[], page: number, limit: number): Page<T> => {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(100, Math.max(Math.floor(limit), 1)) : 20;
  const realPage = Number.isFinite(page) ? Math.floor(Math.max(page, 1)) : 1;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / safeLimit);
  const startIndex = (realPage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalItems,
    page: realPage,
    limit: safeLimit,
    totalPages
  };
};
