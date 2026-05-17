import db from "../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      device_id,
      command,
      duration = 0,
    } = body;

    const topic =
      `iot/control/${device_id}`;

    const message = JSON.stringify({
      command,
      duration,
    });

    const mqttRes = await fetch(
      "http://localhost:3001/publish",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          topic,
          message,
        }),
      }
    );

    const result =
      await mqttRes.json();

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message:
            "MQTT publish gagal",
        },
        { status: 500 }
      );
    }

    /*
    ========================
    UPDATE DB PUMP STATUS
    ========================
    */

    if (
      command === "pompa_on" ||
      command === "ganti_air"
    ) {
      await db.query(
        `
        UPDATE devices
        SET pump_status='on'
        WHERE device_id=?
      `,
        [device_id]
      );
    }

    if (command === "pompa_off") {
      await db.query(
        `
        UPDATE devices
        SET pump_status='off'
        WHERE device_id=?
      `,
        [device_id]
      );
    }

    /*
    ========================
    SAVE LAST UPDATE
    ========================
    */
    if (command === "update") {
      await db.query(
        `
        UPDATE devices
        SET last_update_request=NOW()
        WHERE device_id=?
      `,
        [device_id]
      );
    }

    return Response.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return Response.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
