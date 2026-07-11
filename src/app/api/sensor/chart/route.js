import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req) {

  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const kode_perangkat = searchParams.get("kode_perangkat");
  const period = searchParams.get("period") || "1d";

  let where = "WHERE 1=1";
  let params = [];

  if (kode_perangkat) {
    where += " AND kode_perangkat = ?";
    params.push(kode_perangkat);
  }

  let query = "";

  switch (period) {

    // 1 HARI
    case "1d":

      query = `
        SELECT
          kode_perangkat,
          DATE_FORMAT(created_at,'%Y-%m-%d %H:00:00') AS created_at,
          AVG(ph) AS ph,
          AVG(suhu) AS suhu,
          AVG(tds) AS tds,
          AVG(NTU) AS NTU
        FROM sensor_data
        ${where}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY
          kode_perangkat,
          YEAR(created_at),
          MONTH(created_at),
          DAY(created_at),
          HOUR(created_at)
        ORDER BY created_at ASC
      `;

      break;

    // 7 HARI
    case "7d":

      query = `
        SELECT
            kode_perangkat,
            created_at,
            ph,
            suhu,
            tds,
            NTU
        FROM sensor_data
        ${where}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at ASC
      `;

      break;

    // 30 HARI
    case "30d":

      query = `
        SELECT
          kode_perangkat,
            created_at,
            ph,
            suhu,
            tds,
            NTU
        FROM sensor_data
        ${where}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY created_at ASC
      `;

      break;

    // 1 TAHUN
    case "365d":

      query = `
        SELECT
            kode_perangkat,
            DATE(created_at) AS created_at,
            AVG(ph) AS ph,
            AVG(suhu) AS suhu,
            AVG(tds) AS tds,
            AVG(NTU) AS NTU
        FROM sensor_data
        ${where}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        GROUP BY
            kode_perangkat,
            DATE(created_at)
        ORDER BY created_at ASC
      `;

      break;

    default:

      query = `
        SELECT
          kode_perangkat,
          DATE_FORMAT(created_at,'%Y-%m-%d %H:00:00') AS created_at,
          AVG(ph) AS ph,
          AVG(suhu) AS suhu,
          AVG(tds) AS tds,
          AVG(NTU) AS NTU
        FROM sensor_data
        ${where}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY
          kode_perangkat,
          YEAR(created_at),
          MONTH(created_at),
          DAY(created_at),
          HOUR(created_at)
        ORDER BY created_at ASC
      `;
  }
  console.log("====================");
  console.log("PERIOD :", period);
  console.log(query);
  console.log(params);
  const [rows] = await db.execute(query, params);
  console.log("Jumlah data dari database :", rows.length);

  return NextResponse.json(rows);
}