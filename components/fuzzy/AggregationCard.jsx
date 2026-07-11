"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AggregationCard({ aggregation }) {

  const chartData = aggregation.map((item) => ({
    z: item.z,
    value: Number(item.value),
  }));

  return (
    <div className="bg-white border-gray-200 rounded-2xl shadow p-6">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-bold">
          Grafik Agregasi
        </h2>

        <span className="text-xs text-gray-500">
          μ(z)
        </span>

      </div>

      <ResponsiveContainer width="100%" height={340}>

        <LineChart data={chartData}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="z"
            tick={{ fontSize: 12 }}
            label={{
              value: "Nilai z",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 12 }}
            label={{
              value: "μ(z)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            formatter={(value) => Number(value).toFixed(4)}
            labelFormatter={(label) => `z = ${label}`}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-500">

        Grafik menunjukkan hasil agregasi seluruh rule fuzzy sebelum proses
        defuzzifikasi menggunakan metode centroid.

      </div>

    </div>
  );
}