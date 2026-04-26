"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DeviceDetail() {
  const params = useParams();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pumpStatus, setPumpStatus] = useState("off"); // off | auto | manual
  const [cooldown, setCooldown] = useState(0);
  const [duration, setDuration] = useState(600); // detik

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}`);
      const data = await res.json();
      setDevice(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) fetchData();
  }, [params?.id]);

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestSensor = device?.sensor?.reduce((latest, item) => {
    if (!latest) return item;
    return new Date(item.created_at) > new Date(latest.created_at)
      ? item
      : latest;
  }, null);

  const sendCommand = async (command, extra = {}) => {
    if (!device?.device_id) return;

    await fetch("/api/devices/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id: device.device_id,
        command,
        ...extra,
      }),
    });

    console.log("🔥 COMMAND:", command, extra);
  };

  // ================= UPDATE SENSOR =================
  const handleUpdateDevice = async () => {
    await sendCommand("update");

    setCooldown(10);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(fetchData, 2000);
  };

  // ================= AUTO =================
  const handleReplaceWater = async () => {
    if (pumpStatus !== "off") return;

    await sendCommand("ganti_air", { duration });

    setPumpStatus("auto");

    setTimeout(() => {
      setPumpStatus("off");
    }, duration * 1000);
  };

  // ================= MANUAL =================
  const handlePumpOn = async () => {
    if (pumpStatus !== "off") return;

    await sendCommand("pompa_on");

    setPumpStatus("manual");
  };

  const handlePumpOff = async () => {
    await sendCommand("pompa_off");

    setPumpStatus("off");
  };

  const isRunning = pumpStatus !== "off";
  const isOffline = device?.status !== "online";

  if (loading || !device) {
    return <div className="p-6 text-gray-500">Loading device...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow border-l-4 border-gray-200 sm:p-6">

      {/* BACK */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded cursor-pointer"
      >
        ← Kembali
      </button>

      {/* DEVICE INFO */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Detail Perangkat
        </h1>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <p><b>Device ID:</b> {device?.device_id || "-"}</p>
          <p><b>Nama:</b> {device?.name || "-"}</p>
          <p><b>Lokasi:</b> {device?.location || "-"}</p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={
                device?.status === "online"
                  ? "text-green-500 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
              {device?.status || "offline"}
            </span>
          </p>

          <p>
            <b>Pompa:</b>{" "}
            <span
              className={
                pumpStatus === "auto"
                  ? "text-blue-500 font-semibold"
                  : pumpStatus === "manual"
                  ? "text-purple-500 font-semibold"
                  : "text-gray-500 font-semibold"
              }
            >
              {pumpStatus === "auto"
                ? "AUTO 💧"
                : pumpStatus === "manual"
                ? "MANUAL 💧"
                : "OFF"}
            </span>
          </p>

          <p>
            <b>Last Update:</b>{" "}
            {device?.last_seen
              ? new Date(device.last_seen).toLocaleString("id-ID")
              : "-"}
          </p>
        </div>
      </div>

      {/* SENSOR */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold mb-4">Data Sensor Terbaru</h2>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">pH</th>
              <th className="p-2 border">Suhu</th>
              <th className="p-2 border">TDS</th>
              <th className="p-2 border">Kekeruhan</th>
              <th className="p-2 border">Waktu</th>
            </tr>
          </thead>

          <tbody>
            {latestSensor ? (
              <tr className="text-center hover:bg-gray-50">
                <td className="p-2 border">{Number(latestSensor.ph).toFixed(2)}</td>
                <td className="p-2 border">{latestSensor.suhu ?? "-"}</td>
                <td className="p-2 border">{latestSensor.tds ?? "-"}</td>
                <td className="p-2 border">{latestSensor.turbidity ?? "-"}</td>
                <td className="p-2 border">
                  {new Date(latestSensor.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Tidak ada data sensor
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ACTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Kontrol Perangkat</h2>

        {/* INPUT DURASI */}
        <div className="mb-4">
          <label className="block text-sm mb-1 font-semibold">
            Durasi Ganti Air (menit)
          </label>
          <input
            type="number"
            value={duration / 60}
            onChange={(e) => setDuration(Number(e.target.value) * 60)}
            className="border p-2 rounded w-full"
            min="1"
            disabled={isRunning}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* UPDATE */}
          <button
            onClick={handleUpdateDevice}
            disabled={cooldown > 0||isOffline}
            className={`w-full px-4 py-2 rounded border ${
              cooldown > 0 || isOffline
                ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                : "bg-white text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
            }`}
          >
            {cooldown > 0? `Tunggu ${cooldown}s` : "Update"}
          </button>

          {/* AUTO */}
          <button
            onClick={handleReplaceWater}
            disabled={isRunning || isOffline}
            className={`w-full px-4 py-2 rounded border ${
              isRunning || isOffline
                ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                : "bg-white text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
            }`}
          >
            Ganti Air (Timer)
          </button>

          {/* MANUAL ON */}
          <button
            onClick={handlePumpOn}
            disabled={isRunning||isOffline}
            className={`w-full px-4 py-2 rounded border ${
              isRunning || isOffline
                ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                : "bg-white text-purple-500 border-purple-500 hover:bg-purple-500 hover:text-white"
            }`}
          >
            Pompa ON
          </button>

          {/* STOP */}
          <button
            onClick={handlePumpOff}
            disabled={pumpStatus === "off" || isOffline}
            className={`w-full px-4 py-2 rounded border ${
              pumpStatus === "off" || isOffline
                ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                : "bg-white text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            }`}
          >
            Stop Pompa
          </button>

        </div>
      </div>
    </div>
  );
}