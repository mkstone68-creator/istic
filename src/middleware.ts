import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "istic_admin";

// Crawlers sociaux — on ne les touche jamais
const SOCIAL_BOTS = [
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "googlebot",
  "bingbot",
  "applebot",
];

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET ?? "dev_secret_please_change";
  const today = new Date().toISOString().split("T")[0];
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(today));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return token === expected;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();

  // Laisser passer les crawlers sociaux sans aucun traitement
  if (SOCIAL_BOTS.some(bot => ua.includes(bot))) {
    return NextResponse.next();
  }

  // Force HTTPS en production
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "http" && process.env.NODE_ENV === "production") {
    const httpsUrl = `https://${request.headers.get("host")}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, { status: 301 });
  }

  // Inject pathname header pour les server components (maintenance check)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const next = NextResponse.next({ request: { headers: requestHeaders } });

  // Protection routes admin
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return next;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og/|robots.txt|sitemap.xml).*)"],
};
