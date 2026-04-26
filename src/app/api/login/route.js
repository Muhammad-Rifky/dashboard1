import db from "../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password } = await req.json();

  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email=?",
    [email]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const user = rows[0];

  if (user.status !== "active") {
    return NextResponse.json(
      { error: "Akun belum aktif, hubungi admin" },
      { status: 403 }
    );
  }

  let isMatch = false;

  // jika password hash bcrypt
  if (user.password.startsWith("$2")) {
    isMatch = await bcrypt.compare(
      password,
      user.password
    );
  } else {
    // password lama plaintext
    isMatch = password === user.password;
  }

  if (!isMatch) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({
    message: "Login berhasil",
  });

  res.cookies.set("session", user.id, {
    httpOnly: true,
    path: "/",
  });

  return res;
}