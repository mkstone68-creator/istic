import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const [
      candidateCount,
      totalVotesAgg,
      revenueAgg,
      pendingCount,
      pendingEuropeCount,
      confirmedCount,
      failedCount,
      recentTransactions,
      topCandidates,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.aggregate({ _sum: { voteCount: true } }),
      prisma.transaction.aggregate({ where: { status: "CONFIRMED" }, _sum: { amount: true } }),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.transaction.count({ where: { status: "PENDING", isEuropeWire: true } }),
      prisma.transaction.count({ where: { status: "CONFIRMED" } }),
      prisma.transaction.count({ where: { status: "FAILED" } }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { candidate: { select: { name: true, number: true } } },
      }),
      prisma.candidate.findMany({
        take: 3,
        orderBy: { voteCount: "desc" },
        select: { id: true, name: true, number: true, filiere: true, voteCount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        candidateCount,
        totalVotes: totalVotesAgg._sum.voteCount ?? 0,
        revenue: revenueAgg._sum.amount ?? 0,
        pendingCount,
        pendingEuropeCount,
        confirmedCount,
        failedCount,
        recentTransactions,
        topCandidates,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
