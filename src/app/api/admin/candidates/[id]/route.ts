import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

const updateSchema = z.object({
  number: z.number().int().min(1).optional(),
  name: z.string().min(2).optional(),
  filiere: z.string().min(2).optional(),
  photoUrl: z.string().optional(),
  description: z.string().optional().nullable(),
  whatsappGroup: z.string().optional().nullable(),
  voteCount: z.number().int().min(0).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: params.id } });
    if (!candidate) return NextResponse.json({ success: false, error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ success: true, data: candidate });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { candidateId: params.id } }),
      prisma.transaction.deleteMany({ where: { candidateId: params.id } }),
      prisma.candidate.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ success: false, error: "Candidat introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
