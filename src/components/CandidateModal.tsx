"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Heart, Share2, Trophy, Loader2 } from "lucide-react";

export type Candidate = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  votes?: number;
  category?: string | null;
};

type Props = {
  open: boolean;
  candidates: Candidate[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  onVote: (candidate: Candidate) => void;
};

export default function CandidateModal({
  open,
  candidates,
  index,
  onClose,
  onIndexChange,
  onVote,
}: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const candidate = candidates[index];

  // Reset image state on candidate change
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [candidate?.id]);

  const goNext = useCallback(() => {
    if (index < candidates.length - 1) {
      setAnimDir("left");
      setTimeout(() => {
        onIndexChange(index + 1);
        setAnimDir(null);
      }, 180);
    }
  }, [index, candidates.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setAnimDir("right");
      setTimeout(() => {
        onIndexChange(index - 1);
        setAnimDir(null);
      }, 180);
    }
  }, [index, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goNext, goPrev]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !candidate) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 60;
    if (delta > threshold) goNext();
    else if (delta < -threshold) goPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/voter?id=${candidate.id}`
      : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: candidate.name,
          text: `Votez pour ${candidate.name} sur ISTIC Vote !`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Lien copié !");
      }
    } catch {
      /* user cancelled */
    }
  };

  const imageSrc =
    !imgError && candidate.image
      ? candidate.image
      : "/placeholder-candidate.svg";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`
          relative w-full sm:max-w-2xl
          bg-white dark:bg-neutral-900
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl overflow-hidden
          max-h-[95vh] sm:max-h-[90vh]
          flex flex-col
          ${animDir === "left" ? "animate-slide-out-left" : ""}
          ${animDir === "right" ? "animate-slide-out-right" : ""}
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
        >
          <X size={20} />
        </button>

        {/* Prev / Next (desktop) */}
        {index > 0 && (
          <button
            onClick={goPrev}
            aria-label="Précédent"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {index < candidates.length - 1 && (
          <button
            onClick={goNext}
            aria-label="Suivant"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Image — adaptative (object-cover, ratio fixe sur mobile, auto desktop) */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-neutral-400" size={28} />
            </div>
          )}
          <Image
            src={imageSrc}
            alt={candidate.name}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            priority
            className={`object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
          />

          {/* Gradient overlay + nom */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
            {candidate.category && (
              <span className="inline-block mb-2 px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                {candidate.category}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
              {candidate.name}
            </h2>
            {typeof candidate.votes === "number" && (
              <div className="flex items-center gap-1.5 mt-2 text-white/90 text-sm">
                <Trophy size={16} className="text-yellow-400" />
                <span className="font-semibold">
                  {candidate.votes.toLocaleString("fr-FR")}
                </span>
                <span className="opacity-80">vote{candidate.votes > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          {/* Compteur slide */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium">
            {index + 1} / {candidates.length}
          </div>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
          {candidate.description ? (
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {candidate.description}
            </p>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 italic">
              Aucune description disponible.
            </p>
          )}
        </div>

        {/* Action bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 bg-white dark:bg-neutral-900">
          <button
            onClick={handleShare}
            aria-label="Partager"
            className="p-3 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => onVote(candidate)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition"
          >
            <Heart size={18} fill="white" />
            Voter pour {candidate.name.split(" ")[0]}
          </button>
        </div>

        {/* Indicateurs swipe (mobile) */}
        <div className="sm:hidden flex justify-center gap-1.5 pb-3">
          {candidates.map((_, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-indigo-600"
                  : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
              }`}
              aria-label={`Aller au candidat ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }

        @keyframes slide-out-left {
          0%   { transform: translateX(0);    opacity: 1; }
          100% { transform: translateX(-30%); opacity: 0; }
        }
        @keyframes slide-out-right {
          0%   { transform: translateX(0);   opacity: 1; }
          100% { transform: translateX(30%); opacity: 0; }
        }
        .animate-slide-out-left  { animation: slide-out-left 0.18s ease-in forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.18s ease-in forwards; }
      `}</style>
    </div>
  );
}
