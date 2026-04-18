import { fuzzyLogic } from "../../../lib/fuzzy";

export async function POST(req) {
  try {
    const { temperature, humidity } = await req.json();

    if (temperature == null || humidity == null) {
      return Response.json(
        { error: "Input tidak lengkap" },
        { status: 400 }
      );
    }

    const result = fuzzyLogic(temperature, humidity);

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: "Server error", detail: err.message },
      { status: 500 }
    );
  }
}