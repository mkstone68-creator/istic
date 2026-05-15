// src/lib/payment.ts
import { FAPSHI_CONFIG, APP_URL } from "./constants";

export type PaymentInitResult = {
  success: boolean;
  reference: string;
  paymentLink?: string;
  error?: string;
};

export type PaymentStatusResult = {
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  transId?: string;
};

async function mockInitiate(amount: number): Promise<PaymentInitResult> {
  await new Promise((r) => setTimeout(r, 700));
  const ref = "MOCK_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7).toUpperCase();
  return { success: true, reference: ref };
}
async function mockStatus(): Promise<PaymentStatusResult> {
  await new Promise((r) => setTimeout(r, 500));
  return { status: "SUCCESSFUL" };
}

async function fapshiInitiate(
  phoneNumber: string,
  amount: number,
  message: string,
  externalRef: string
): Promise<PaymentInitResult> {
  try {
    const res = await fetch(FAPSHI_CONFIG.baseUrl + "/initiate-pay", {
      method: "POST",
      headers: {
        apiuser: FAPSHI_CONFIG.apiUser,
        apikey: FAPSHI_CONFIG.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        phone: phoneNumber,
        message,
        externalId: externalRef,
        redirectUrl: APP_URL + "/paiement/confirmation",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, reference: "", error: data.message ?? "Fapshi error" };
    return { success: true, reference: data.transId ?? externalRef, paymentLink: data.link };
  } catch (e) {
    return { success: false, reference: "", error: String(e) };
  }
}

async function fapshiStatus(transId: string): Promise<PaymentStatusResult> {
  const res = await fetch(FAPSHI_CONFIG.baseUrl + "/payment-status/" + transId, {
    headers: { apiuser: FAPSHI_CONFIG.apiUser, apikey: FAPSHI_CONFIG.apiKey },
  });
  const data = await res.json();
  const s: "SUCCESSFUL" | "FAILED" | "PENDING" =
    data.status === "SUCCESSFUL" ? "SUCCESSFUL" : data.status === "FAILED" ? "FAILED" : "PENDING";
  return { status: s, transId: data.transId };
}

const USE_MOCK = process.env.PAYMENT_MODE !== "production";

export async function initiatePayment(
  phoneNumber: string,
  amount: number,
  description: string,
  externalRef: string
): Promise<PaymentInitResult> {
  if (USE_MOCK) return mockInitiate(amount);
  return fapshiInitiate(phoneNumber, amount, description, externalRef);
}

export async function checkPaymentStatus(reference: string): Promise<PaymentStatusResult> {
  if (USE_MOCK) return mockStatus();
  return fapshiStatus(reference);
}

export function calculateVotes(amountFcfa: number): number {
  return Math.floor(amountFcfa / 100);
}

export function verifyFapshiWebhook(payload: string, signature: string): boolean {
  if (USE_MOCK) return true;
  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", FAPSHI_CONFIG.webhookSecret).update(payload).digest("hex");
  return expected === signature;
}
