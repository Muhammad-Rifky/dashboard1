import db from "../../lib/db";
import { getUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let query = `
    SELECT 
      d.id,
      d.device_id,
      d.name,
      d.location,
      d.user_id,
      d.last_seen
    FROM devices d
    WHERE 1=1
  `;

  let params = [];

  // filter user
  if (user.role !== "superadmin") {
    query += " AND d.user_id = ?";
    params.push(user.id);
  }

  query += " ORDER BY d.id DESC";

  const [rows] = await db.execute(query, params);

  const now = Date.now();

  const devices = rows.map((d) => {
    let status = "offline";

    if (d.last_seen) {
      // ✅ FIX: pastikan parsing konsisten (MySQL DATETIME biasanya UTC-safe di Node)
      const lastTime = new Date(d.last_seen).getTime();

      // fallback safety kalau invalid date
      if (!isNaN(lastTime)) {
        const diff = (now - lastTime) / 1000;

        if (diff < 600) {
          status = "online";
        }
      }
    }

    return {
      ...d,
      status,
    };
  });

  return Response.json(devices);
}
