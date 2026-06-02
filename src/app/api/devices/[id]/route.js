import db from "../../../lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    console.log("GET DEVICE ID:", id);

    if (!id) {
      return Response.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    // DEVICE
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

        // SENSOR
    const [sensor] = await db.execute(
  `SELECT ph, suhu, tds, turbidity_adc, created_at
   FROM sensor_data
   WHERE kode_perangkat = ?
   ORDER BY created_at DESC
   LIMIT 10`,
  [device.kode_perangkat]
);

    return Response.json({
      ...device,
      sensor: sensor ?? []
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
