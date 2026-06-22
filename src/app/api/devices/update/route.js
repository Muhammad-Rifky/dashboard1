import db from "../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      kode_perangkat,
      command,
      duration = 0,
    } = body;

    /*
    ========================
    MQTT TOPIC & MESSAGE
    ========================
    */

    const topic = `iot/control/${kode_perangkat}`;

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
        WHERE kode_perangkat=?
        `,
        [pumpStatus, kode_perangkat]
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
        (kode_perangkat, action, source)
        VALUES (?, ?, ?)
        `,
        [kode_perangkat, command, "manual"]
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
        WHERE kode_perangkat=?
        `,
        [kode_perangkat]
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
