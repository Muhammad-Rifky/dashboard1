import mysql from "mysql2/promise";
import { fuzzyLogic } from "../../../lib/fuzzy";

export async function GET() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "iot_system",
  });

  const [rows] = await db.execute(`
    SELECT *
    FROM sensor_data
    ORDER BY created_at DESC
    LIMIT 1
  `);

  if (rows.length === 0) {
    return Response.json({
      success: false,
      message: "No data"
    });
  }

  const data = rows[0];

  const fuzzy = fuzzyLogic({
    ph: Number(data.ph),
    suhu: Number(data.suhu),
    tds: Number(data.tds),
    turbidity: Number(data.turbidity),
  });

  return Response.json({
    success: true,
    sensor: data,
    fuzzy
  });
}