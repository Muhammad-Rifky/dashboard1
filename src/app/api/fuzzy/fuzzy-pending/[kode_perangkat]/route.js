import db from "../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// =========================
// GET — Ambil rekomendasi fuzzy yang masih pending
// untuk device tertentu
//
// Dipanggil di halaman DeviceDetail untuk menampilkan
// notifikasi rekomendasi, misal:
// "Air buruk, segera lakukan penggantian air"
// =========================
export async function GET(request, { params }) {
  try {
    const { kode_perangkat } = await params;

    if (!kode_perangkat) {
      return Response.json(
        { error: "kode_perangkat wajib diisi" },
        { status: 400 }
      );
    }

    // =========================
    // AUTH
    // =========================
    const token = cookies().get("session")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    jwt.verify(token, process.env.JWT_SECRET);

    // =========================
    // AMBIL REKOMENDASI PENDING TERBARU
    // =========================
    const [rows] = await db.execute(
      `SELECT
          fr.id,
          fr.kode_perangkat,
          fr.sensor_data_id,
          fr.score,
          fr.status,
          fr.action,
          fr.created_at
       FROM fuzzy_result fr
       WHERE fr.kode_perangkat = ?
         AND fr.status = 'pending'
         AND fr.action != 'Tidak Ada Action'
       ORDER BY fr.created_at DESC
       LIMIT 1`,
      [kode_perangkat]
    );

    if (!rows.length) {
      return Response.json({ hasPending: false });
    }

    return Response.json({
      hasPending: true,
      data: rows[0],
    });

  } catch (err) {
    console.error("API ERROR:", err);

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}