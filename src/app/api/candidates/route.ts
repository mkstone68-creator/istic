// src/app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: force-dynamic désactive le cache statique de Next.js App Router
// Sans ça, les candidats ajoutés ne s'affichent pas en production
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        name: true,
        filiere: true,
        photoUrl: true,
        whatsappGroup: true,
        voteCount: true,
      },
    });
    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("[GET /api/candidates]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
