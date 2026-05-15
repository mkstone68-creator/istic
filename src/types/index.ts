// src/types/index.ts

export interface Candidate {
  id: string;
  number: number;
  name: string;
  filiere: string;
  photoUrl: string;
  description?: string | null;
  voteCount: number;
  whatsappGroup?: string | null;
}

export interface Transaction {
  id: string;
  candidateId: string;
  amount: number;
  voteCount: number;
  phoneNumber: string;
  paymentMethod: string;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "EXPIRED";
  externalRef?: string | null;
  isEuropeWire: boolean;
  createdAt: string;
}

export interface VotePack {
  votes: number;
  price: number;
  discount: number;
  label: string;
}

export interface InitPaymentPayload {
  candidateId: string;
  amount: number;
  phoneNumber: string;
  paymentMethod: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RankingEntry extends Candidate {
  rank: number;
  percentage: number;
}
