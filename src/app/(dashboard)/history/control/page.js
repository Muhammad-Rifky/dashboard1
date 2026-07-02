"use client";

import { useEffect, useState } from "react";
import { useFilter } from "../../../../../hook/useFilter";
import { usePagination } from "../../../../../hook/usePagination";
import Pagination from "../../../../../components/Pagination";
import SearchBar from "../../../../../components/SearchBar";
import { Search, PencilLine, Trash2, UserPlus, X } from "lucide-react";
import Table from "../../../../../components/Table";
export const dynamic = "force-dynamic";

export default function ActionLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    fetch("/api/action-logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error("API ERROR:", data);
          setLogs([]);
        }
      });
  }, []);

  // ======================
  // RESET PAGE SAAT SEARCH
  // ======================
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ======================
  // FILTER + PAGINATION HOOK
  // ======================
  const filteredLogs = useFilter({
    data: logs,
    search,
    fields: [
      "kode_perangkat",
      "action",
      "role",
      "status",
      "user_name",
    ],
  });

  const { paginatedData: currentLogs, totalPages } = usePagination({
    data: filteredLogs,
    currentPage,
    rowsPerPage,
      fields: [
        "kode_perangkat",
        "action",
        "role",
        "status",
        "user_name",
      ],
  });

  const headers = [
    { label: "No" },
    { label: "Kode Perangkat" },
    { label: "Aksi" },
    { label: "Oleh" },
    { label: "Role" },
    { label: "Status" },
    { label: "Waktu" },
  ];
  // Mapping action -> label Indonesia
  const actionLabels = {
    water_change: "Ganti Air",
    pump_forced_on: "Hidupkan Pompa",
    pump_forced_off: "Matikan Pompa",
    manual_water_change: "Ganti Air",

  };
  

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Riwayat Penggantian Air
      </h1>

      {/* SEARCH INPUT */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari data..."
      />

      {/* TABLE */}
      <Table headers={headers}>
        {currentLogs.map((log, index) => (
          <tr key={log.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{index + 1 + (currentPage - 1) * rowsPerPage}</td>
            <td className="p-3">{log.kode_perangkat}</td>
            <td className="p-3">{actionLabels[log.action] || log.action}</td>
            <td className="p-3">{log.user_name}</td>
            <td className="p-3">{log.role}</td>
            <td className="p-3">{log.status}</td>
            <td className="p-3">{new Date(log.created_at).toLocaleString("id-ID")}</td>
          </tr>
        ))}
      </Table>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}
