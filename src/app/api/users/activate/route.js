import { NextResponse } from "next/server";
import  db  from "../../../lib/db";

export async function POST(req) {
  try {
    const { id } = await req.json();

    await db.query(
      "UPDATE users SET status='active' WHERE id=?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "User berhasil diaktifkan",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Gagal aktivasi user" },
      { status: 500 }
    );
  }
}