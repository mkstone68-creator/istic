// src/app/api/candidates/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: force-dynamic — empêche Next.js de cacher la réponse en production
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
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
    if (!candidate) return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    console.error("[GET /api/candidates/[id]]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
