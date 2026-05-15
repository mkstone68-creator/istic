import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

    const now = new Date();
    const start = settings?.votingStartDate ? new Date(settings.votingStartDate) : null;
    const end   = settings?.votingEndDate   ? new Date(settings.votingEndDate)   : null;

    if (start && now < start) {
      return NextResponse.json({
        active: false,
        reason: "not_started",
        message: `Le vote commence le ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        startDate: start.toISOString(),
      });
    }

    if (end && now > end) {
      return NextResponse.json({
        active: false,
        reason: "ended",
        message: `Le vote s'est terminé le ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        endDate: end.toISOString(),
      });
    }

    return NextResponse.json({
      active: true,
      endDate: end?.toISOString() ?? null,
    });
  } catch {
    // Si DB indisponible, on laisse voter (fail-open)
    return NextResponse.json({ active: true, endDate: null });
  }
}
