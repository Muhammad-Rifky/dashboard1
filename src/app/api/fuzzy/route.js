import db from "../../lib/db";

export async function GET() {
  try {

    const [rows] = await db.execute(`
      SELECT
        id,
        kode_perangkat,
        sensor_data_id,
        score,
        status,
        action,
        created_at
      FROM fuzzy_result
      ORDER BY created_at DESC
    `);

    return Response.json(rows);

  } catch (err) {

    console.error(err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }
}