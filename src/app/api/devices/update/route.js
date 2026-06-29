import db from "../../../lib/db";

export async function POST(req) {
  try {
    console.log("API masuk")
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

    /* PUBLISH MQTT*/

console.log("=== PUBLISH MQTT ===");
console.log("Topic:", topic);
console.log("Message:", message);

let mqttRes;

try {
  mqttRes = await fetch("iot-aqua-rifky.duckdns.org", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      message,
    }),
  });

  console.log("MQTT STATUS:", mqttRes.status);
  console.log("MQTT STATUS TEXT:", mqttRes.statusText);

} catch (fetchErr) {
  console.error("===== FETCH MQTT ERROR =====");
  console.error(fetchErr);
  console.error("CAUSE:", fetchErr.cause);
  console.error("STACK:", fetchErr.stack);

  throw fetchErr;
}

const responseText = await mqttRes.text();

console.log("MQTT RESPONSE:", responseText);

let result;

try {
  result = JSON.parse(responseText);
} catch (jsonErr) {
  console.error("JSON PARSE ERROR:", jsonErr);

  throw new Error(
    `MQTT Server mengembalikan response bukan JSON: ${responseText}`
  );
}

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
        INSERT INTO action_logs
        (kode_perangkat,user_id, role, action, source)
        VALUES (?, ?, ?, ?, ?)
        `,
        [kode_perangkat, userId, role, command, "manual"]);
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
  console.error("========== CONTROL API ERROR ==========");
  console.error("MESSAGE:", err.message);
  console.error("NAME:", err.name);
  console.error("CAUSE:", err.cause);
  console.error("STACK:", err.stack);

  return Response.json(
    {
      success: false,
      message: err.message,
    },
    { status: 500 }
  );
}
}
