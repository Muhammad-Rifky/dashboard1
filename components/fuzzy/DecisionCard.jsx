export default function DecisionCard({ decision }) {
  const statusColor =
    decision.status === "baik"
      ? "text-green-600"
      : decision.status === "sedang"
      ? "text-yellow-600"
      : "text-red-600";

  const iconBg =
    decision.status === "baik"
      ? "bg-green-50"
      : decision.status === "sedang"
      ? "bg-yellow-50"
      : "bg-red-50";

  return (
    <div className="bg-white border-gray-200 rounded-2xl shadow p-6">
      <h2 className="text-base font-bold mb-4">Keputusan</h2>

      <div className="flex flex-wrap items-center gap-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}
          >
            <span className={statusColor}>⚠</span>
          </div>

          <div>
            <p className={`text-xs font-semibold ${statusColor}`}>Status</p>
            <p className={`text-2xl font-bold uppercase ${statusColor}`}>
              {decision.status}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              Score Fuzzy
              <span
                className={`rounded-full border px-2 py-0.5 font-semibold ${statusColor} border-current`}
              >
                {decision.score.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-14 w-px bg-gray-200 sm:block" />

        {/* Rekomendasi */}
        <div>
          <p className="text-xs font-semibold text-gray-500">Rekomendasi</p>
          <p className={`text-2xl font-bold ${statusColor}`}>
            {decision.action}
          </p>
        </div>
      </div>
    </div>
  );
}