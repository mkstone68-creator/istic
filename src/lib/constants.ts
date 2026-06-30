// src/lib/constants.ts

export const VOTE_PRICE_FCFA = 50;

// Minimum 2 votes (= 100 FCFA) : on ne peut pas acheter 1 seul vote.
export const MIN_VOTES = 2;
export const MIN_PAYMENT_FCFA = VOTE_PRICE_FCFA * MIN_VOTES; // 100

export const VOTE_PACKS = [
  { votes: 2, price: 100, discount: 0, label: "2 votes" },
  { votes: 10, price: 500, discount: 0, label: "10 votes" },
  { votes: 20, price: 1000, discount: 0, label: "20 votes" },
  { votes: 50, price: 2500, discount: 0, label: "50 votes" },
  { votes: 100, price: 5000, discount: 0, label: "100 votes" },
] as const;

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
export const SITE_NAME = "Méta Reine";
export const SITE_NAME_EN = "Meta Queen";
export const SITE_DESCRIPTION = "Votez pour vos candidats préférés — Méta Reine / Meta Queen";
