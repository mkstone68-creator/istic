import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "istic_admin";

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? "dev_secret_please_change";
}

export function generateToken(): string {
  const today = new Date().toISOString().split("T")[0];
  return createHmac("sha256", getSecret()).update(today).digest("hex");
}

export function verifyToken(token: string): boolean {
  return token === generateToken();
}

export function verifyPassword(password: string): boolean {
  return password === (process.env.ADMIN_PASSWORD ?? "admin_istic_2026");
}

export function requireAdmin(): void {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }
}

export function verifyAdminApiRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!token && verifyToken(token);
}
