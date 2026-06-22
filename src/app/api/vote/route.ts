import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const voteSchema = z.object({
  candidateId: z.string().min(1),
});

// Vote simple et gratuit : un clic = un vote.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Candidat invalide" }, { status: 400 });
    }

    // Vérifie que le vote est bien ouvert (dates de campagne).
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    const now = new Date();
    const start = settings?.votingStartDate ? new Date(settings.votingStartDate) : null;
    const end = settings?.votingEndDate ? new Date(settings.votingEndDate) : null;

    if (start && now < start) {
      return NextResponse.json({ success: false, error: "Le vote n'a pas encore commencé." }, { status: 403 });
    }
    if (end && now > end) {
      return NextResponse.json({ success: false, error: "Le vote est terminé." }, { status: 403 });
    }
    if (settings?.isMaintenance) {
      return NextResponse.json({ success: false, error: "Plateforme en maintenance." }, { status: 503 });
    }

    const candidate = await prisma.candidate.update({
      where: { id: parsed.data.candidateId },
      data: { voteCount: { increment: 1 } },
      select: { id: true, name: true, voteCount: true },
    });

    return NextResponse.json({ success: true, data: candidate });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    }
    console.error("[POST /api/vote]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
