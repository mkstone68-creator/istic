import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Remet tous les compteurs de votes à 0 pour recommencer une nouvelle journée.
export async function POST(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const [, , reset] = await prisma.$transaction([
      prisma.vote.deleteMany({}),
      prisma.transaction.deleteMany({}),
      prisma.candidate.updateMany({ data: { voteCount: 0 } }),
    ]);
    return NextResponse.json({ success: true, data: { candidatesReset: reset.count } });
  } catch (error) {
    console.error("[POST /api/admin/reset-votes]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
