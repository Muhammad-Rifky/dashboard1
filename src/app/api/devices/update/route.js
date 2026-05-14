const lastRequestMap = new Map();

export async function POST(req) {
  try {
    const { device_id, command = "update" } = await req.json();

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

    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
