
export default function usePagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6 flex-wrap">

      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="px-3 py-1 border rounded"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? "bg-gray-900 text-white"
              : "border"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() =>
          onPageChange(Math.min(currentPage + 1, totalPages))
        }
        className="px-3 py-1 border rounded"
      >
        Next
      </button>

    </div>
  );
}