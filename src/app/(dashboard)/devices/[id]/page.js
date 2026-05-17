"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DeviceDetail() {
  const params = useParams();

  const [isSending, setIsSending] = useState(false);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [duration, setDuration] = useState(600);

  const pumpStatus = device?.pump_status || "off";

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

  useEffect(() => {
    if (params?.id) fetchData();
  }, [params?.id]);

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // cooldown berdasarkan DB
  useEffect(() => {
    if (!device?.last_update_request) return;

    const interval = setInterval(() => {
      const target =
        new Date(device.last_update_request).getTime() + 10000;

      const remain = Math.max(
        0,
        Math.ceil((target - Date.now()) / 1000)
      );

      setCooldown(remain);
    }, 1000);

    return () => clearInterval(interval);
  }, [device?.last_update_request]);

  const latestSensor = device?.sensor?.reduce(
    (latest, item) => {
      if (!latest) return item;

      return new Date(item.created_at) >
        new Date(latest.created_at)
        ? item
        : latest;
    },
    null
  );

  const sendCommand = async (
    command,
    extra = {}
  ) => {
    if (!device?.device_id) return;
    if (isSending) return;

    setIsSending(true);

    try {
      await fetch("/api/devices/update", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          device_id:
            device.device_id,
          command,
          ...extra,
        }),
      });

      setTimeout(fetchData, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateDevice =
    async () => {
      await sendCommand("update");
    };

  const handleReplaceWater =
    async () => {
      if (pumpStatus !== "off")
        return;

      await sendCommand(
        "ganti_air",
        {
          duration,
        }
      );
    };

  const handlePumpOn =
    async () => {
      if (pumpStatus !== "off")
        return;

      await sendCommand(
        "pompa_on"
      );
    };

  const handlePumpOff =
    async () => {
      await sendCommand(
        "pompa_off"
      );
    };

  const isRunning =
    pumpStatus !== "off";

  const isOffline =
    device?.status !==
    "online";

  if (loading || !device) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">

      <h1 className="text-2xl font-bold mb-6">
        Detail Perangkat
      </h1>

      <p>
        <b>Status:</b>{" "}
        {device.status}
      </p>

      <p>
        <b>Pompa:</b>{" "}
        {pumpStatus}
      </p>

      <p>
        <b>Last Seen:</b>{" "}
        {device.last_seen}
      </p>

      <button
        onClick={
          handleUpdateDevice
        }
        disabled={
          cooldown > 0 ||
          isOffline ||
          isSending
        }
      >
        {cooldown > 0
          ? `Tunggu ${cooldown}s`
          : "Update"}
      </button>

      <button
        onClick={
          handleReplaceWater
        }
        disabled={
          isRunning ||
          isOffline ||
          isSending
        }
      >
        Ganti Air
      </button>

      <button
        onClick={
          handlePumpOn
        }
        disabled={
          isRunning ||
          isOffline ||
          isSending
        }
      >
        Pompa ON
      </button>

      <button
        onClick={
          handlePumpOff
        }
        disabled={
          pumpStatus ===
            "off" ||
          isOffline ||
          isSending
        }
      >
        Stop Pompa
      </button>
    </div>
  );
}
