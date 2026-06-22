import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req){

  const token = req.cookies.get("token");

  if(!token){
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const kode_perangkat = searchParams.get("kode_perangkat");

  let query = `
    SELECT kode_perangkat, ph, suhu, tds, turbidity_adc, created_at

    FROM sensor_data
  `;

  let params = [];

  // 🔥 FILTER DEVICE
  if(kode_perangkat){
    query += ` WHERE kode_perangkat = ?`;
    params.push(kode_perangkat);
  }

  query += ` ORDER BY created_at DESC LIMIT 14`;

  const [rows] = await db.execute(query, params);

  const avgPH = rows.length ? rows.reduce((a,b)=>a+b.ph,0)/rows.length : 0;
  const avgSuhu = rows.length ? rows.reduce((a,b)=>a+b.suhu,0)/rows.length : 0;
  const avgTDS = rows.length ? rows.reduce((a,b)=>a+b.tds,0)/rows.length : 0;
  const avgTurbidity = rows.length ? rows.reduce((a,b)=>a+b.turbidity_status,0)/rows.length : 0;

  return NextResponse.json({
    average:{
      ph: avgPH.toFixed(2),
      suhu: avgSuhu.toFixed(2),
      tds: avgTDS.toFixed(0),
      turbidity: avgTurbidity.toFixed(2)
    },
    history: rows
  });

}
