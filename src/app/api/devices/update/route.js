export async function POST(req) {
  try {
    const body = await req.json();
    const { device_id, command = "update" } = body;

    console.log("📨 SEND TO MQTT:", { device_id, command });

    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        topic: "iot/control",
        message: JSON.stringify({ device_id, command }),

      }),
    });

    const data = await res.json();

    return Response.json({
      success: true,

      message: `Command ${command} sent`,

      data,
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
