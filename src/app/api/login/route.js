import db from "../../lib/db";
import {verifyToken} from "../../lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  if (user.password.startsWith("$2")) {
    isMatch = await bcrypt.compare(
      password,
      user.password
    );
  } else {
    isMatch = password === user.password;
  }

  if (!isMatch) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, // jika ada kolom role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const res = NextResponse.json({
    message: "Login berhasil",
    token, // opsional jika frontend juga membutuhkan token
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return res;
}