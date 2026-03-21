import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/middleware";

const USERS: Record<string, string> = {
  "delphine@prodige-rh.fr": process.env.AUTH_DELPHINE_PASSWORD ?? "",
  "clemence@prodige-rh.fr": process.env.AUTH_CLEMENCE_PASSWORD ?? "",
};

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const expectedPassword = USERS[email?.toLowerCase?.()];

  if (!expectedPassword || !password || password !== expectedPassword) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const token = createSession(email.toLowerCase());

  const response = NextResponse.json({ ok: true });
  response.cookies.set("prodige_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
