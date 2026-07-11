"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import InputSensorCard from "../../../../../../components/fuzzy/InputSensorCard";
import MembershipCard from "../../../../../../components/fuzzy/MembershipCard";
import RulesCard from "../../../../../../components/fuzzy/RulesCard";
import InfoCard from "../../../../../../components/fuzzy/InfoCard";
import AggregationCard from "../../../../../../components/fuzzy/AggregationCard";
import DefuzzificationCard from "../../../../../../components/fuzzy/DefuzzificationCard";
import DecisionCard from "../../../../../../components/fuzzy/DecisionCard";

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

  const {
    input,
    membership,
    rules,
    defuzzification,
    decision,
    aggregation,
  } = detail;

  return (
    <div className="space-y-6">

      {/*  BACK  */}

      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
      >
        ← Kembali
      </button>

      {/*  TITLE  */}

      <div className="bg-white border border-solid border-[#e5e7eb] rounded-2xl shadow p-6 mb-6">

        <h1 className="text-3xl font-bold">
          Detail Perhitungan Fuzzy
        </h1>

        <p className="text-gray-500 mt-2">
          Riwayat proses inferensi fuzzy untuk satu data sensor.
        </p>

      </div>

      {/*  INFO  */}

      <InfoCard data={data} />
      {/*  INPUT  */}

      <InputSensorCard input={input} />

      {/*  MEMBERSHIP  */}

      <MembershipCard membership={membership} />
      {/* 1. Ubah xl:grid-cols-2 menjadi xl:grid-cols-12 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

        {/* 2. Beri xl:col-span-5 untuk Tabel Rule (mengambil ~41% ruang) */}
        <div className="xl:col-span-5">
          <RulesCard rules={rules} />
        </div>

        {/* 3. Beri xl:col-span-7 untuk Grafik (mengambil ~59% ruang - LEBIH GEDE) */}
        <div className="xl:col-span-7">
          <AggregationCard aggregation={aggregation} />
        </div>

      </div>

      {/*  DEFUZZY + DECISION  */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

      {/* Card Kiri mengambil 8 dari 12 bagian (~66.6% atau mendekati 70%) */}
        <div className="xl:col-span-8">
          <DefuzzificationCard data={defuzzification} />
        </div>

        {/* Card Kanan mengambil 4 dari 12 bagian (~33.3% atau mendekati 30%) */}
        <div className="xl:col-span-4">
          <DecisionCard decision={decision} />
        </div>

      </div>

    </div>
  );
}