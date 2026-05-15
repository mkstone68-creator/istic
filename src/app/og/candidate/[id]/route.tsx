// src/app/og/candidate/[id]/route.tsx
// Génère un Open Graph image dynamique par candidat
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // On retourne un SVG inline comme image OG
  // (En production, utiliser @vercel/og pour du rendu HTML→image)
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      select: { name: true, filiere: true, number: true, photoUrl: true },
    });

    const name = candidate?.name ?? "Candidat";
    const filiere = candidate?.filiere ?? "";
    const num = candidate?.number ?? 0;

    const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C0F0A"/>
      <stop offset="100%" stop-color="#2D1A0E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F0C040"/>
      <stop offset="100%" stop-color="#C9950A"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="900" cy="315" r="280" fill="none" stroke="#C9A882" stroke-width="1" opacity="0.15"/>
  <circle cx="900" cy="315" r="220" fill="none" stroke="#C9A882" stroke-width="1" opacity="0.1"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="url(#gold)"/>

  <!-- Logo M -->
  <circle cx="120" cy="80" r="40" fill="none" stroke="#C9A882" stroke-width="1.5" opacity="0.7"/>
  <text x="120" y="96" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-style="italic" fill="#C9A882" opacity="0.7">M</text>
  <text x="120" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="white" opacity="0.9">M</text>

  <!-- Site name -->
  <text x="178" y="70" font-family="Georgia,serif" font-size="18" letter-spacing="3" fill="#C9A882" opacity="0.8">MISS &amp; MISTER</text>
  <text x="178" y="95" font-family="Georgia,serif" font-size="13" letter-spacing="4" fill="#C9A882" opacity="0.5">ISTIC.YDE. 2026</text>

  <!-- Candidate number badge -->
  <rect x="100" y="220" width="90" height="38" rx="19" fill="url(#gold)"/>
  <text x="145" y="245" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="white">${String(num).padStart(2,"0")}</text>

  <!-- Candidate name -->
  <text x="100" y="340" font-family="Georgia,serif" font-size="72" font-weight="bold" fill="white" opacity="0.97">${name}</text>

  <!-- Filiere -->
  <text x="100" y="395" font-family="Georgia,serif" font-size="28" fill="#C9A882" opacity="0.75">${filiere}</text>

  <!-- CTA -->
  <rect x="100" y="450" width="280" height="58" rx="29" fill="url(#gold)"/>
  <text x="240" y="487" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="white">Voter maintenant →</text>

  <!-- Bottom text -->
  <text x="100" y="590" font-family="Georgia,serif" font-size="16" letter-spacing="2" fill="#C9A882" opacity="0.4">istickamervote.vercel.app</text>

  <!-- Decorative sparkles top-right -->
  <g fill="white" opacity="0.6">
    <path d="M1100 80 L1101.5 84 L1100 88 L1098.5 84 Z"/>
    <path d="M1096 84 L1100 85.5 L1104 84 L1100 82.5 Z"/>
    <path d="M1150 120 L1151 123 L1150 126 L1149 123 Z"/>
    <path d="M1147 123 L1150 124 L1153 123 L1150 122 Z"/>
  </g>
</svg>`.trim();

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    // Fallback OG générique
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1C0F0A"/>
      <text x="600" y="315" text-anchor="middle" font-family="Georgia,serif" font-size="60" fill="#C9A882">ISTIC VOTE 2026</text>
    </svg>`;
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  }
}
