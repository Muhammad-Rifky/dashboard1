"use client";

import { useState } from "react";

export default function FuzzySimulationPage() {
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(70);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fuzzy/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature,
          humidity,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        🧠 Fuzzy Simulation
      </h1>

      {/* INPUT */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label>Suhu (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>Kelembapan (%)</label>
          <input
            type="number"
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>
      </div>

      <button
        onClick={handleSimulate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Simulate"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">
            Hasil: {result.decision}
          </h2>

          <p>Nilai Defuzzifikasi: {result.result.toFixed(3)}</p>

          <h3 className="mt-4 font-semibold">Rule Aktif:</h3>
          <ul className="list-disc ml-5">
            {result.rules.map((r, i) => (
              <li key={i}>
                {r.rule} → {r.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">Membership:</h3>
          <p>
            Suhu → dingin: {result.suhu.dingin.toFixed(2)}, normal:{" "}
            {result.suhu.normal.toFixed(2)}, panas:{" "}
            {result.suhu.panas.toFixed(2)}
          </p>

          <p>
            Kelembapan → kering:{" "}
            {result.kelembapan.kering.toFixed(2)}, normal:{" "}
            {result.kelembapan.normal.toFixed(2)}, lembab:{" "}
            {result.kelembapan.lembab.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}