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
      d.kode_perangkat,
      d.name,
      d.location,
      d.user_id,
      d.last_seen,
      d.status
    FROM devices d
    WHERE 1=1
  `;

  let params = [];

  // filter user
  if (user.role !== "admin") {
    query += " AND d.user_id = ?";
    params.push(user.id);
  }

  query += " ORDER BY d.id DESC";

  const [rows] = await db.execute(query, params);

  // langsung kirim hasil DB
  return Response.json(rows);
}