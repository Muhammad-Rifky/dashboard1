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
      `SELECT id, device_id, name, location, user_id, last_seen
       FROM devices WHERE id = ?`,
      [id]
    );

    if (!devices.length) {
      return Response.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const device = devices[0];

    // STATUS
    let status = "offline";

    if (device.last_seen) {
      const diff = (Date.now() - new Date(device.last_seen).getTime()) / 1000;
      status = diff < 600 ? "online" : "offline";
    }

    // SENSOR
    const [sensor] = await db.execute(
      `SELECT ph, suhu, tds, turbidity_status, created_at
       FROM sensor_data
       WHERE device_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [device.device_id]
    );

    return Response.json({
      ...device,
      status,
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