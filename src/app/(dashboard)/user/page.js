"use client";

import { useEffect, useState } from "react";
import { Search, PencilLine, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function activateUser(id) {
    await fetch("/api/users/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    loadUsers();
  }

  async function resetPassword(id) {
    const ok = confirm(
      "Reset password menjadi 12345678 ?"
    );

    if (!ok) return;

    await fetch("/api/users/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    alert("Password berhasil direset");
  }

  async function handleDelete() {
    await fetch("/api/users/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedId,
      }),
    });

    setShowConfirm(false);
    loadUsers();
  }

  // FILTER
  const keyword = search?.toLowerCase() || "";

  const filteredUser = users?.filter((u) =>
    [u.name, u.email, u.role]
      .some((field) =>
        field?.toLowerCase().includes(keyword)
      )
  ) || [];

  // PAGINATION
  const indexOfLast =
    currentPage * rowsPerPage;

  const indexOfFirst =
    indexOfLast - rowsPerPage;

  const currentUser =
    filteredUser.slice(
      indexOfFirst,
      indexOfLast
    );

  const totalPages = Math.ceil(
    filteredUser.length /
      rowsPerPage
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow border-l-4 border-gray-200">

      {/* TITLE */}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        Manajemen User
      </h2>

      {/* SEARCH */}
      <div className="mb-4 w-full sm:w-96 flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 shadow-sm">
        <Search
          size={18}
          className="text-gray-500"
        />

        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={(e) => {
            setSearch(
              e.target.value
            );
            setCurrentPage(1);
          }}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-auto rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                No
              </th>
              <th className="p-3 text-left">
                Nama
              </th>
              <th className="p-3 text-left">
                Email
              </th>
              <th className="p-3 text-center">
                Role
              </th>
              <th className="p-3 text-center">
                Status
              </th>
              <th className="p-3 text-center">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {currentUser.map(
              (u, i) => (
                <tr
                  key={u.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    {indexOfFirst +
                      i +
                      1}
                  </td>

                  <td className="p-3">
                    {u.name}
                  </td>

                  <td className="p-3">
                    {u.email}
                  </td>

                  <td className="p-3 text-center">
                    {u.role}
                  </td>

                  <td className="p-3 text-center">
                    {u.status ===
                    "active" ? (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-orange-500 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2 flex-wrap">

                      {u.status ===
                        "pending" && (
                        <button
                          onClick={() =>
                            activateUser(
                              u.id
                            )
                          }
                          className="px-3 py-1 text-green-500 rounded border border-green-500 cursor-pointer hover:bg-green-500 hover:text-white transition text-xs"
                        >
                          Aktivasi
                        </button>
                      )}

                      <button 
                        onClick={() =>
                          resetPassword(
                            u.id
                          )
                        }
                        className="flex items-center px-3 py-1 bg-white text-blue-500 rounded border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition text-xs"
                      ><PencilLine 
                          size={14}
                          className="text-blue-400"
                        />
                        Reset Password
                      </button>

                      <button
                        onClick={() => {
                          setSelectedId(
                            u.id
                          );
                          setSelectedName(
                            u.name
                          );
                          setShowConfirm(
                            true
                          );
                        }}
                        className="flex items-center px-3 py-1 text-red-500 rounded border border-red-500 cursor-pointer hover:bg-red-500 hover:text-white transition text-xs"
                      >
                        <Trash2
                          size={14}
                          className="text-red-400"
                        />
                        Hapus
                      </button>

                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">
        {currentUser.map((u, i) => (
          <div
            key={u.id}
            className="border rounded-xl p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              #{indexOfFirst + i + 1}
            </p>

            <p className="font-semibold">
              {u.name}
            </p>

            <p className="text-sm break-all text-gray-600">
              {u.email}
            </p>

            <p className="text-sm mt-1">
              Role: {u.role}
            </p>

            <p className="text-sm">
              Status:{" "}
              <span
                className={
                  u.status ===
                  "active"
                    ? "text-green-600 font-semibold"
                    : "text-orange-500 font-semibold"
                }
              >
                {u.status}
              </span>
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">

              {u.status ===
                "pending" && (
                <button
                  onClick={() =>
                    activateUser(
                      u.id
                    )
                  }
                  className="flex items-center justify-center w-full bg-white text-green-500 py-2 rounded border border-green-500 cursor-pointer hover:bg-green-500 hover:text-white transition"
                >
                  Aktivasi
                </button>
              )}

              <button
                onClick={() =>
                  resetPassword(
                    u.id
                  )
                }
                className="flex items-center justify-center w-full bg-white text-blue-500 py-2 rounded border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition"
              >
                Reset Password
              </button>

              <button
                onClick={() => {
                  setSelectedId(
                    u.id
                  );
                  setSelectedName(
                    u.name
                  );
                  setShowConfirm(
                    true
                  );
                }}
                className="flex items-center justify-center w-full bg-white text-red-500 py-2 rounded border border-red-500 cursor-pointer hover:bg-red-500 hover:text-white transition"
              ><Trash2
                  size={14}
                  className="text-red-400"
                />
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() =>
            setCurrentPage(
              Math.max(
                currentPage - 1,
                1
              )
            )
          }
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {[...Array(totalPages)].map(
          (_, i) => (
            <button
              key={i}
              onClick={() =>
                setCurrentPage(
                  i + 1
                )
              }
              className={`px-3 py-1 rounded ${
                currentPage ===
                i + 1
                  ? "bg-gray-900 text-white"
                  : "border"
              }`}
            >
              {i + 1}
            </button>
          )
        )}

        <button
          onClick={() =>
            setCurrentPage(
              Math.min(
                currentPage + 1,
                totalPages
              )
            )
          }
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">
              Hapus User
            </h2>

            <p className="mb-5">
              Yakin hapus{" "}
              <b>
                {selectedName}
              </b>
              ?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() =>
                  setShowConfirm(
                    false
                  )
                }
                className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
