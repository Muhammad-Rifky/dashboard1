import db from "../../../lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.execute(
      `
      SELECT
        id,
        kode_perangkat,
        sensor_data_id,
        score,
        status,
        action,
        detail,
        created_at
      FROM fuzzy_result
      WHERE id = ?
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