import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    // 1. Ambil token dari cookie secara asynchronous (Wajib await di Next.js terbaru)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("RAW TOKEN:", token);          // tambahkan ini
    console.log("TOKEN LENGTH:", token?.length); // dan ini
    console.log("TOKEN TYPE:", typeof token);    // dan ini

    if (!token) {
      return Response.json(
        { error: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    // 2. Verifikasi JWT dengan aman
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("DECODED USER:", decoded); // Berhasil login
    } catch (jwtErr) {
      // Jika token expired atau dimanipulasi, arahkan ke 401, bukan 500
      return Response.json(
        { error: "Unauthorized: Token tidak valid atau kedaluwarsa" },
        { status: 401 }
      );
    }

    // 3. Ambil dan validasi parameter ID
    const { id } = await params;
    console.log("GET DEVICE ID:", id);

    if (!id) {
      return Response.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    // 4. Query DEVICE ke Database
    const [devices] = await db.execute(
      `SELECT 
          id,
          kode_perangkat,
          name,
          location,
          user_id,
          last_seen,
          status,
          pump_status
      FROM devices
      WHERE id = ?`,
      [id]
    );

    if (!devices.length) {
      return Response.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const device = devices[0];

    // (Opsional) Keamanan tambahan: Pastikan perangkat ini milik user yang sedang login
    // if (device.user_id !== decoded.id) {
    //   return Response.json({ error: "Forbidden: Akses ditolak" }, { status: 403 });
    // }

    // 5. Query SENSOR
    const [sensor] = await db.execute(
      `SELECT ph, suhu, tds, NTU, created_at
       FROM sensor_data
       WHERE kode_perangkat = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [device.kode_perangkat]
    );

    // 6. Query FUZZY
    const [fuzzy] = await db.execute(
      `SELECT
          id,
          status,
          action,
          score,
          created_at
       FROM fuzzy_result
       WHERE kode_perangkat = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [device.kode_perangkat]
    );

    // 7. Kembalikan Response Sukses
    return Response.json({
      ...device,
      sensor: sensor ?? [],
      latestAction: fuzzy[0] || null
    });

  } catch (err) {
    // Menangkap error database atau error sistem lainnya
    console.error("API ERROR:", err);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
