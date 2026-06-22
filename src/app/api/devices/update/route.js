export async function POST(req) {
  try {
    const body = await req.json();
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
    });

    const data = await res.json();

    return Response.json({
      success: true,
      message: `Command ${command} sent to ${device_id}`,
      data,
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}