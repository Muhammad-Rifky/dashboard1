// api/devices/assign/route.js
import db from "../../../lib/db";
import { getUser } from "../../../lib/auth";

export async function PUT(req) {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { kode_perangkat, user_id } = await req.json();

  await db.execute(
    `UPDATE devices SET user_id=? WHERE kode_perangkat=?`,
    [user_id, kode_perangkat]
  );

  return Response.json({ message: "Device berhasil diassign ulang" });
}