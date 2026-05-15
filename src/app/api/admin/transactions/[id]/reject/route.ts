import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction introuvable" }, { status: 404 });
    }
    if (transaction.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Transaction déjà traitée" }, { status: 409 });
    }
    await prisma.transaction.update({
      where: { id: params.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/transactions/reject]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
