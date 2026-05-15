"use client";
// src/components/layout/BottomNav.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Trophy } from "lucide-react";

function VoteIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <text x="13" y="18" textAnchor="middle" fontFamily="Georgia,serif" fontSize="16" fontStyle="italic" fill="white" opacity="0.85">M</text>
    </svg>
  );
}

const navItems = [
  { href: "/",          label: "Accueil",    icon: Home },
  { href: "/candidats", label: "Candidats",  icon: Users },
  { href: "/voter",     label: "Voter",      icon: null,  special: true },
  { href: "/classement",label: "Classement", icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon: Icon, special }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`nav-item${isActive ? " active" : ""}`}>
            {special ? (
              <span className="nav-icon-vote">
                <VoteIcon />
              </span>
            ) : Icon ? (
              <Icon />
            ) : null}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
