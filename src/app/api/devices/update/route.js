import db from "../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      device_id,
      command,
      duration = 0,
    } = body;

    /*
    ========================
    MQTT TOPIC & MESSAGE
    ========================
    */

    const topic = `iot/control/${device_id}`;

    const message = JSON.stringify({
      command,
      duration,
    });

    /*
    ========================
    PUBLISH MQTT
    ========================
    */

    const mqttRes = await fetch(
      "http://76.13.192.195:3001/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          message,
        }),
      }
    );

    const result = await mqttRes.json();

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "MQTT publish gagal",
        },
        { status: 500 }
      );
    }

    /*
    ========================
    UPDATE DEVICE STATUS
    ========================
    */

    let pumpStatus = null;

    if (command === "pompa_on") {
      pumpStatus = "manual";
    }

    if (command === "ganti_air") {
      pumpStatus = "auto";
    }

    if (command === "pompa_off") {
      pumpStatus = "off";
    }

    if (pumpStatus) {
      await db.query(
        `
        UPDATE devices
        SET pump_status=?
        WHERE device_id=?
      `,
        [pumpStatus, device_id]
      );
    }

    /*
    ========================
    SAVE CONTROL HISTORY
    ========================
    */

    if (
      command === "pompa_on" ||
      command === "pompa_off" ||
      command === "ganti_air"
    ) {
      await db.query(
        `
        INSERT INTO history_control
        (device_id, action, source)
        VALUES (?, ?, ?)
      `,
        [device_id, command, "manual"]
      );
    }

    /*
    ========================
    SAVE LAST UPDATE REQUEST
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

    /*
    ========================
    RESPONSE SUCCESS
    ========================
    */

    return Response.json({
      success: true,
      message: "Command berhasil dikirim",
    });

  } catch (err) {
    console.error("CONTROL API ERROR:", err);

    return Response.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
