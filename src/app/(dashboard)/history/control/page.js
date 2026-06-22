"use client";

import { useEffect, useState } from "react";

export default function ActionLogsPage() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {

    fetch("/api/action-logs")
      .then((res) => res.json())
      .then((data) => setLogs(data));

  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Riwayat Penggantian Air
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Kode Perangkat</th>
              <th className="p-3">Aksi</th>
              <th className="p-3">Oleh</th>
              <th className="p-3">Waktu</th>
            </tr>

          </thead>

          <tbody>

            {logs.map((item, index) => (

              <tr
                key={item.id}
                className="border-b"
              >
                <td className="p-3">
                  {index + 1}
                </td>

                <td className="p-3">
                  {item.kode_perangkat}
                </td>

                <td className="p-3">
                  {item.action}
                </td>

                <td className="p-3">
                  {item.user_name ?? "-"}
                </td>

                <td className="p-3">
                  {new Date(item.created_at)
                    .toLocaleString("id-ID")}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}