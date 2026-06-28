import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return Response.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const userId = decoded.id;
    const userRole = decoded.role;

    const body = await request.json();
    const { command, kode_perangkat, duration } = body;

    if (!kode_perangkat || !command) {
      return Response.json({ error: "kode_perangkat dan command wajib diisi" }, { status: 400 });
    }

    // ====================================================
    // SKENARIO 1: GANTI AIR (MANUAL DENGAN DURASI)
    // ====================================================
    if (command === "ganti_air") {
      await db.execute(
        `UPDATE devices SET pump_status = 'manual' WHERE kode_perangkat = ?`,
        [kode_perangkat]
      );

      // Catat log ganti air berdurasi
      try {
        await db.execute(
          `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
           VALUES (NULL, ?, ?, ?, ?)`,
          [kode_perangkat, userId, userRole, `manual_water_change_${duration || 0}_sec`]
        );
      } catch (e) {}

      return Response.json({ success: true, message: "Proses ganti air berdurasi dimulai." });
    }

    // ====================================================
    // SKENARIO 2: POMPA ON (MANUAL TANPA DURASI / SAKELAR MURNI)
    // ====================================================
    if (command === "pompa_on") {
      await db.execute(
        `UPDATE devices SET pump_status = 'manual' WHERE kode_perangkat = ?`,
        [kode_perangkat]
      );

      // Catat log sakelar manual ON
      try {
        await db.execute(
          `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
           VALUES (NULL, ?, ?, ?, 'pump_forced_on')`,
          [kode_perangkat, userId, userRole]
        );
      } catch (e) {}

      return Response.json({ success: true, message: "Pompa berhasil dinyalakan manual." });
    }

    // ====================================================
    // SKENARIO 3: POMPA OFF (MEMATIKAN SEMUA JENIS POMPA)
    // ====================================================
    if (command === "pompa_off") {
      await db.execute(
        `UPDATE devices SET pump_status = 'off' WHERE kode_perangkat = ?`,
        [kode_perangkat]
      );

      // Catat log sakelar manual OFF
      try {
        await db.execute(
          `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
           VALUES (NULL, ?, ?, ?, 'pump_forced_off')`,
          [kode_perangkat, userId, userRole]
        );
      } catch (e) {}

      return Response.json({ success: true, message: "Pompa berhasil dimatikan." });
    }

    return Response.json({ error: "Command tidak dikenal" }, { status: 400 });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
