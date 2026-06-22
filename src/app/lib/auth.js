import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch {
    return null;
  }
}

export async function getUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}