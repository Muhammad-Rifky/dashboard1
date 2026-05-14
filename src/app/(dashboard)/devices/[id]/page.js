"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function DeviceDetail() {
  const params = useParams();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pumpStatus, setPumpStatus] = useState("off");
  const [cooldown, setCooldown] = useState(0);
  const [duration, setDuration] = useState(600);

  // 🔥 LOCK STATE (ANTI RACE CONDITION)
  const [isSending, setIsSending] = useState(false);

  // 🔥 prevent interval duplicate
  const intervalRef = useRef(null);

  // =========================
  // FETCH DEVICE
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setDevice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    if (params?.id) fetchData();
  }, [params?.id]);

  // polling SAFE (prevent double interval)
  useEffect(() => {
    if (!params?.id) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [params?.id]);

  // =========================
  // LATEST SENSOR
  // =========================
  const latestSensor = device?.sensor?.reduce((latest, item) => {
    if (!latest) return item;

    return new Date(item.created_at) >
      new Date(latest.created_at)
      ? item
      : latest;
  }, null);

  // =========================
  // SEND COMMAND (🔥 FIXED RACE CONDITION)
  // =========================
  const sendCommand = async (command, extra = {}) => {
    if (!device?.device_id) return;
    if (isSending) return; // 🔥 BLOCK DOUBLE REQUEST

    setIsSending(true);

    try {
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
    } catch (err) {
      console.error("SEND COMMAND ERROR:", err);
    } finally {
      setIsSending(false);
    }
  };

  // =========================
  // UPDATE DEVICE
  // =========================
  const handleUpdateDevice = async () => {
    if (cooldown > 0 || isSending) return;

    await sendCommand("update");

    setCooldown(10);

    const cd = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cd);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(fetchData, 2000);
  };

  // =========================
  // REPLACE WATER
  // =========================
  const handleReplaceWater = async () => {
    if (pumpStatus !== "off" || isSending) return;

    await sendCommand("ganti_air", { duration });

    setPumpStatus("auto");

    setTimeout(() => {
      setPumpStatus("off");
    }, duration * 1000);
  };

  // =========================
  // PUMP ON
  // =========================
  const handlePumpOn = async () => {
    if (pumpStatus !== "off" || isSending) return;

    await sendCommand("pompa_on");

    setPumpStatus("manual");
  };

  // =========================
  // PUMP OFF
  // =========================
  const handlePumpOff = async () => {
    if (isSending) return;

    await sendCommand("pompa_off");

    setPumpStatus("off");
  };

  const isRunning = pumpStatus !== "off";
  const isOffline = device?.status !== "online";

  if (loading || !device) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border w-full min-h-[100dvh]">

      {/* BACK */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-900 text-white px-4 py-2 rounded"
      >
        ← Kembali
      </button>

      {/* DEVICE INFO */}
      <h1 className="text-2xl font-bold mb-6">
        Detail Perangkat
      </h1>

      <div className="mb-6">
        <p><b>ID:</b> {device.device_id}</p>
        <p><b>Nama:</b> {device.name}</p>
        <p>
          <b>Status:</b>{" "}
          <span className={device.status === "online" ? "text-green-500" : "text-red-500"}>
            {device.status}
          </span>
        </p>
      </div>

      {/* CONTROL */}
      <div className="space-y-3">

        <button
          onClick={handleUpdateDevice}
          disabled={cooldown > 0 || isOffline || isSending}
          className="w-full border p-2 rounded"
        >
          {cooldown > 0 ? `Tunggu ${cooldown}s` : "Update"}
        </button>

        <button
          onClick={handleReplaceWater}
          disabled={isRunning || isOffline || isSending}
          className="w-full border p-2 rounded"
        >
          Ganti Air
        </button>

        <button
          onClick={handlePumpOn}
          disabled={isRunning || isOffline || isSending}
          className="w-full border p-2 rounded"
        >
          Pompa ON
        </button>

        <button
          onClick={handlePumpOff}
          disabled={pumpStatus === "off" || isOffline || isSending}
          className="w-full border p-2 rounded"
        >
          Stop Pompa
        </button>

      </div>

    </div>
  );
}
