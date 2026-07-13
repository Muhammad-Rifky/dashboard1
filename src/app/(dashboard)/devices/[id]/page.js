"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import SensorGauge  from "../../../../..//components/SensorGauge";

export default function DeviceDetail() {
  const params = useParams();

  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [device, setDevice] = useState(null);
  const [pumpStatus, setPumpStatus] = useState("off");
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("");
  const latestAction = device?.latestAction; //ambil dari
  const [cooldown, setCooldown] = useState(0);
  const socketRef = useRef(null);
  const cooldownRef = useRef(null);
  const [durationUnit, setDurationUnit] = useState("minute"); // State untuk unit durasi

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("FETCH DEVICE:", data.pump_status);

      setDevice(data);
      setPumpStatus(data.pump_status);

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

    const socket = io("https://iot-aqua-rifky.duckdns.org", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("sensor_update", (newData) => {

      if (newData.kode_perangkat !== device?.kode_perangkat) return;

      fetchData();

      if (isUpdating) {

        toast.success("Data terbaru berhasil diterima.", {
          id: "update-device",
        });

        setIsUpdating(false);

        setCooldown(10);

        if (cooldownRef.current)
          clearInterval(cooldownRef.current);

        cooldownRef.current = setInterval(() => {

          setCooldown((prev) => {

            if (prev <= 1) {

              clearInterval(cooldownRef.current);

              return 0;

            }

            return prev - 1;

          });

        }, 1000);

      }

    });

    socket.on("sensor_error",(data)=>{

        if(data.kode_perangkat !== device?.kode_perangkat) return;

        toast.error(data.message);

    });

    return () => {

      socket.disconnect();

      if(cooldownRef.current)
        clearInterval(cooldownRef.current);

    };

  }, [device?.kode_perangkat, isUpdating]);

  const latestSensor = device?.sensor?.reduce((latest, item) => {
    if (!latest) return item;

    return new Date(item.created_at) >
      new Date(latest.created_at)
      ? item
      : latest;
  }, null);


  const sendCommand = async (command, extra = {}) => {
  if (!device?.kode_perangkat) return;

  const res = await fetch("/api/devices/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kode_perangkat: device.kode_perangkat,
      command,
      ...extra,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal mengirim perintah.");
  }

  return data;
};

  const handleUpdateDevice = async () => {
    try {

      setIsUpdating(true);

      toast.loading(
        "Meminta perangkat memperbarui data...",
        {
          id:"update-device"
        }
      );

      await sendCommand("update");

    }

    catch(err){

      console.error(err);

      toast.error(
        err.message,
        {
          id:"update-device"
        }
      );

      setIsUpdating(false);

    }

  };
  const handleConfirmWaterChange = async () => {
    try {
      setIsSending(true);

      const res = await fetch("/api/devices/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fuzzy_result_id: latestAction?.id, // 🔥 INI YANG KURANG
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal");

      toast.success("Air berhasil dikonfirmasi");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };
  
// Fungsi jembatan utama ke API Kontrol Perangkat
const sendControlCommand = async (command, extra = {}) => {
  if (!device?.kode_perangkat) return;

  const res = await fetch("/api/devices/control", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kode_perangkat: device.kode_perangkat,
      command,
      ...extra,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal mengeksekusi perintah pompa.");
  return data;
};

// TOMBOL 1: Ganti Air (Pakai Durasi)
const handleReplaceWater = async () => {
  if (pumpStatus !== "off") return;
  if (!duration || Number(duration) <= 0) {
    toast.error("Masukkan durasi penggantian air terlebih dahulu!", {
      duration: 4000, // Tampil selama 4 detik
      position: "top-center", // Posisi toast di tengah atas
    });
    return; // Hentikan eksekusi fungsi agar tidak menembak API
  }

  try {
    // duration_seconds dikonversi ke DETIK (karena input awal Anda adalah menit)
    let durationSeconds = Number(duration);

    if (durationUnit === "minute") {
      durationSeconds *= 60;
    } else {
      durationSeconds *= 3600;
    }
    await sendControlCommand("ganti_air", { duration: durationSeconds });
    setPumpStatus("durasi");

    // Timer pemutus otomatis
    setTimeout(async () => {
      try {
        await sendControlCommand("pompa_off");
        setPumpStatus("off");
      } catch (err) {
        console.error("Gagal mematikan pompa otomatis:", err.message);
      }
    }, durationSeconds * 1000); // Detik dikali 1000 milidetik

  } catch (error) {
    alert(error.message);
  }
};

// TOMBOL 2: Pompa ON (Manual Tanpa Durasi)
const handlePumpOn = async () => {
  try {
    await sendControlCommand("pompa_on");
    setPumpStatus("manual");
  } catch (error) {
    alert(error.message);
  }
};

// TOMBOL 3: Pompa OFF (Paksaan Matikan)
const handlePumpOff = async () => {
  try {
    await sendControlCommand("pompa_off");
    setPumpStatus("off");
  } catch (error) {
    alert(error.message);
  }
};

  const isRunning = pumpStatus !== "off";
  const isOffline = device?.status !== "online";

  if (loading || !device) {
    return <div className="p-6">Loading...</div>;
  }
  // fungsi mengatur warna gauge berdasarkan nilai sensor
  const getPhColor = (ph) => {
  if (ph >= 6.5 && ph <= 8.5) return "#22c55e"; // Aman (Hijau)
  if ((ph >= 5.5 && ph < 6.5) || (ph > 8.5 && ph <= 9.5)) return "#eab308"; // Sedang (Kuning)
  return "#ef4444"; // Bahaya (Merah)
};

const getTempColor = (temp) => {
  if (temp >= 25 && temp <= 32) return "#22c55e"; // Aman (Hijau)
  if ((temp >= 20 && temp < 25) || (temp > 32 && temp <= 38)) return "#eab308"; // Sedang (Kuning)
  return "#ef4444"; // Bahaya (Merah)
};

const getTdsColor = (tds) => {
  if (tds <= 500) return "#22c55e"; // Aman (Hijau)
  if (tds > 500 && tds <= 1000) return "#eab308"; // Sedang (Kuning)
  return "#ef4444"; // Bahaya (Merah)
};

const getNTUColor = (ntu) => {
  if (ntu <= 1000) return "#22c55e"; // Aman (Hijau - Jernih)
  if (ntu > 1000 && ntu <= 3000) return "#eab308"; // Sedang (Kuning - Keruh Ringan)
  return "#ef4444"; // Bahaya (Merah - Sangat Keruh)
};

  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition w-full max-w-screen overflow-x-hidden min-h-[100dvh]">

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
          <p><b>ID:</b> {device.kode_perangkat}</p>
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
            <b>Last Seen:</b> {device.last_seen || "-"}
          </p>
        </div>
      </div>

      {/* SENSOR DESKTOP */}
      <div className="hidden md:block bg-white p-6 rounded-xl shadow border mb-6">
        <div className="bg-white p-6 rounded-xl shadow border mb-6">
          <h2 className="font-semibold mb-4 text-gray-700">
            Data Sensor Terbaru
            {isUpdating && (
              <span className="ml-2 text-xs text-green-500 font-normal animate-pulse">
                Menunggu data baru...
              </span>
            )}
          </h2>
            <p>
            <b>Waktu Pengukuran:</b>{" "}
            {new Date(
              latestSensor.created_at
            ).toLocaleString("id-ID")}
          </p>
        </div>
      {latestSensor ? (
      <>
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 min-w-[1000px]">

            {/* pH */}
            <div
              className={`
                flex-1
                rounded-2xl
                p-3
                border
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
              `}
            >
              <SensorGauge
                label="pH"
                value={Number(latestSensor.ph).toFixed(2)}
                max={14}
                color={getPhColor(Number(latestSensor.ph))}
              />
              <p className="text-sm text-gray-600 text-center">
                {latestSensor.ph >= 6.5 && latestSensor.ph <= 8.5
                  ? "Aman"
                  : latestSensor.ph >= 5.5 && latestSensor.ph < 6.5
                  ? "Sedang"
                  : "Bahaya"}
              </p>

              <div className="text-center -mt-2">
                <p className="font-bold text-xl">
                  {Number(latestSensor.ph).toFixed(2)}
                </p>

                <p className="text-sm text-gray-600">
                  pH
                </p>
              </div>
            </div>
  

            {/* Suhu */}
            <div
              className={`
                flex-1
                rounded-2xl
                p-3
                border
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                
              `}
            >
              <SensorGauge
                label="Suhu"
                value={latestSensor.suhu}
                max={50}
                unit="°C"
                color={getTempColor(Number(latestSensor.suhu))}
              />
              <p className="text-sm text-gray-600 text-center">
                {latestSensor.suhu >= 25 && latestSensor.suhu <= 32
                  ? "Aman"
                  : latestSensor.suhu >= 20 && latestSensor.suhu < 25
                  ? "Sedang"
                  : "Bahaya"}
              </p>

              <div className="text-center -mt-2">
                <p className="font-bold text-xl">
                  {Number(latestSensor.suhu).toFixed(1)}°C
                </p>

                <p className="text-sm text-gray-600">
                  Suhu
                </p>
              </div>
            </div>

            {/* TDS */}
            <div className={`
                flex-1
                rounded-2xl
                p-3
                border
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
              `}
            >
              <SensorGauge
                label="TDS"
                value={latestSensor.tds}
                max={1000}
                unit=" ppm"
                color={getTdsColor(Number(latestSensor.tds))}
              />
              <p className="text-sm text-gray-600 text-center">
                {latestSensor.tds <= 500
                  ? "Aman"
                  : latestSensor.tds <= 1000
                  ? "Sedang"
                  : "Bahaya"}
              </p>

              <div className="text-center -mt-2">
                <p className="font-bold text-xl">
                  {latestSensor.tds}
                </p>

                <p className="text-sm text-gray-600">
                  ppm
                </p>
              </div>
            </div>

            {/* Turbidity */}
            <div className={`
                flex-1
                rounded-2xl
                p-3
                border
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
              `}
            >
              <SensorGauge
                
                label="Turbidity"
                value={latestSensor.NTU ?? 0}
                max={3000}
                color={getNTUColor(
                  latestSensor.NTU
                )}
              />
              <p className="text-sm text-gray-600 text-center">
                {latestSensor.NTU <= 1000
                  ? "Jernih"
                  : latestSensor.NTU <= 3000
                  ? "Keruh Ringan"
                  : "Sangat Keruh"}
              </p>

              <div className="text-center -mt-2">
                <p className="font-bold text-xl capitalize">
                  {latestSensor.NTU}
                </p>

                <p className="text-sm text-gray-600">
                  NTU
                </p>
              </div>
            </div>

          </div>
        </div>
      </>
    ) : (
      <div className="text-center text-gray-500">
        Tidak ada data
      </div>
    )}
    </div>
      {/*action card approved*/}
      <div className="bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          Tindakan yang Diperlukan
        </h2>

        {latestAction?.status === "pending" && latestAction?.action === "Ganti Air" ? (
          <div className="border border-red-300 bg-red-50 rounded-lg p-4">
            <p className="font-semibold text-red-600">
              ⚠️ Kualitas air buruk
            </p>

            <p className="text-sm mt-2 text-gray-700">
              Sistem mendeteksi kualitas air buruk.
              Segera lakukan penggantian air kolam.
            </p>
            <button
              onClick={handleConfirmWaterChange}
              disabled={isSending}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSending ? "Mengirim..." : "✓ Air Sudah Diganti"}
            </button>
            </div>
        ) : (
          <div className="text-gray-500">
            Tidak ada action yang harus dilakukan.
          </div>
        )}
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
            <p><b>NTU:</b> {latestSensor.NTU}</p>
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

        <div className="flex gap-2 mb-4">

          <input
            type="number"
            min="1"
            value={duration}
            disabled={isRunning}
            onChange={(e) => setDuration(e.target.value)}
            className="border p-3 rounded flex-1"
            placeholder="Durasi"
          />

          <select
            value={durationUnit}
            disabled={isRunning}
            onChange={(e) => setDurationUnit(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="minute">Menit</option>
            <option value="hour">Jam</option>
          </select>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <button
            onClick={handleUpdateDevice}
            disabled={isUpdating || cooldown > 0 || isOffline || isSending}
            className="w-full border border-green-500 text-green-500 py-2 rounded hover:bg-green-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Memperbarui...
                  </span>
              ) : cooldown > 0 ? (
                  `Update (${cooldown})`
              ) : (
                  "Update"
              )}
          </button>

          <button
            onClick={handleReplaceWater}
            disabled={isRunning || isOffline || isSending}
            className="w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Hidupkan Pompa (durasi)
          </button>

          <button
            onClick={handlePumpOn}
            disabled={isRunning || isOffline || isSending}
            className="w-full border border-purple-500 text-purple-500 py-2 rounded hover:bg-purple-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Hidupkan Pompa
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
