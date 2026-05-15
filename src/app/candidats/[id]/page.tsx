// src/app/candidats/[id]/page.tsx — Server Component
// generateMetadata injecte l'Open Graph avec la vraie photo du candidat
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CandidatDetailClient from "@/components/CandidatDetailClient";
import BottomNav from "@/components/layout/BottomNav";
import { APP_URL, SITE_NAME } from "@/lib/constants";

async function getCandidate(id: string) {
  try {
    return await prisma.candidate.findUnique({
      where: { id },
      select: { id: true, number: true, name: true, filiere: true, photoUrl: true, description: true, whatsappGroup: true, voteCount: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getCandidate(params.id);
  if (!c) return { title: "Candidat — ISTIC Vote" };

  const title       = `${c.name} — ${SITE_NAME}`;
  const description = `Votez pour ${c.name} (${c.filiere}) ! ${c.voteCount} vote${c.voteCount > 1 ? "s" : ""} reçus.`;
  const url         = `${APP_URL}/candidats/${c.id}`;
  // Priorité : vraie photo Cloudinary, sinon image OG SVG générée
  const image       = c.photoUrl && !c.photoUrl.startsWith("/placeholder")
    ? c.photoUrl
    : `${APP_URL}/og/candidate/${c.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type:   "profile",
      images: [{ url: image, width: 800, height: 1000, alt: c.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
    },
  };
}

export default async function CandidatDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidate(params.id);
  if (!candidate) notFound();

  return (
    <>
      <CandidatDetailClient candidate={candidate} />
      <BottomNav />
    </>
  );
}
