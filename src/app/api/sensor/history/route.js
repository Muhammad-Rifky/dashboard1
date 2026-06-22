import db from "../../../lib/db";
import { getUser } from "../../../lib/auth";

export async function GET(req){

  const user = await getUser();

  if(!user){
    return Response.json({ error:"Unauthorized" },{ status:401 });
  }

  const { searchParams } = new URL(req.url);
  const kode_perangkat = searchParams.get("kode_perangkat");

  let query = `
    SELECT d.kode_perangkat, s.ph, s.suhu, s.tds,s.turbidity_status, s.created_at
    FROM sensor_data s
    JOIN devices d ON s.kode_perangkat = d.kode_perangkat
    WHERE 1=1
  `;

  let params = [];

  // 🔥 FILTER DEVICE
  if(kode_perangkat){
    query += " AND s.kode_perangkat = ?";
    params.push(kode_perangkat);
  }

  // 🔥 FILTER ROLE
  if(user.role !== "admin"){
    query += " AND d.user_id = ?";
    params.push(user.id);
  }

  query += `
    ORDER BY s.created_at DESC
  `;

  const [rows] = await db.execute(query, params);

  return Response.json(rows);
}