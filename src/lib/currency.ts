// src/lib/currency.ts

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  region: "africa" | "europe" | "world";
}

export const CURRENCIES: Currency[] = [
  { code: "XAF", name: "Franc CFA", symbol: "FCFA", flag: "🇨🇲", region: "africa" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", region: "europe" },
  { code: "USD", name: "Dollar US", symbol: "$", flag: "🇺🇸", region: "world" },
  { code: "GBP", name: "Livre Sterling", symbol: "£", flag: "🇬🇧", region: "europe" },
  { code: "CHF", name: "Franc Suisse", symbol: "CHF", flag: "🇨🇭", region: "europe" },
  { code: "GNF", name: "Franc Guinéen", symbol: "GNF", flag: "🇬🇳", region: "africa" },
  { code: "XOF", name: "Franc CFA (UEMOA)", symbol: "F CFA", flag: "🌍", region: "africa" },
];

// Taux fixes de référence (à rafraîchir via API en prod)
// 1 XAF = X unités devise
const RATES: Record<string, number> = {
  XAF: 1,
  EUR: 0.00152,     // 1 XAF ≈ 0.00152 EUR
  USD: 0.00166,
  GBP: 0.00131,
  CHF: 0.00150,
  GNF: 14.3,
  XOF: 1,           // parité fixe XAF/XOF
};

export const VOTE_PRICE_XAF = 100;

/**
 * Convertit un montant XAF vers une devise cible
 */
export function xafToTarget(amountXAF: number, targetCurrency: string): number {
  const rate = RATES[targetCurrency] ?? 1;
  return amountXAF * rate;
}

/**
 * Convertit un montant devise source vers XAF
 */
export function toXAF(amount: number, fromCurrency: string): number {
  const rate = RATES[fromCurrency] ?? 1;
  if (rate === 0) return 0;
  return Math.round(amount / rate);
}

/**
 * Nombre de votes pour un montant dans une devise donnée
 */
export function votesFromAmount(amount: number, currency: string): number {
  const xaf = toXAF(amount, currency);
  return Math.floor(xaf / VOTE_PRICE_XAF);
}

/**
 * Montant minimum dans une devise pour 1 vote
 */
export function minAmountForVote(currency: string): number {
  const rate = RATES[currency] ?? 1;
  return parseFloat((VOTE_PRICE_XAF * rate).toFixed(2));
}

/**
 * Formater un montant dans sa devise
 */
export function formatAmount(amount: number, currency: string): string {
  const curr = CURRENCIES.find((c) => c.code === currency);
  if (!curr) return `${amount} ${currency}`;
  if (["XAF", "XOF", "GNF"].includes(currency)) {
    return `${Math.round(amount).toLocaleString("fr-FR")} ${curr.symbol}`;
  }
  return `${curr.symbol}${amount.toFixed(2)}`;
}

/**
 * Détermine si la devise est "europe" (virement bancaire requis)
 */
export function isEuropeCurrency(currency: string): boolean {
  const curr = CURRENCIES.find((c) => c.code === currency);
  return curr?.region === "europe";
}
