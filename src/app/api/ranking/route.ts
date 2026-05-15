// src/app/api/ranking/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: force-dynamic — le classement doit toujours être en temps réel
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { voteCount: "desc" },
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
    const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);
    const ranking = candidates.map((c, i) => ({
      ...c,
      rank: i + 1,
      percentage: totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0,
    }));
    return NextResponse.json({ success: true, data: { ranking, totalVotes } });
  } catch (error) {
    console.error("[GET /api/ranking]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
