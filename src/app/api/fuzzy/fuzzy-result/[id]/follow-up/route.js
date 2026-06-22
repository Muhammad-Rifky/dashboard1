import db from "../../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// =========================
// POST — Tindak lanjuti rekomendasi fuzzy
// =========================
export async function POST(request, { params }) {
  try {
    const { id } = await params; // id dari fuzzy_result

    if (!id) {
      return Response.json(
        { error: "ID fuzzy_result wajib diisi" },
        { status: 400 }
      );
    }

    // =========================
    // AUTH
    // =========================
    const token = cookies().get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    const role = decoded.role; // pastikan field ini ada di payload JWT-mu

    // =========================
    // CEK FUZZY_RESULT ADA & MASIH PENDING
    // =========================
    const [fuzzyRows] = await db.execute(
      `SELECT id, kode_perangkat, status, action
       FROM fuzzy_result
       WHERE id = ?`,
      [id]
    );

    if (!fuzzyRows.length) {
      return Response.json(
        { error: "Rekomendasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const fuzzyResult = fuzzyRows[0];

    if (fuzzyResult.status === "completed") {
      return Response.json(
        { error: "Rekomendasi ini sudah ditindaklanjuti sebelumnya" },
        { status: 409 }
      );
    }

    // =========================
    // CATAT KE action_logs
    // =========================
    await db.execute(
      `INSERT INTO action_logs
       (fuzzy_result_id, kode_perangkat, user_id, role, action)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fuzzyResult.id,
        fuzzyResult.kode_perangkat,
        userId,
        role,
        fuzzyResult.action, // contoh: "Ganti Air"
      ]
    );

    // =========================
    // UPDATE STATUS FUZZY_RESULT
    // =========================
    await db.execute(
      `UPDATE fuzzy_result
       SET status = 'completed'
       WHERE id = ?`,
      [id]
    );

    return Response.json({
      success: true,
      message: "Rekomendasi berhasil ditandai selesai",
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