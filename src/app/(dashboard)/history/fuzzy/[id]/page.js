"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FuzzyDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/fuzzy/${params.id}`)
      .then((res) => res.json())
      .then((result) => setData(result));
  }, [params.id]);

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  const detail =
    typeof data.detail === "string"
      ? JSON.parse(data.detail)
      : data.detail;

  const { input, membership, rules, defuzzification, decision } = detail;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition w-full max-w-screen overflow-x-hidden min-h-[100dvh]">

        {/* Back Button*/}
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">Detail Fuzzy {data.id}</h1>

        {/* info pengambilan data */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow border mb-6">
            <h2 className="font-semibold mb-4 text-gray-700">
            Informasi Pengambilan Data
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p><b>ID:</b> {data.id}</p>
            <p><b>Nama:</b> {data.name}</p>
            <p><b>Lokasi:</b> {data.location}</p>
        </div>
        </div>
    </div>
  );
}

