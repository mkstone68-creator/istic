// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const candidates = [
  { number: 1, name: "Awa Diarra",      filiere: "Licence 3 Marketing",      photoUrl: "/candidates/awa-diarra.jpg",      whatsappGroup: "https://chat.whatsapp.com/awa-support" },
  { number: 2, name: "Mariam Koné",     filiere: "Licence 3 Droit",           photoUrl: "/candidates/mariam-kone.jpg",     whatsappGroup: "https://chat.whatsapp.com/mariam-support" },
  { number: 3, name: "Fatou Touré",     filiere: "Licence 2 Informatique",    photoUrl: "/candidates/fatou-toure.jpg",     whatsappGroup: null },
  { number: 4, name: "Nadia Ouattara",  filiere: "Licence 2 Gestion",         photoUrl: "/candidates/nadia-ouattara.jpg", whatsappGroup: null },
  { number: 5, name: "Kadiatou Sylla",  filiere: "Master 1 Finance",          photoUrl: "/candidates/kadiatou-sylla.jpg", whatsappGroup: null },
  { number: 6, name: "Aminata Balde",   filiere: "Licence 3 Communication",   photoUrl: "/candidates/aminata-balde.jpg",  whatsappGroup: null },
  { number: 7, name: "Ibrahima Diallo", filiere: "Licence 3 Informatique",    photoUrl: "/candidates/ibrahima-diallo.jpg",whatsappGroup: null },
  { number: 8, name: "Moussa Camara",   filiere: "Master 1 Marketing",        photoUrl: "/candidates/moussa-camara.jpg",  whatsappGroup: null },
];

async function main() {
  console.log("🌱 Seeding candidates...");
  for (const c of candidates) {
    await prisma.candidate.upsert({
      where:  { number: c.number },
      update: { whatsappGroup: c.whatsappGroup },
      create: { ...c, voteCount: Math.floor(Math.random() * 800) + 50 },
    });
  }
  console.log("✅ Seed complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
