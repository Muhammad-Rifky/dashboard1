export default function DefuzzificationCard({ data }) {
  const items = [
    {
      label: "Pembilang",
      formula: "Σ (z × μ(z))",
      value: data.numerator,
      decimals: 4,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-600",
    },
    {
      label: "Penyebut",
      formula: "Σ μ(z)",
      value: data.denominator,
      decimals: 4,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Score (Centroid)",
      formula: "Pembilang / Penyebut",
      value: data.score,
      decimals: 4,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      valueColor: "text-purple-700",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow p-6">
      <h2 className="text-base font-bold mb-4">Perhitungan Defuzzifikasi</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 "
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
            >
              <span className={`text-lg font-bold ${item.iconColor}`}>Σ</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.formula}</p>
              <p className={`text-2xl font-bold ${item.valueColor}`}>
                {item.value.toFixed(item.decimals)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}