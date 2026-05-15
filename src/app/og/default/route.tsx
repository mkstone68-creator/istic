// src/app/og/default/route.tsx — OG image par défaut du site
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
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
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="6" height="630" fill="url(#gold)"/>
  <rect x="0" y="624" width="1200" height="6" fill="url(#gold)"/>
  <!-- Decorative rings -->
  <circle cx="950" cy="315" r="300" fill="none" stroke="#C9A882" stroke-width="1" opacity="0.12"/>
  <circle cx="950" cy="315" r="220" fill="none" stroke="#C9A882" stroke-width="1" opacity="0.09"/>
  <circle cx="950" cy="315" r="140" fill="none" stroke="#C9A882" stroke-width="1" opacity="0.07"/>
  <!-- Logo emblem -->
  <circle cx="600" cy="210" r="88" fill="none" stroke="#C9A882" stroke-width="1.5" opacity="0.7"/>
  <!-- sparkles -->
  <path d="M600 116 L602 122 L600 128 L598 122 Z" fill="white" opacity="0.8"/>
  <path d="M594 122 L600 124 L606 122 L600 120 Z" fill="white" opacity="0.8"/>
  <path d="M600 292 L602 298 L600 304 L598 298 Z" fill="white" opacity="0.8"/>
  <path d="M594 298 L600 300 L606 298 L600 296 Z" fill="white" opacity="0.8"/>
  <!-- Big M italic -->
  <text x="600" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="130" font-style="italic" fill="#C9A882" opacity="0.75">M</text>
  <!-- Small M white -->
  <text x="600" y="238" text-anchor="middle" font-family="Georgia,serif" font-size="58" font-weight="bold" fill="white" opacity="0.95">M</text>
  <!-- MISS &amp; MISTER -->
  <text x="600" y="368" text-anchor="middle" font-family="Georgia,serif" font-size="58" letter-spacing="10" fill="#C9A882">MISS &amp; MISTER</text>
  <!-- ISTIC.YDE. 2026 -->
  <text x="600" y="410" text-anchor="middle" font-family="Georgia,serif" font-size="22" letter-spacing="8" fill="#C9A882" opacity="0.6">ISTIC.YDE. 2026</text>
  <!-- CTA banner -->
  <rect x="350" y="450" width="500" height="60" rx="30" fill="url(#gold)"/>
  <text x="600" y="489" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="white" letter-spacing="2">Votez maintenant →</text>
  <!-- Sparkles decoratifs -->
  <g fill="white" opacity="0.5">
    <path d="M120 100 L121.5 105 L120 110 L118.5 105 Z"/>
    <path d="M115 105 L120 106.5 L125 105 L120 103.5 Z"/>
    <path d="M1080 80 L1081.5 85 L1080 90 L1078.5 85 Z"/>
    <path d="M1075 85 L1080 86.5 L1085 85 L1080 83.5 Z"/>
    <path d="M80 500 L81 504 L80 508 L79 504 Z"/>
    <path d="M76 504 L80 505 L84 504 L80 503 Z"/>
    <path d="M1120 480 L1121 484 L1120 488 L1119 484 Z"/>
    <path d="M1116 484 L1120 485 L1124 484 L1120 483 Z"/>
  </g>
</svg>`.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
