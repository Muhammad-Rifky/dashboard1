import mqtt from "mqtt";

export async function POST(req) {
  const client = mqtt.connect("mqtt://76.13.192.195:1883");

  return new Promise((resolve) => {
    client.on("connect", () => {

      console.log("MQTT connected");

      client.publish("iot/command", "update", () => {
        console.log("Command sent: update");

        client.end();

        resolve(
          Response.json({
            success: true,
            message: "Perintah update dikirim"
          })
        );
      });
    });
  });
}