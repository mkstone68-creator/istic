// src/components/ui/Logo.tsx
// Logo SVG — Méta Reine / Meta Queen

interface LogoProps {
  size?: number;
  variant?: "full" | "icon";
  className?: string;
}

export default function Logo({ size = 48, variant = "icon", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Dark background circle */}
        <circle cx="60" cy="60" r="60" fill="#1C0F0A" />

        {/* Thin outer ring */}
        <circle cx="60" cy="57" r="34" stroke="#C9A882" strokeWidth="1.2" fill="none" />

        {/* Decorative sparkles */}
        <g fill="#FFFFFF">
          {/* Top sparkle */}
          <path d="M60 20 L61 23 L60 26 L59 23 Z" />
          <path d="M57 23 L60 24 L63 23 L60 22 Z" />
          {/* Bottom sparkle */}
          <path d="M60 88 L61 91 L60 94 L59 91 Z" />
          <path d="M57 91 L60 92 L63 91 L60 90 Z" />
        </g>

        {/* Large decorative M (background, rose-gold) */}
        <text
          x="60"
          y="72"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="58"
          fontStyle="italic"
          fill="#C9A882"
          opacity="0.9"
        >
          M
        </text>

        {/* Smaller M overlay (white, centered) */}
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="28"
          fontWeight="bold"
          fill="#FFFFFF"
          opacity="0.95"
        >
          M
        </text>
      </svg>
    );
  }

  // Full logo
  return (
    <svg
      width={size * 4}
      height={size * 1.6}
      viewBox="0 0 480 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="480" height="192" fill="#1C0F0A" />

      {/* Circle emblem */}
      <circle cx="240" cy="72" r="52" stroke="#C9A882" strokeWidth="1.5" fill="none" />

      {/* Sparkles */}
      <g fill="white">
        <path d="M240 16 L241.5 20 L240 24 L238.5 20 Z" />
        <path d="M236 20 L240 21.5 L244 20 L240 18.5 Z" />
        <path d="M240 120 L241.5 124 L240 128 L238.5 124 Z" />
        <path d="M236 124 L240 125.5 L244 124 L240 122.5 Z" />
      </g>

      {/* Big italic M */}
      <text x="240" y="100" textAnchor="middle" fontFamily="Georgia,serif" fontSize="90" fontStyle="italic" fill="#C9A882" opacity="0.85">M</text>
      {/* Small M on top */}
      <text x="240" y="90" textAnchor="middle" fontFamily="Georgia,serif" fontSize="40" fontWeight="bold" fill="white" opacity="0.95">M</text>

      {/* MÉTA REINE */}
      <text x="240" y="158" textAnchor="middle" fontFamily="Georgia,serif" fontSize="32" letterSpacing="6" fill="#C9A882">MÉTA REINE</text>

      {/* META QUEEN */}
      <text x="240" y="180" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" letterSpacing="5" fill="#C9A882" opacity="0.7">META QUEEN</text>
    </svg>
  );
}
