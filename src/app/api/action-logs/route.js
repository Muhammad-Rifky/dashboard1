import db from "../../lib/db";
import { getUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = `
    SELECT
      al.id,
      al.kode_perangkat,
      al.action,
      al.role,
      fr.status AS status,
      al.created_at,
      u.name AS user_name
    FROM action_logs al
    LEFT JOIN users u
      ON al.user_id = u.id
    JOIN devices d
      ON al.kode_perangkat = d.kode_perangkat
    LEFT JOIN fuzzy_result fr
      ON fr.id = (
        SELECT id
        FROM fuzzy_result
        WHERE kode_perangkat = al.kode_perangkat
          -- PENYESUAIAN CRITICAL: Kunci status fuzzy pada saat/sebelum log ini dibuat
          AND created_at <= al.created_at 
        ORDER BY created_at DESC
        LIMIT 1
      )
    WHERE 1=1
      AND al.action = 'water_changed'
    `;

    const params = [];

    // filter user
    if (user.role !== "admin") {
      query += " AND d.user_id = ?";
      params.push(user.id);
    }

    query += " ORDER BY al.created_at DESC";
    const [rows] = await db.execute(query, params);
    return Response.json(rows);

  } catch (err) {

    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}