"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function DeviceDetail() {
  const params = useParams();

  const [isSending, setIsSending] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const timeoutRef = useRef(null);

  const [device, setDevice] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [pumpStatus, setPumpStatus] =
    useState("off");

  const [duration, setDuration] =
    useState(600);

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(
        `/api/devices/${params.id}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await res.json();

      setDevice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchData();
    }
  }, [params?.id]);

  // fallback polling
  useEffect(() => {
    const interval =
      setInterval(fetchData, 5000);

    return () =>
      clearInterval(interval);
  }, []);

  // =========================
  // SOCKET.IO
  // =========================
  useEffect(() => {
    const socket = io(
      "https://iot-aqua-rifky.duckdns.org",
      {
        transports: [
          "websocket",
        ],
      }
    );

    socket.on(
      "sensor_update",
      (payload) => {
        console.log(
          "SOCKET:",
          payload
        );

        if (
          payload.kode_perangkat ===
            device?.kode_perangkat &&
          isUpdating
        ) {
          clearTimeout(
            timeoutRef.current
          );

          setIsUpdating(
            false
          );

          fetchData();

          alert(
            "Data berhasil diperbarui"
          );
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [
    device?.kode_perangkat,
    isUpdating,
  ]);

  // =========================
  // LATEST SENSOR
  // =========================
  const latestSensor =
    device?.sensor?.reduce(
      (latest, item) => {
        if (!latest)
          return item;

        return new Date(
          item.created_at
        ) >
          new Date(
            latest.created_at
          )
          ? item
          : latest;
      },
      null
    );

  // =========================
  // SEND COMMAND
  // =========================
  const sendCommand =
    async (
      command,
      extra = {}
    ) => {
      if (
        !device?.kode_perangkat
      )
        return;

      if (isSending)
        return;

      setIsSending(
        true
      );

      try {
        await fetch(
          "/api/devices/update",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                kode_perangkat:
                  device.kode_perangkat,
                command,
                ...extra,
              }
            ),
          }
        );
      } catch (err) {
        console.error(
          err
        );
      } finally {
        setIsSending(
          false
        );
      }
    };

  // =========================
  // UPDATE DEVICE
  // =========================
  const handleUpdateDevice =
    async () => {
      if (
        isUpdating
      )
        return;

      await sendCommand(
        "update"
      );

      setIsUpdating(
        true
      );

      timeoutRef.current =
        setTimeout(
          () => {
            setIsUpdating(
              false
            );

            alert(
              "Gagal memperbarui data"
            );
          },
          30000
        );
    };

  // =========================
  // GANTI AIR
  // =========================
  const handleReplaceWater =
    async () => {
      if (
        pumpStatus !==
        "off"
      )
        return;

      await sendCommand(
        "ganti_air",
        {
          duration,
        }
      );

      setPumpStatus(
        "auto"
      );

      setTimeout(
        () => {
          setPumpStatus(
            "off"
          );
        },
        duration * 1000
      );
    };

  // =========================
  // POMPA ON
  // =========================
  const handlePumpOn =
    async () => {
      if (
        pumpStatus !==
        "off"
      )
        return;

      await sendCommand(
        "pompa_on"
      );

      setPumpStatus(
        "manual"
      );
    };

  // =========================
  // POMPA OFF
  // =========================
  const handlePumpOff =
    async () => {
      await sendCommand(
        "pompa_off"
      );

      setPumpStatus(
        "off"
      );
    };

  const isRunning =
    pumpStatus !==
    "off";

  const isOffline =
    device?.status !==
    "online";

  if (
    loading ||
    !device
  ) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border-l-4 border-gray-200 w-full max-w-screen overflow-x-hidden min-h-[100dvh]">

      {/* BACK */}
      <button
        onClick={() =>
          window.history.back()
        }
        className="mb-4 w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ← Kembali
      </button>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Detail
        Perangkat
      </h1>

      {/* INFO */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          Informasi
          Perangkat
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

          <p>
            <b>ID:</b>{" "}
            {
              device.kode_perangkat
            }
          </p>

          <p>
            <b>Nama:</b>{" "}
            {
              device.name
            }
          </p>

          <p>
            <b>Lokasi:</b>{" "}
            {
              device.location
            }
          </p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={
                device.status ===
                "online"
                  ? "text-green-500 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
              {
                device.status
              }
            </span>
          </p>

          <p>
            <b>Pompa:</b>{" "}
            <span>
              {pumpStatus.toUpperCase()}
            </span>
          </p>

          <p>
            <b>Last
            Seen:</b>{" "}
            {device.last_seen
              ? new Date(
                  device.last_seen
                ).toLocaleString(
                  "id-ID"
                )
              : "-"}
          </p>

        </div>
      </div>

      {/* CONTROL */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
        <h2 className="font-semibold mb-4 text-gray-700">
          Kontrol
          Device
        </h2>

        <input
          type="number"
          min="1"
          value={
            duration /
            60
          }
          disabled={
            isRunning
          }
          onChange={(
            e
          ) =>
            setDuration(
              Number(
                e.target
                  .value
              ) * 60
            )
          }
          className="border p-3 rounded w-full mb-4"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* UPDATE */}
          <button
            onClick={
              handleUpdateDevice
            }
            disabled={
              isUpdating ||
              isOffline ||
              isSending
            }
            className="w-full border border-green-500 text-green-500 py-2 rounded hover:bg-green-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </button>

          {/* GANTI AIR */}
          <button
            onClick={
              handleReplaceWater
            }
            disabled={
              isRunning ||
              isOffline ||
              isSending
            }
            className="w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Ganti
            Air
          </button>

          {/* POMPA ON */}
          <button
            onClick={
              handlePumpOn
            }
            disabled={
              isRunning ||
              isOffline ||
              isSending
            }
            className="w-full border border-purple-500 text-purple-500 py-2 rounded hover:bg-purple-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Pompa ON
          </button>

          {/* STOP */}
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
            className="w-full border border-red-500 text-red-500 py-2 rounded hover:bg-red-500 hover:text-white disabled:bg-gray-400 disabled:text-white"
          >
            Stop
            Pompa
          </button>

        </div>
      </div>

    </div>
  );
}
