"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { io } from "socket.io-client";

export const dynamic = "force-dynamic";

export default function DashboardPage() {

  const [data,setData] = useState(null);
  const [period,setPeriod] = useState("1d");
  const [devices,setDevices] = useState([]);
  const [selectedDevice,setSelectedDevice] = useState("");

  useEffect(()=>{
    fetch("/api/devices")
    .then(res=>res.json())
    .then(res=>{
      setDevices(res);
      if(res.length > 0){
        setSelectedDevice(res[0].kode_perangkat);
      }
    });
  },[]);

  useEffect(()=>{

    if(!selectedDevice) return;

    let socket;

    fetch(`/api/sensor/dashboard?kode_perangkat=${selectedDevice}`)
    .then(res=>{
      if(res.status === 401){
        window.location.href="/login";
        return null;
      }
      return res.json();
    })
    .then(res=>{
      if(res) setData(res);
    });
    socket = io("https://iot-aqua-rifky.duckdns.org",{ 
      transports: ["websocket"]});

    socket.on("sensor_update",(newData)=>{

      if(newData.kode_perangkat !== selectedDevice) return;

      setData(prev=>{
        if(!prev || !prev.history) return prev;

        let updatedHistory = [...prev.history, newData];

        if(updatedHistory.length > 14){
          updatedHistory = updatedHistory.slice(-14);
        }

        return {
          history: updatedHistory
        };
      });

    });

    return ()=>{
      if(socket) socket.disconnect();
    };

  },[selectedDevice]);

  if(!data || !data.history){
    return <p>Loading...</p>;
  }

  const latest = data.history.reduce((latest, item) => {
    if (!latest) return item;
    return new Date(item.created_at) > new Date(latest.created_at)
      ? item
      : latest;
  }, null);

  return(
    <div>

      <h1 className="text-2xl font-bold text-black mb-2">
        Data Kualitas Air {devices.find(d=>d.kode_perangkat===selectedDevice)?.name || "-"} Hari Ini
      </h1>

      <div className="mb-6">
        <select
          value={selectedDevice}
          onChange={(e)=>setSelectedDevice(e.target.value)}
          className="p-2 rounded bg-white shadow border-gray-200 border-l-4"
        >
          {devices.map(d=>(
            <option key={d.id} value={d.kode_perangkat}>
              {d.name} ({d.kode_perangkat})
            </option>
          ))}
        </select>
      </div>

      {/* CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card title="pH Air" value={latest?.ph} unit="" type="ph" />
        <Card title="Suhu Air" value={latest?.suhu} unit="°C" type="suhu" />
        <Card title="Nilai Padatan Terlarut" value={latest?.tds} unit="ppm" type="tds" />
        <Card title="Tingkat Kekeruhan" value={latest?.NTU} unit="" type="NTU" />
      </div>

      {/* CHART HEADER */}
      <div className="mb-10">

        <h1 className="text-2xl font-bold text-black mb-4">
          Grafik Kualitas Air{" "}
          {devices.find(d => d.kode_perangkat === selectedDevice)?.name || "-"}{" "}
          Dalam {period === "1d" ? "1" : period === "7d" ? "7" : period === "30d" ? "30" : "365"} Hari Terakhir
        </h1>

        <div className="flex gap-4 flex-wrap mb-8">

        <FilterButton
            title="1 Hari"
            subtitle="24 Jam"
            active={period==="1d"}
            onClick={()=>setPeriod("1d")}
        />

        <FilterButton
            title="1 Minggu"
            subtitle="7 Hari"
            active={period==="7d"}
            onClick={()=>setPeriod("7d")}
        />

        <FilterButton
            title="1 Bulan"
            subtitle="30 Hari"
            active={period==="30d"}
            onClick={()=>setPeriod("30d")}
        />

        <FilterButton
            title="1 Tahun"
            subtitle="365 Hari"
            active={period==="365d"}
            onClick={()=>setPeriod("365d")}
        />

        </div>

      </div>

      {/* CHART LIST */}
      <div className="space-y-8">

        <Chart
          title="Grafik pH"
          data={data.history}
          dataKey="ph"
          period={period}
        />

        <Chart
          title="Grafik Suhu"
          data={data.history}
          dataKey="suhu"
          period={period}
        />

        <Chart
          title="Grafik TDS"
          data={data.history}
          dataKey="tds"
          period={period}
        />

        <Chart
          title="Grafik Kekeruhan"
          data={data.history}
          dataKey="NTU"
          period={period}
        />

      </div>

    </div>
  );
}

function Card({ title, value, unit, type }) {

  const getStatus = (val, type) => {

    if (val === null || val === undefined) return "no-data";

    switch (type) {

      case "ph":
        if (val < 6 || val > 8.5) return "danger";
        if (val < 6.5 || val > 8) return "warning";
        return "normal";

      case "suhu":
        if (val < 24 || val > 32) return "danger";
        if (val < 26 || val > 30) return "warning";
        return "normal";

      case "tds":
        if (val > 1000) return "danger";
        if (val > 800) return "warning";
        return "normal";

      case "NTU":
        if (val >= 1000) return "danger";
        if (val >= 500) return "warning";
        return "normal";

      default:
        return "normal";
    }
  };

  const formatValue = (val, type) => {

    if (val === undefined || val === null) return "-";

    const num = Number(val);

    switch (type) {

      case "ph":
        return num.toFixed(2);

      case "suhu":
        return num.toFixed(1);

      case "tds":
        return num.toFixed(0);

      case "NTU":
        return num.toFixed(0);

      default:
        return num;
    }

  };

  const status = getStatus(value, type);

  const colorMap = {
    normal: "text-blue-500",
    warning: "text-yellow-500",
    danger: "text-red-500 animate-pulse",
    "no-data": "text-gray-500"
  };

  const borderMap = {
    normal: "border-gray-200",
    warning: "border-yellow-400",
    danger: "border-red-500",
    "no-data": "border-gray-300"
  };

  return (
    <div className={`bg-white p-6 rounded shadow border-l-4 ${borderMap[status]}`}>
      <h2 className="text-gray-900 mb-2">
        {title}
      </h2>

      <p className={`text-3xl font-bold ${colorMap[status]}`}>
        {formatValue(value, type)} {unit}
      </p>

      <p className="text-xs mt-2 text-gray-400 capitalize">
        {status === "normal" && "Normal"}
        {status === "warning" && "Perlu perhatian"}
        {status === "danger" && "Bahaya ⚠️"}
        {status === "no-data" && "Belum ada data"}
      </p>
    </div>
  );
}

function Chart({ title, data, dataKey, period }) {

  const getFilteredData = () => {

    if (!data) return [];

    const now = new Date();
    const start = new Date(now);

    switch (period) {

      case "1d":
        start.setDate(now.getDate() - 1);
        break;

      case "7d":
        start.setDate(now.getDate() - 7);
        break;

      case "30d":
        start.setMonth(now.getMonth() - 1);
        break;

      case "365d":
        start.setFullYear(now.getFullYear() - 1);
        break;

      default:
        start.setDate(now.getDate() - 7);
        break;
    }

    return [...data]
      .filter(item => {

        const d = new Date(item.created_at);

        return d >= start && d <= now;

      })
      .sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      );
  };

  const chartData = getFilteredData();

  const formatTime = (time) => {

    const date = new Date(time);

    switch (period) {

      case "1d":
        return date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        });

      case "7d":
        return date.toLocaleDateString("id-ID", {
          weekday: "short"
        });

      case "30d":
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short"
        });

      case "365d":
        return date.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit"
        });

      default:
        return date.toLocaleString("id-ID");
    }
  };

  const getYAxisProps = () => {

    switch (dataKey) {

      case "ph":
        return {
          domain: [0, 14]
        };

      case "suhu":
        return {
          domain: [20, 40]
        };

      case "tds":
        return {
          domain: [0, 1500]
        };

      case "NTU":
        return {
          domain: [0, 1500]
        };

      default:
        return {
          domain: ["auto", "auto"]
        };
    }
  };

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gray-200 mb-8">

      <h2 className="font-bold mb-4">
        {title}
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="created_at"
            tickFormatter={formatTime}
          />

          <YAxis {...getYAxisProps()} />

          <Tooltip
            labelFormatter={formatTime}
          />

          <Line
            type="monotone"
            dataKey={dataKey}
            strokeWidth={2}
            dot
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

function FilterButton({ active, onClick, title, subtitle}) {
  return (
    <button
      onClick={onClick}
      className={`w-32
        bg-white rounded-lg border-l-4 p-4 text-left transition-all duration-300
        ${
          active
            ? "border-blue-600 shadow-lg scale-105"
            : "border-gray-300 shadow-sm hover:border-blue-500 hover:shadow-md hover:scale-105"
        }
      `}
    >
      <p
        className={`text-lg font-semibold ${
          active ? "text-blue-600" : "text-gray-800"
        }`}
      >
        {title}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {subtitle}
      </p>
    </button>
  );
}