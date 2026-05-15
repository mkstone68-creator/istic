// src/lib/constants.ts

export const VOTE_PRICE_FCFA = 100;

export const VOTE_PACKS = [
  { votes: 10, price: 1000, discount: 0, label: "10 votes" },
  { votes: 25, price: 2250, discount: 10, label: "25 votes" },
  { votes: 50, price: 4500, discount: 10, label: "50 votes" },
  { votes: 100, price: 8000, discount: 20, label: "100 votes" },
] as const;

export const MIN_PAYMENT_FCFA = 100;

// ── Fapshi ─────────────────────────────────────────────────────────────────
export const FAPSHI_CONFIG = {
  apiUser: process.env.FAPSHI_API_USER ?? "",
  apiKey: process.env.FAPSHI_API_KEY ?? "",
  baseUrl:
    process.env.FAPSHI_BASE_URL ??
    (process.env.FAPSHI_MODE === "sandbox"
      ? "https://sandbox.fapshi.com"
      : "https://live.fapshi.com"),
  webhookSecret: process.env.FAPSHI_WEBHOOK_SECRET ?? "fapshi_secret_dev",
};

// ── Virement Europe ────────────────────────────────────────────────────────
export const EUROPE_WIRE = {
  phoneNumber: "+237690768603",
  whatsappLink: "https://wa.me/237690768603",
  instructions: [
    "Effectuez votre dépôt au numéro +237 690 768 603 (MTN/Orange Money)",
    "Indiquez en référence : votre numéro de téléphone + le nom du candidat",
    "Envoyez le reçu par WhatsApp au même numéro",
    "Vos votes seront crédités dans les 24h ouvrées",
  ],
};

export const DEFAULT_WHATSAPP_SUPPORT = "https://wa.me/237690768603";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://isticvote.online";
export const SITE_NAME = "Miss & Mister ISTIC.YDE 2026";
export const SITE_DESCRIPTION = "Votez pour vos candidats préférés — Plateforme officielle Miss & Mister ISTIC Yaoundé 2026";
