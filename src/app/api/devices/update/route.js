const lastRequestMap = new Map();

export async function POST(req) {
  try {
    const {
      device_id,
      command = "update",
      duration = 0
    } = await req.json();

    if (!device_id) {
      return Response.json(
        { success: false, message: "device_id wajib" },
        { status: 400 }
      );
    }

    const key = `${device_id}-${command}`;
    const now = Date.now();

    const lastTime = lastRequestMap.get(key);

    // 🔥 BLOCK DUPLICATE REQUEST (2 detik window)
    if (lastTime && now - lastTime < 2000) {
      return Response.json({
        success: false,
        message: "Duplicate request blocked",
      });
    }

    lastRequestMap.set(key, now);

    console.log("📨 SEND TO MQTT:", {
      device_id,
      command,
      duration
    });

    // 🔥 FIX UTAMA: PER-DEVICE TOPIC
    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: `iot/control/${device_id}`,   // ✅ FIX INI
        message: JSON.stringify({
          command,
          duration
        }),
      }),
    });

    const data = await res.json();

    return Response.json({
      success: true,
      message: `Command ${command} sent to ${device_id}`,
      data,
    });

  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
