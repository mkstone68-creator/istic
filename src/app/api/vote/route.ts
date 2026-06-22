import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const voteSchema = z.object({
  candidateId: z.string().min(1),
});

const VOTE_COOKIE = "mr_voted";

// Vote simple et gratuit : un clic = un vote, limité à 1 fois par personne et par jour.
export async function POST(req: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ

    // Un seul vote autorisé par navigateur et par jour.
    if (req.cookies.get(VOTE_COOKIE)?.value === today) {
      return NextResponse.json({ success: false, alreadyVoted: true, error: "Vous avez déjà voté aujourd'hui." }, { status: 409 });
    }

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

    const res = NextResponse.json({ success: true, data: candidate });
    res.cookies.set(VOTE_COOKIE, today, {
      maxAge: 60 * 60 * 24, // 24 h : un nouveau jour, on peut revoter
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    }
    console.error("[POST /api/vote]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
