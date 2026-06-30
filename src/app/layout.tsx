import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_DESCRIPTION, APP_URL } from "@/lib/constants";
import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  themeColor: "#1C0F0A",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: APP_URL,
    siteName: SITE_NAME,
    images: [
      {
        url:    `${APP_URL}/og/default`,
        width:  1200,
        height: 630,
        alt:    SITE_NAME,
        type:   "image/png",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       SITE_NAME,
    description: SITE_DESCRIPTION,
    images:      [`${APP_URL}/og/default`],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1C0F0A",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isMaintenance = false;
  let maintenanceMsg = "Notre plateforme est temporairement en maintenance. Revenez bientôt.";

  try {
    const pathname = headers().get("x-pathname") ?? "";
    if (!pathname.startsWith("/admin") && pathname !== "/maintenance") {
      const settings = await getSettings();
      if (settings?.isMaintenance) {
        isMaintenance = true;
        maintenanceMsg = settings.maintenanceMsg ?? maintenanceMsg;
      }
    }
  } catch {
    // Build time or DB unavailable — allow access
  }

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}

        {/* Maintenance overlay — appears as a blocking popup */}
        {isMaintenance && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(28,15,10,0.96)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "var(--font-body)",
          }}>
            <div style={{
              background: "white",
              borderRadius: "28px",
              padding: "44px 36px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 32px 100px rgba(0,0,0,.6)",
              animation: "fadeUp .4s ease both",
            }}>
              <div style={{
                width: 80,
                height: 80,
                background: "linear-gradient(135deg,#F0C040,#C9950A)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 32px rgba(201,149,10,.35)",
              }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>

              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "#1A1914",
                marginBottom: 12,
                lineHeight: 1.2,
              }}>
                Site en maintenance
              </h2>

              <p style={{
                color: "#5E5C53",
                fontSize: ".93rem",
                lineHeight: 1.7,
                marginBottom: 28,
              }}>
                {maintenanceMsg}
              </p>

              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#FDF6E3",
                border: "1.5px solid rgba(201,149,10,.25)",
                borderRadius: "99px",
                padding: "9px 18px",
                fontSize: ".78rem",
                fontWeight: 700,
                color: "#C9950A",
                letterSpacing: ".04em",
              }}>
                Reine du Meta By Helen
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
