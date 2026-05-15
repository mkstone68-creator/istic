# 🗳️ Miss & Mister ISTIC.YDE 2026 — Documentation complète

## Stack
- **Frontend/Backend** : Next.js 14 (App Router)
- **Base de données** : PostgreSQL via Railway
- **ORM** : Prisma
- **Déploiement** : Vercel
- **Paiement Afrique** : Fapshi (Mobile Money MTN/Orange/Moov)
- **Paiement Europe** : Virement + confirmation WhatsApp

---

## 🚀 Démarrage rapide

### 1. Installer

```bash
git clone https://github.com/votre-org/istic-vote.git
cd istic-vote
npm install
cp .env.example .env.local
# → Éditer .env.local avec vos vraies valeurs
```

### 2. Base de données Railway

1. Aller sur [railway.app](https://railway.app) → New Project → **Add PostgreSQL**
2. Copier `DATABASE_URL` depuis l'onglet **Connect**
3. Coller dans `.env.local`

```bash
npx prisma db push    # Créer les tables
npx prisma db seed    # Insérer les candidats de démo
```

### 3. Lancer en dev

```bash
npm run dev   # → http://localhost:3000
```

---

## 🌐 Déploiement Vercel

```bash
# 1. Pousser sur GitHub
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/votre-org/istic-vote.git
git push -u origin main

# 2. Vercel : importer le repo, ajouter les variables d'env, Deploy
```

Variables à renseigner sur Vercel :
| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Railway PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` |
| `PAYMENT_MODE` | `production` |
| `FAPSHI_API_USER` | Votre user Fapshi |
| `FAPSHI_API_KEY` | Votre clé Fapshi |
| `FAPSHI_WEBHOOK_SECRET` | Secret webhook Fapshi |

---

## 💳 Configuration Fapshi

### Créer un compte marchand
1. Aller sur [fapshi.com](https://fapshi.com)
2. S'inscrire → Activer le compte marchand
3. Récupérer **API User** et **API Key** dans Paramètres → Développeur

### Configurer le webhook
Dans le dashboard Fapshi → **Webhooks** :
- URL : `https://votre-app.vercel.app/api/webhook/fapshi`
- Copier le **Webhook Secret** dans `FAPSHI_WEBHOOK_SECRET`

---

## 🇪🇺 Flux paiement Europe

1. L'utilisateur sélectionne EUR/GBP/CHF → le convertisseur calcule l'équivalent FCFA
2. Les instructions s'affichent : dépôt au **+237 690 768 603** (MTN/Orange Money)
3. L'utilisateur envoie son reçu via WhatsApp → pré-rempli automatiquement
4. L'admin valide manuellement et crédite les votes via Prisma Studio ou un dashboard admin

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx                        # Accueil (logo + hero)
│   ├── candidats/
│   │   ├── page.tsx                    # Grille candidats + WhatsApp + Share
│   │   └── [id]/
│   │       ├── page.tsx                # Page candidat (OG dynamique)
│   │       └── CandidateDetailClient.tsx
│   ├── voter/page.tsx                  # Flow vote (Afrique + Europe + convertisseur)
│   ├── classement/page.tsx             # Classement live
│   ├── og/
│   │   ├── default/route.tsx           # OG image par défaut (SVG)
│   │   └── candidate/[id]/route.tsx    # OG image par candidat (SVG dynamique)
│   └── api/
│       ├── candidates/route.ts
│       ├── candidates/[id]/route.ts
│       ├── payment/initiate/route.ts   # Init Fapshi + anti-spam
│       ├── payment/status/[id]/route.ts # Polling + confirmation atomique
│       ├── ranking/route.ts
│       └── webhook/fapshi/route.ts     # Webhook signé Fapshi
├── components/
│   ├── layout/BottomNav.tsx            # Navigation avec logo M
│   └── ui/
│       ├── Logo.tsx                    # Logo SVG Miss & Mister
│       └── CurrencyConverter.tsx       # Convertisseur XAF/EUR/USD/GBP…
├── lib/
│   ├── prisma.ts                       # Singleton Prisma
│   ├── payment.ts                      # Service Fapshi (mock + prod)
│   ├── currency.ts                     # Taux de change + formatage
│   └── constants.ts                    # Config, packs, wire transfer
└── types/index.ts
```

---

## 🔐 Sécurité

- ✅ Votes incrémentés **uniquement côté serveur** (jamais frontend)
- ✅ Webhook Fapshi signé HMAC-SHA256
- ✅ Transaction Prisma atomique (protection double-crédit)
- ✅ Anti-spam : 5 transactions PENDING max / 10min / numéro
- ✅ Validation Zod stricte sur toutes les routes API
- ✅ IP logging sur chaque transaction

---

## 🎨 Personnalisation

### Ajouter/modifier des candidats
```bash
# Éditer prisma/seed.ts, puis :
npx prisma db seed
```

### Ajouter un groupe WhatsApp à un candidat
Dans Prisma Studio (`npm run db:studio`) → table `candidates` → champ `whatsappGroup`

### Changer le prix du vote
```ts
// src/lib/constants.ts
export const VOTE_PRICE_FCFA = 100; // ← ici
```

### Changer le numéro de virement Europe
```ts
// src/lib/constants.ts
export const EUROPE_WIRE = {
  phoneNumber: "+237690768603", // ← ici
  ...
};
```

### Taux de change
Éditer `src/lib/currency.ts` → objet `RATES`. En production, brancher une API de taux comme ExchangeRate-API.

---

## 📦 Commandes

```bash
npm run dev          # Dev
npm run build        # Build prod
npm run db:push      # Sync schéma BDD
npm run db:seed      # Seeder candidats
npm run db:studio    # Interface visuelle BDD
```
