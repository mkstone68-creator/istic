"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/candidats", label: "Candidats", icon: "👥", exact: false },
  { href: "/admin/transactions", label: "Transactions", icon: "💳", exact: false },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️", exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside style={{
      width: 220,
      background: "#1C0F0A",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      zIndex: 100,
      boxShadow: "4px 0 24px rgba(0,0,0,.25)",
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(201,168,130,.12)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 900, color: "white", lineHeight: 1.1 }}>
          ISTIC Vote
        </div>
        <div style={{ fontSize: ".6rem", color: "#C9A882", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3, opacity: .8 }}>
          Administration
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 20px",
              color: isActive ? "#F0C040" : "rgba(201,168,130,.75)",
              background: isActive ? "rgba(240,192,64,.08)" : "transparent",
              borderRight: `3px solid ${isActive ? "#F0C040" : "transparent"}`,
              textDecoration: "none",
              fontSize: ".87rem",
              fontWeight: isActive ? 700 : 500,
              transition: "all .15s",
            }}>
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(201,168,130,.12)" }}>
        <div style={{ fontSize: ".7rem", color: "rgba(201,168,130,.4)", marginBottom: 10, letterSpacing: ".05em" }}>
          isticvote.online
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid rgba(201,168,130,.2)",
            color: "rgba(201,168,130,.6)",
            borderRadius: "8px",
            padding: "9px 14px",
            cursor: "pointer",
            fontSize: ".82rem",
            width: "100%",
            fontFamily: "var(--font-body)",
            transition: "all .15s",
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
