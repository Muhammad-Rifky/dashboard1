import db from "../../../lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.execute(
      `
      SELECT
        f.id,
        f.kode_perangkat,
        f.sensor_data_id,
        f.score,
        f.status,
        f.action,
        f.detail,
        f.created_at,
        d.name,
        d.location
    FROM fuzzy_result f
    JOIN devices d
        ON d.kode_perangkat = f.kode_perangkat
    WHERE f.id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return Response.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = rows[0];

    // Parse JSON jika masih berupa string
    if (data.detail && typeof data.detail === "string") {
      data.detail = JSON.parse(data.detail);
    }

    return Response.json(data);

  } catch (err) {
    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}