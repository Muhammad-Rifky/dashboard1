"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFilter } from "../../../../hook/useFilter";
import SearchBar from "../../../../components/SearchBar";
import Pagination from "../../../../components/Pagination";
import { usePagination } from "../../../../hook/usePagination";
import Table from "../../../../components/Table";

export const dynamic = "force-dynamic";

export default function DevicesPage(){
  
  const [cooldowns, setCooldowns] = useState({});
  const [devices,setDevices] = useState([]);
  const [currentPage,setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [deviceId,setDeviceId] = useState("");
  const [name,setName] = useState("");
  const [location,setLocation] = useState("");

  const router = useRouter();

  const [selectedDetail,setSelectedDetail] = useState(null);
  const [showDetail,setShowDetail] = useState(false);

  const [user,setUser] = useState(null);
  const [users,setUsers] = useState([]);
  const [selectedUser,setSelectedUser] = useState("");

  const [selectedName,setSelectedName] = useState("");
  const [error,setError] = useState("");

  const [showConfirm,setShowConfirm] = useState(false);
  const [selectedId,setSelectedId] = useState(null);
  const [search,setSearch] = useState("");

  function loadDevices(){
    fetch("/api/devices", { cache: "no-store" }) // anti cache
    .then(res=>res.json())
    .then(res=>setDevices(res));
  }

  useEffect(()=>{
    fetch("/api/me")
    .then(res=>res.json())
    .then(data=>setUser(data));
  },[]);

  useEffect(()=>{
    if(user?.role === "admin"){
      fetch("/api/users")
        .then(res=>res.json())
        .then(data=>setUsers(data));
    }
  },[user]);

  useEffect(()=>{
    loadDevices();

    // polling tiap 5 detik
    const interval = setInterval(() => {
      loadDevices();
    }, 5000);

    return () => clearInterval(interval);
  },[]);

  // RESET PAGE kalau data berubah
  useEffect(()=>{
    setCurrentPage(1);
  },[devices]);

  async function addDevice(){

    if(!deviceId || !name || !location){
      setError("Semua field wajib diisi!");
      return;
    }

    setError("");

    const res = await fetch("/api/devices/add",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        kode_perangkat:deviceId,
        name:name,
        location:location,
        user_id:selectedUser
      })
    });

    const data = await res.json();

    if(!res.ok){
      setError(data.error || "Gagal menambahkan device");
      return;
    }

    setDeviceId("");
    setName("");
    setLocation("");
    setSelectedUser("");

    loadDevices();
  }
  const filteredDevices = useFilter({
      data: devices,
      search,
      fields: ["kode_perangkat","name","location"]
    });
    const { paginatedData, totalPages, indexOfFirst } = usePagination({
      data: filteredDevices,
      currentPage,
      rowsPerPage
    });

  const currentDevice = paginatedData;
  const headers = [
      { label: "No" },
      { label: "Kode Perangkat" },
      { label: "Nama Perangkat" },
      { label: "Lokasi" },
      { label: "Status", align: "center" },
      { label: "Last Update", align: "center" },
      { label: "Aksi", align: "center" },
    ];
  
  if(!user) return <div className="p-6">Loading...</div>;

  
  
  return(

    <div className="bg-white p-6 rounded shadow border-l-4 border-gray-200  sm:p-6">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Manajemen Perangkat
      </h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow border mb-8">

        <h2 className="font-semibold mb-4 text-gray-700">
          Tambah Device
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <input
            placeholder="Kode Perangkat"
            value={deviceId}
            onChange={e=>setDeviceId(e.target.value)}
            className="border p-3 rounded w-full"
          />

          <input
            placeholder="Name"
            value={name}
            onChange={e=>setName(e.target.value)}
            className="border p-3 rounded w-full"
          />

          <input
            placeholder="Location"
            value={location}
            onChange={e=>setLocation(e.target.value)}
            className="border p-3 rounded w-full"
          />

          {user.role === "admin" && (
            <select
              value={selectedUser}
              onChange={e=>setSelectedUser(e.target.value)}
              className="border p-3 rounded w-full"
            >
              <option value="">Pilih User</option>
              {users.map(u=>(
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          )}

        </div>
        <button
          onClick={addDevice}
          className="mt-4 w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
        >
          Tambah
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      {/* SEARCH BAR */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari device..."
      />
      {/* DESKTOP TABLE */}
      <Table headers={headers}>
        {currentDevice.map((d, i) => (
          <tr key={d.id} className="border-t hover:bg-gray-50">
            <td className="p-3">
              {indexOfFirst + i + 1}
            </td>

            <td className="p-3">
              {d.kode_perangkat}
            </td>

            <td className="p-3">
              {d.name}
            </td>

            <td className="p-3">
              {d.location}
            </td>

            <td className="p-3 text-center">
              {d.status === "online" ? (
                <span className="text-green-600 font-semibold">
                  Online
                </span>
              ) : (
                <span className="text-red-500 font-semibold">
                  Offline
                </span>
              )}
            </td>
            <td className="p-3 text-center">
              {d.last_seen
                ? new Date(d.last_seen).toLocaleString("id-ID")
                : "-"}
            </td>

            <td className="p-3">
              <div className="flex justify-center gap-2">

                <button
                  onClick={() => router.push(`/devices/${d.id}`)}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white"
                >
                  Detail
                </button>
              </div>
            </td>

          </tr>
        ))}
      </Table>
      
      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {currentDevice.map((d, i) => (
          <div
            key={d.id}
            className="bg-white border rounded-2xl shadow-sm p-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-400">
                  #{indexOfFirst + i + 1}
                </p>

                <h3 className="font-semibold text-gray-800 text-base">
                  {d.name}
                </h3>

                <p className="text-sm text-gray-500 break-all">
                  {d.kode_perangkat}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  d.status === "online"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {d.status === "online"
                  ? "Online"
                  : "Offline"}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">
                  Lokasi:
                </span>{" "}
                {d.location}
              </p>

              <p>
                <span className="font-medium">
                  Last Seen:
                </span>{" "}
                {d.last_seen
                  ? new Date(
                      d.last_seen
                    ).toLocaleString(
                      "id-ID"
                    )
                  : "-"}
              </p>
            </div>

            {/* Action */}
            <button
              onClick={() =>
                router.push(
                  `/devices/${d.id}`
                )
              }
              className="mt-4 w-full bg-white text-blue-500 py-2 cursor-pointer rounded-xl hover:bg-blue-600 transition border border-blue-500 hover:text-white"
            >
              Detail
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}