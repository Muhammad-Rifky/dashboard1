import db from "../../lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE id=?",
      [payload.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}