import { useMemo } from "react";

export function usePagination({
  data = [],
  currentPage = 1,
  rowsPerPage = 10,
}) {

  const indexOfFirst = (currentPage - 1) * rowsPerPage;
  const indexOfLast = indexOfFirst + rowsPerPage;

  const paginatedData = useMemo(() => {
    return data.slice(indexOfFirst, indexOfLast);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return {
    paginatedData,
    totalPages,
    indexOfFirst,
  };
}