import db from "../../../lib/db";
import { getUser } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const user = await getUser();

    if (user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await req.json();

    await db.execute(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, password, role]
    );

    return NextResponse.json({
      message: "User berhasil ditambahkan"
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
