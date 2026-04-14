export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch("http://76.13.192.195:3001/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "iot/command",
        message: "update",
      }),
    });

    const data = await res.json();

    return Response.json({
      success: true,
      message: "Perintah update dikirim via VPS",
      data,
    });

  } catch (error) {
    console.error("ERROR:", error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}