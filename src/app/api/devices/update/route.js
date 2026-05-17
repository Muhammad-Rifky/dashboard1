import db from "../../../lib/db";

const lastRequestMap =
  new Map();

export async function POST(req) {
  try {
    const {
      device_id,
      command = "update",
      duration = 0,
    } = await req.json();

    const key =
      `${device_id}-${command}`;

    const now = Date.now();

    const lastTime =
      lastRequestMap.get(key);

    if (
      lastTime &&
      now - lastTime < 2000
    ) {
      return Response.json({
        success: false,
      });
    }

    lastRequestMap.set(
      key,
      now
    );

    await fetch(
      "http://76.13.192.195:3001/publish",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          topic: `iot/control/${device_id}`,
          message:
            JSON.stringify({
              command,
              duration,
            }),
        }),
      }
    );

    // simpan waktu request update
    if (command === "update") {
      await db.query(
        `
        UPDATE devices
        SET last_update_request = NOW()
        WHERE device_id = ?
      `,
        [device_id]
      );
    }

    return Response.json({
      success: true,
    });

  } catch (err) {
    return Response.json(
      {
        error:
          err.message,
      },
      {
        status: 500,
      }
    );
  }
}
