import db from "../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
<<<<<<< HEAD
    const { device_id, command = "update", duration = 0 } = body;

    console.log("📨 SEND TO MQTT:", { device_id, command, duration });

    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: `iot/control/${device_id}`,   // 🔥 FIX UTAMA
        message: JSON.stringify({
          command,
          duration
        }),
      }),

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
>>>>>>> 1b83e7b0e6d49e85f7618b6e48154abf37ee1eb1
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
<<<<<<< HEAD
      message: `Command ${command} sent to ${device_id}`,
      data,
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.message },
=======
      message: "Command berhasil dikirim",
    });

  } catch (err) {
    console.error("CONTROL API ERROR:", err);

    return Response.json(
      {
        success: false,
        message: err.message,
      },
>>>>>>> 1b83e7b0e6d49e85f7618b6e48154abf37ee1eb1
      { status: 500 }
    );
  }
}
