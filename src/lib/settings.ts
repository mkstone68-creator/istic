import { prisma } from "./prisma";

export type SiteSettings = {
  id: string;
  votingStartDate: Date | null;
  votingEndDate: Date | null;
  isMaintenance: boolean;
  maintenanceMsg: string | null;
  updatedAt: Date;
};

export async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await prisma.settings.findUnique({ where: { id: "singleton" } });
  } catch {
    return null;
  }
}

export async function isVotingActive(): Promise<boolean> {
  const s = await getSettings();
  if (!s) return true;
  const now = new Date();
  if (s.votingStartDate && now < s.votingStartDate) return false;
  if (s.votingEndDate && now > s.votingEndDate) return false;
  return true;
}
