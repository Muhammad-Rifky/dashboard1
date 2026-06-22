"use client";

import { useEffect, useState } from "react";

export default function FuzzyPage() {
  const [data, setData] = useState(null);

  async function loadData() {
    const res = await fetch("/api/fuzzy/simulate");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Loading...</div>;

  if (!data.success) return <div>Tidak ada data sensor</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Fuzzy Realtime</h1>

      <div className="border p-4 rounded-xl">
        <h2 className="font-bold mb-2">Data Sensor Terakhir</h2>
        <p>pH : {data.sensor.ph}</p>
        <p>Suhu : {data.sensor.suhu}</p>
        <p>TDS : {data.sensor.tds}</p>
        <p>Turbidity : {data.sensor.turbidity}</p>
      </div>

      <div className="border p-4 rounded-xl bg-green-50">
        <h2 className="font-bold mb-2">Hasil Fuzzy</h2>
        <p>Score : {data.fuzzy.score}</p>
        <p>Status : {data.fuzzy.status}</p>
      </div>
    </div>
  );
}