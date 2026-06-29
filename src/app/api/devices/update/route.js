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

    /*
========================
PUBLISH MQTT
========================
*/

console.log("=== PUBLISH MQTT ===");
console.log("Topic:", topic);
console.log("Message:", message);

let mqttRes;

try {
  mqttRes = await fetch("http://127.0.0.1:3001/publish", {
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

console.log("MQTT RESPONSE:");
console.log(responseText);

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
