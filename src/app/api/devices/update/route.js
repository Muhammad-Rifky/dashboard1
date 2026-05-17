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

    console.log("📨 SEND TO MQTT:", {
      device_id,
      command,
      duration
    });

    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: `iot/control/${device_id}`,
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
