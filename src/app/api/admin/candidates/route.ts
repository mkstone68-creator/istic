import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

const createSchema = z.object({
  number: z.number().int().min(1),
  name: z.string().min(2),
  filiere: z.string().min(2),
  photoUrl: z.string().optional().default(""),
  description: z.string().optional().default(""),
  whatsappGroup: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const candidates = await prisma.candidate.findMany({ orderBy: { number: "asc" } });
    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("[GET /api/admin/candidates]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { number, name, filiere, photoUrl, description, whatsappGroup } = parsed.data;
    const candidate = await prisma.candidate.create({
      data: {
        number,
        name,
        filiere,
        photoUrl: photoUrl || "",
        description: description || null,
        whatsappGroup: whatsappGroup || null,
      },
    });
    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: false, error: "Ce numéro de candidat existe déjà" }, { status: 409 });
    }
    console.error("[POST /api/admin/candidates]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
