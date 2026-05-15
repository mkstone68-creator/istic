import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, generateToken, ADMIN_COOKIE } from "@/lib/admin-auth";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Mot de passe requis" }, { status: 400 });
    }
    if (!verifyPassword(parsed.data.password)) {
      return NextResponse.json({ success: false, error: "Mot de passe incorrect" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, generateToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
