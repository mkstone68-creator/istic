// src/lib/payment.ts
import { FAPSHI_CONFIG } from "./constants";

export type PaymentStatusResult = {
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  transId?: string;
};

// URL correcte calculée depuis FAPSHI_MODE
function getFapshiBase(): string {
  const mode = (process.env.FAPSHI_MODE ?? "live").toLowerCase();
  return mode === "sandbox" ? "https://sandbox.fapshi.com" : "https://live.fapshi.com";
}

async function fapshiStatus(transId: string): Promise<PaymentStatusResult> {
  try {
    const base = getFapshiBase();
    const res = await fetch(`${base}/payment-status/${transId}`, {
      headers: {
        apiuser: FAPSHI_CONFIG.apiUser,
        apikey:  FAPSHI_CONFIG.apiKey,
        Accept:  "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const s = data.status === "SUCCESSFUL" ? "SUCCESSFUL"
            : data.status === "FAILED"     ? "FAILED"
            : "PENDING";
    return { status: s, transId: data.transId };
  } catch {
    return { status: "PENDING" };
  }
}

export async function checkPaymentStatus(transId: string): Promise<PaymentStatusResult> {
  return fapshiStatus(transId);
}

export function verifyFapshiWebhook(payload: string, signature: string): boolean {
  if (!signature) return false;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  const secret = FAPSHI_CONFIG.webhookSecret;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}
