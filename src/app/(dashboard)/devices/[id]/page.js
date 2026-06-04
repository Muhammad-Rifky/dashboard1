"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function DeviceDetail() {
  const params = useParams();

  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pumpStatus, setPumpStatus] = useState("off");
  const [duration, setDuration] = useState(600);

  const timeoutRef = useRef(null);

  // FIX: ref untuk track isUpdating agar selalu up-to-date di dalam socket closure
  const isUpdatingRef = useRef(false);
  const deviceIdRef = useRef(null);

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setDevice(data);
      deviceIdRef.current = data?.device_id;

      // sync pump status dari DB
      setPumpStatus(data?.pump_status ?? "off");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) fetchData();
  }, [params?.id]);

  // fallback polling
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // SOCKET.IO
  // FIX: pakai ref, jangan taruh device/isUpdating di dependency array
  // =========================
  useEffect(() => {
    const socket = io("http://76.13.192.195:3001", {
      transports: ["websocket"],
    });

    socket.on("sensor_update", (payload) => {
      console.log("SOCKET:", payload);

      // FIX: baca dari ref, bukan dari closure state
      if (
        payload.device_id === deviceIdRef.current &&
        isUpdatingRef.current
      ) {
        clearTimeout(timeoutRef.current);

        // FIX: update ref dan state bersamaan
        isUpdatingRef.current = false;
        setIsUpdating(false);

        fetchData();
        alert("Data berhasil diperbarui");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // intentionally kosong — socket hanya dibuat sekali

  // =========================
  // LATEST SENSOR
  // =========================
  const latestSensor = device?.sensor?.reduce(
    (latest, item) => {
      if (!latest) return item;
      return new Date(item.created_at) > new Date(latest.created_at)
        ? item
        : latest;
    },
    null
  );

  // =========================
  // SEND COMMAND
  // =========================
  const sendCommand = async (command, extra = {}) => {
    if (!device?.device_id) return;
    if (isSending) return;

    setIsSending(true);

    try {
      await fetch("/api/devices/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: device.device_id,
          command,
          ...extra,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // =========================
  // UPDATE DEVICE
  // =========================
  const handleUpdateDevice = async () => {
    if (isUpdating) return;

    await sendCommand("update");

    // FIX: update ref dan state bersamaan
    isUpdatingRef.current = true;
    setIsUpdating(true);

    timeoutRef.current = setTimeout(() => {
      isUpdatingRef.current = false;
      setIsUpdating(false);
      alert("Gagal memperbarui data");
    }, 30000);
  };

  // =========================
  // GANTI AIR
  // =========================
  const handleReplaceWater = async () => {
    if (pumpStatus !== "off") return;

    await sendCommand("ganti_air", { duration });
    setPumpStatus("auto");

    setTimeout(() => {
      setPumpStatus("off");
    }, duration * 1000);
  };

  // =========================
  // POMPA ON
  // =========================
  const handlePumpOn = async () => {
    if (pumpStatus !== "off") return;

    await sendCommand("pompa_on");
    setPumpStatus("manual");
  };

  // =========================
  // POMPA OFF
  // =========================
  const handlePumpOff = async () => {
    await sendCommand("pompa_off");
    setPumpStatus("off");
  };

  const isRunning = pumpStatus !== "off";
  const isOffline = device?.status !== "online";

  if (loading || !device) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border-l-4 border-gray-200 w-full max-w-screen overflow-x-hidden min-h-[100dvh]">

      {/* BACK */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ← Kembali
      </button>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Detail Perangkat
      </h1>

      {/* INFO */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          Informasi Perangkat
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p><b>ID:</b> {device.device_id}</p>
          <p><b>Nama:</b> {device.name}</p>
          <p><b>Lokasi:</b> {device.location}</p>
          <p>
            <b>Status:</b>{" "}
            <span className={device.status === "online" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
              {device.status}
            </span>
          </p>
          <p>
            <b>Pompa:</b>{" "}
            <span className={
              pumpStatus === "auto"
                ? "text-blue-500 font-semibold"
                : pumpStatus === "manual"
                ? "text-purple-500 font-semibold"
                : "text-gray-500 font-semibold"
            }>
              {pumpStatus.toUpperCase()}
            </span>
          </p>
          <p>
            <b>Last Seen:</b>{" "}
            {device.last_seen
              ? new Date(device.last_seen).toLocaleString("id-ID")
              : "-"}
          </p>
        </div>
      </div>

      {/* SENSOR DESKTOP */}
      <div className="hidden md:block bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          Data Sensor Terbaru
          {isUpdating && (
            <span className="ml-2 text-xs text-green-500 font-normal animate-pulse">
              Menunggu data baru...
            </span>
          )}
        </h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">pH</th>
              <th className="p-3 text-left">Suhu</th>
              <th className="p-3 text-left">TDS</th>
              <th className="p-3 text-left">Kekeruhan</th>
              <th className="p-3 text-left">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {latestSensor ? (
              <tr className="border-b">
                <td className="p-3">{Number(latestSensor.ph).toFixed(2)}</td>
                <td className="p-3">{latestSensor.suhu}</td>
                <td className="p-3">{latestSensor.tds}</td>
                <td className="p-3">{latestSensor.turbidity_status}</td>
                <td className="p-3">
                  {new Date(latestSensor.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SENSOR MOBILE */}
      <div className="md:hidden mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          Sensor Terbaru
          {isUpdating && (
            <span className="ml-2 text-xs text-green-500 font-normal animate-pulse">
              Menunggu data baru...
            </span>
          )}
        </h2>

        {latestSensor ? (
          <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-2 text-sm">
            <p><b>pH:</b> {Number(latestSensor.ph).toFixed(2)}</p>
            <p><b>Suhu:</b> {latestSensor.suhu}</p>
            <p><b>TDS:</b> {latestSensor.tds}</p>
            <p><b>Kekeruhan:</b> {latestSensor.turbidity_status}</p>
            <p>
              <b>Waktu:</b>{" "}
              {new Date(latestSensor.created_at).toLocaleString("id-ID")}
            </p>
          </div>
        ) : (
          <div className="text-gray-500">Tidak ada data</div>
        )}
      </div>

      {/* CONTROL */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
        <h2 className="font-semibold mb-4 text-gray-700">Kontrol Device</h2>

        <input
          type="number"
          min="1"
          value={duration / 60}
          disabled={isRunning}
          onChange={(e) => setDuration(Number(e.target.value) * 60)}
          className="border p-3 rounded w-full mb-4"
          placeholder="Durasi menit"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <button
            onClick={handleUpdateDevice}
            disabled={isUpdating || isOffline || isSending}
            className="w-full border border-green-500 text-green-500 py-2 rounded hover:bg-green-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </button>

          <button
            onClick={handleReplaceWater}
            disabled={isRunning || isOffline || isSending}
            className="w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Ganti Air
          </button>

          <button
            onClick={handlePumpOn}
            disabled={isRunning || isOffline || isSending}
            className="w-full border border-purple-500 text-purple-500 py-2 rounded hover:bg-purple-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Pompa ON
          </button>

          <button
            onClick={handlePumpOff}
            disabled={pumpStatus === "off" || isOffline || isSending}
            className="w-full border border-red-500 text-red-500 py-2 rounded hover:bg-red-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Stop Pompa
          </button>

        </div>
      </div>

    </div>
  );
}
