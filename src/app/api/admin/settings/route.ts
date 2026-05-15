import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

const updateSchema = z.object({
  votingStartDate: z.string().nullable().optional(),
  votingEndDate: z.string().nullable().optional(),
  isMaintenance: z.boolean().optional(),
  maintenanceMsg: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if ("isMaintenance" in parsed.data) data.isMaintenance = parsed.data.isMaintenance;
    if ("maintenanceMsg" in parsed.data) data.maintenanceMsg = parsed.data.maintenanceMsg;
    if ("votingStartDate" in parsed.data) {
      data.votingStartDate = parsed.data.votingStartDate ? new Date(parsed.data.votingStartDate) : null;
    }
    if ("votingEndDate" in parsed.data) {
      data.votingEndDate = parsed.data.votingEndDate ? new Date(parsed.data.votingEndDate) : null;
    }

    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[PUT /api/admin/settings]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
