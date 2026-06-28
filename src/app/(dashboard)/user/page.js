"use client";

import { useEffect, useState } from "react";
import { useFilter } from "../../../../hook/useFilter";
import { usePagination } from "../../../../hook/usePagination";
import Pagination from "../../../../components/Pagination";
import Table from "../../../../components/Table";
import SearchBar from "../../../../components/SearchBar";
import PageHeader from "../../../../components/PageHeader";
import { Search, PencilLine, Trash2, UserPlus, X } from "lucide-react";
export const dynamic = "force-dynamic";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  // FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "petani" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadUsers();
  }

  // REGISTER USER
  async function handleRegister() {
    setFormError("");

    const { name, email, password, role } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Semua field harus diisi.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password minimal 6 karakter.");
      return;
    }

    setFormLoading(true);

    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "Gagal mendaftarkan user.");
        return;
      }

      setShowForm(false);
      setFormData({ name: "", email: "", password: "", role: "petani" });
      loadUsers();

    } catch (err) {
      setFormError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setFormLoading(false);
    }
  }

  // FILTER
  const keyword = search?.toLowerCase() || "";
  const filteredUser = useFilter({
    data: users || [],
    search: keyword,
    fields: ["name", "email", "role"],
  });

  // Hook pagination
  const {
    paginatedData,
    totalPages,
    indexOfFirst,
  } = usePagination({
    data: filteredUser,
    currentPage,
    rowsPerPage,
  });

  const currentUser = paginatedData;
  // header
  const headers = [
    { label: "No" },
    { label: "Nama" },
    { label: "Email" },
    { label: "Role", align: "center" },
    { label: "Status", align: "center" },
    { label: "Aksi", align: "center" },
  ];
  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow border-l-4 border-gray-200">

      {/* PAGE HEADER */}
      <PageHeader
        title="Manajemen Pengguna"
        buttonText="Tambah User"
        buttonIcon={<UserPlus size={16} />}
        onButtonClick={() => {
          setShowForm(true);
          setFormError("");
        }}
      />

      {/* SEARCH */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari data..."
      />

      {/* DESKTOP TABLE */}
      <Table headers={headers}>
        {currentUser.map((u, i) => (
          <tr key={u.id} className="border-t hover:bg-gray-50">
            <td className="p-3">{indexOfFirst + i + 1}</td>

            <td className="p-3">{u.name}</td>

            <td className="p-3">{u.email}</td>

            <td className="p-3 text-center">{u.role}</td>

            <td className="p-3 text-center">
              {u.status === "active" ? (
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

                {u.status === "pending" && (
                  <button
                    onClick={() => activateUser(u.id)}
                    className="px-3 py-1 text-green-500 rounded border border-green-500 hover:bg-green-500 hover:text-white transition text-xs"
                  >
                    Aktivasi
                  </button>
                )}

                <button
                  onClick={() => resetPassword(u.id)}
                  className="flex items-center px-3 py-1 bg-white text-blue-500 rounded border border-blue-500 hover:bg-blue-500 hover:text-white transition text-xs"
                >
                  <PencilLine size={14} className="text-blue-400" />
                  Edit
                </button>

              </div>
            </td>

          </tr>
        ))}
      </Table>
      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">
        {currentUser.map((u, i) => (
          <div key={u.id} className="border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">#{indexOfFirst + i + 1}</p>
            <p className="font-semibold">{u.name}</p>
            <p className="text-sm break-all text-gray-600">{u.email}</p>
            <p className="text-sm mt-1">Role: {u.role}</p>
            <p className="text-sm">
              Status:{" "}
              <span className={u.status === "active" ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>
                {u.status}
              </span>
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {u.status === "pending" && (
                <button
                  onClick={() => activateUser(u.id)}
                  className="flex items-center justify-center w-full bg-white text-green-500 py-2 rounded border border-green-500 cursor-pointer hover:bg-green-500 hover:text-white transition"
                >
                  Aktivasi
                </button>
              )}
              <button
                onClick={() => resetPassword(u.id)}
                className="flex items-center justify-center w-full bg-white text-blue-500 py-2 rounded border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition"
              >
                Reset Password
              </button>
              <button
                onClick={() => { setSelectedId(u.id); setSelectedName(u.name); setShowConfirm(true); }}
                className="flex items-center justify-center w-full bg-white text-red-500 py-2 rounded border border-red-500 cursor-pointer hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* modal pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
      {/* MODAL TAMBAH USER */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Tambah User Baru</h2>
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  <option value="petani">Petani</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formError && (
                <p className="text-red-500 text-sm">{formError}</p>
              )}

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleRegister}
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition text-sm disabled:bg-gray-400"
              >
                {formLoading ? "Menyimpan..." : "Daftarkan"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
