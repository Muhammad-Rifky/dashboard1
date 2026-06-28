"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFilter } from "../../../../../hook/useFilter";
import { usePagination } from "../../../../../hook/usePagination";
import Pagination from "../../../../../components/Pagination";
import SearchBar from "../../../../../components/SearchBar";
import { Search, PencilLine, Trash2, UserPlus, X } from "lucide-react";
import PageHeader from "../../../../../components/PageHeader";
import Table from "../../../../../components/Table";
import { useRouter } from "next/navigation";
export const dynamic = "force-dynamic";

export default function FuzzyHistoryPage() {

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const router = useRouter();
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetch("/api/fuzzy")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const keyword = search?.toLowerCase() || "";
  const filteredData = useFilter({
    data,
    search: keyword,
    fields: [
      "kode_perangkat",
      "score",
      "action",
      "status",
    ],
  });

  const {
    paginatedData,
    totalPages,
    indexOfFirst,
  } = usePagination({
    data: filteredData,
    currentPage,
    rowsPerPage,
  });
  const currentData = paginatedData;

  const headers = [
    { label: "ID" },
    { label: "Kode Perangkat" },
    { label: "Score" },
    { label: "Action" },
    { label: "Status" },
    { label: "Waktu" },
    { label: "Detail" },
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow border-l-4 border-gray-200">

      <PageHeader
        title="Riwayat Fuzzy"
        description="Berisi riwayat data fuzzy yang telah diproses."
      />

      {/* SEARCH BAR */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari data..."
      />

      {/* TABLE */}
      <Table headers={headers}>
        {currentData.map((d, i) => (
          <tr key={d.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{indexOfFirst + i + 1}</td>
            <td className="p-3">{d.kode_perangkat}</td>
            <td className="p-3">{d.score}</td>
            <td className="p-3">{d.action}</td>
            <td className="p-3">{d.status}</td>
            <td className="p-3">{new Date(d.created_at).toLocaleString("id-ID")}</td>
            <td className="p-3">
            <div className="flex justify-center gap-2">

                <button
                  onClick={() => router.push(`/history/fuzzy/${d.id}`)}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white"
                >
                  Detail
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}