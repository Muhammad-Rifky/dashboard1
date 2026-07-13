import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {

    // Ambil token dari cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode JWT
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
    const userRole = decoded.role; 

    // Body Request
    const body = await request.json();
    const { command, kode_perangkat, duration, fuzzy_result_id } = body;

    // BRANCH A: KONTROL MANUAL POMPA (Jika terdapat 'command')
    if (command) {
      if (!kode_perangkat) {
        return Response.json(
          { error: "kode_perangkat wajib diisi untuk kontrol manual" },
          { status: 400 }
        );
      }

      // 1. SKENARIO: GANTI AIR (MANUAL DENGAN DURASI)
      if (command === "ganti_air") {
        await db.execute(
          `UPDATE devices SET pump_status = 'manual' WHERE kode_perangkat = ?`,
          [kode_perangkat]
        );
        await fetch("http://iot-aqua-rifky.duckdns.org:3001/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: `iot/control/${kode_perangkat}`,
            message: JSON.stringify({
              command: "ganti_air",
              duration: duration || 0,
            }),
          }),
        });

        try {
          await db.execute(
            `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
             VALUES (NULL, ?, ?, ?, ?)`,
            [kode_perangkat, userId, userRole, `manual_water_change_${duration || 0}_sec`]
          );
        } catch (e) {
          console.error("LOG MANUAL DURATION ERROR:", e);
        }

        return Response.json({ success: true, message: "Proses ganti air berdurasi dimulai." });
      }

      // 2. SKENARIO: POMPA ON (MANUAL TANPA DURASI)
      if (command === "pompa_on") {
        await db.execute(
          `UPDATE devices SET pump_status = 'manual' WHERE kode_perangkat = ?`,
          [kode_perangkat]
        );

        await fetch("http://iot-aqua-rifky.duckdns.org:3001/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: `iot/control/${kode_perangkat}`,
            message: JSON.stringify({
              command: "pompa_on",
            }),
          }),
        });

        try {
          await db.execute(
            `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
             VALUES (NULL, ?, ?, ?, 'pump_forced_on')`,
            [kode_perangkat, userId, userRole]
          );
        } catch (e) {
          console.error("LOG MANUAL ON ERROR:", e);
        }

        return Response.json({ success: true, message: "Pompa berhasil dinyalakan manual." });
      }

      // 3. SKENARIO: POMPA OFF (PAKSAAN MATIKAN POMPA)
      if (command === "pompa_off") {
        await db.execute(
          `UPDATE devices SET pump_status = 'off' WHERE kode_perangkat = ?`,
          [kode_perangkat]
        );
        await fetch("http://iot-aqua-rifky.duckdns.org:3001/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: `iot/control/${kode_perangkat}`,
              message: JSON.stringify({
                command: "pompa_off",
              }),
            }),
          });

        try {
          await db.execute(
            `INSERT INTO action_logs (fuzzy_result_id, kode_perangkat, user_id, role, action) 
             VALUES (NULL, ?, ?, ?, 'pump_forced_off')`,
            [kode_perangkat, userId, userRole]
          );
        } catch (e) {
          console.error("LOG MANUAL OFF ERROR:", e);
        }

        return Response.json({ success: true, message: "Pompa berhasil dimatikan." });
      }

      return Response.json({ error: "Command tidak dikenal" }, { status: 400 });
    }

    // BRANCH B: KONFIRMASI REKOMENDASI FUZZY (Kode Asli Anda)
    if (!fuzzy_result_id) {
      return Response.json(
        { error: "fuzzy_result_id atau command wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil data fuzzy_result
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

    // Update status
    await db.execute(
      `
      UPDATE fuzzy_result
      SET
      status='completed',
      verified=1,
      verified_by=?,
      verified_at=NOW()
      WHERE
      kode_perangkat=?
      AND action='Ganti Air'
      AND status='pending'
      `,
      [userId, fuzzy.kode_perangkat]
    );

    // Simpan histori
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
          userRole, 
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
