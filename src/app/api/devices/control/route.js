import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {

    // ======================
    // Ambil token dari cookie
    // ======================
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ======================
    // Decode JWT
    // ======================
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (err) {
      return Response.json(
        { error: "Token tidak valid atau expired" },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const userRole = decoded.role; // ✅ FIX: ambil dari JWT

    // ======================
    // Body Request
    // ======================
    const body = await request.json();

    const { fuzzy_result_id } = body;

    if (!fuzzy_result_id) {
      return Response.json(
        { error: "fuzzy_result_id wajib diisi" },
        { status: 400 }
      );
    }

    // ======================
    // Ambil data fuzzy_result
    // ======================
    const [rows] = await db.execute(
      `
      SELECT
        id,
        kode_perangkat,
        status
      FROM fuzzy_result
      WHERE id = ?
      `,
      [fuzzy_result_id]
    );

    if (!rows.length) {
      return Response.json(
        { error: "Data fuzzy tidak ditemukan" },
        { status: 404 }
      );
    }

    const fuzzy = rows[0];

    if (fuzzy.status === "completed") {
      return Response.json(
        { error: "Rekomendasi ini sudah dikonfirmasi sebelumnya" },
        { status: 409 }
      );
    }

    // ======================
    // Update status
    // ======================
    await db.execute(
      `
      UPDATE fuzzy_result
      SET status = 'completed'
      WHERE id = ?
      `,
      [fuzzy_result_id]
    );

    // ======================
    // Simpan histori (FIX DI SINI)
    // ======================
    try {
      const [result] = await db.execute(
        `
        INSERT INTO action_logs (
          fuzzy_result_id,
          kode_perangkat,
          user_id,
          role,
          action
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          fuzzy_result_id,
          fuzzy.kode_perangkat,
          userId,
          userRole, // ✅ FIX: bukan user.role
          "water_changed"
        ]
      );

      console.log("LOG INSERT SUCCESS:", result);

    } catch (err) {
      console.error("INSERT ACTION LOG ERROR:", err);
    }

    return Response.json({
      success: true,
      message: "Penggantian air berhasil dikonfirmasi"
    });

  } catch (err) {
    console.error(err);

    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}