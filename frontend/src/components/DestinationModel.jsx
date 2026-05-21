import React, { useEffect, useRef, useState } from "react";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import { CategoryFallback } from "./DestinationCard";

/**
 * DestinationModal.jsx — Full-Detail Destination View
 */

const CATEGORY_COLORS = {
  Nature:    { bg: "#1a4a1a", text: "#7ecb7e" },
  Mountain:  { bg: "#1a2a4a", text: "#7eaaeb" },
  Village:   { bg: "#3a2a10", text: "#d4a050" },
  Adventure: { bg: "#3a1a10", text: "#e07a5a" },
  Wildlife:  { bg: "#2a3a10", text: "#a0c050" },
  Cultural:  { bg: "#3a1a3a", text: "#c07ac0" },
  Beach:     { bg: "#0a2a3a", text: "#50b0d0" },
  Heritage:  { bg: "#3a2a10", text: "#c0a050" },
};

function ModalSection({ title, icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: "var(--color-accent)" }}>{icon}</span>
        <h3
          className="font-display font-semibold text-sm uppercase tracking-wider"
          style={{ color: "var(--color-secondary)" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function InfoChip({ icon, label, value }) {
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center"
      style={{
        backgroundColor: "var(--color-surface-alt)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function PillList({ items, color }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: color ? `${color}18` : "var(--color-surface-alt)",
            color: color || "var(--color-secondary)",
            border: `1px solid ${color ? `${color}30` : "var(--color-border)"}`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Hero image with CategoryFallback ─────────────────────────────────────────
function HeroImage({ src, alt, category }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <CategoryFallback category={category} size="modal" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold"
      style={{ color: "var(--color-accent-warm)" }}
    >
      ★ {rating?.toFixed(1)}
      <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>/ 5</span>
    </span>
  );
}

export default function DestinationModal() {
  const activeDestination     = useStore((s) => s.activeDestination);
  const setActiveDestination  = useStore((s) => s.setActiveDestination);
  const toggleSaveDestination = useStore((s) => s.toggleSaveDestination);
  const isDestinationSaved    = useStore((s) => s.isDestinationSaved);

  const modalRef = useRef(null);
  const isOpen   = !!activeDestination;
  const dest     = activeDestination;
  const isSaved  = dest ? isDestinationSaved(dest.id) : false;
  const catStyle = dest ? (CATEGORY_COLORS[dest.category] || CATEGORY_COLORS.Nature) : {};

  const close = () => setActiveDestination(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.scrollTop = 0;
  }, [activeDestination?.id]);

  const handleSave = () => {
    toggleSaveDestination(dest);
    toast(isSaved ? "Removed from saved places" : `${dest.name} saved! 🌿`, {
      icon: isSaved ? "🗑️" : "💚",
    });
  };

  const handleOpenMap = () => {
    if (dest.mapsUrl) {
      window.open(dest.mapsUrl, "_blank", "noopener,noreferrer");
    } else {
      toast("Map link unavailable for this destination.", { icon: "🗺️" });
    }
  };

  const handleShare = () => {
    const text = `Discover ${dest.name} — ${dest.location}\n${dest.mapsUrl || ""}`;
    if (navigator.share) {
      navigator.share({ title: dest.name, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast("Link copied to clipboard! 🔗");
    }
  };

  if (!dest) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: "var(--color-overlay)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Modal container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        aria-hidden={!isOpen}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${dest.name}`}
          className="relative flex flex-col w-full max-w-2xl pointer-events-auto overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "1.5rem",
            boxShadow: "var(--shadow-lg)",
            maxHeight: "calc(100vh - 2rem)",
            animation: isOpen ? "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
          }}
        >
          {/* HERO IMAGE */}
          <div className="relative shrink-0" style={{ height: "220px" }}>
            <HeroImage src={dest.image} alt={dest.name} category={dest.category} />

            {/* Gradient overlay — only meaningful when real image is shown */}
            {dest.image && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,18,8,0.85) 0%, rgba(10,18,8,0.2) 55%, transparent 100%)",
                }}
              />
            )}

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
              >
                {dest.category}
              </span>
            </div>

            {/* Top-right action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                aria-label="Share destination"
                className="w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: "rgba(17,26,15,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                </svg>
              </button>

              <button
                onClick={handleSave}
                aria-label={isSaved ? "Unsave" : "Save"}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: isSaved ? "var(--color-accent)" : "rgba(17,26,15,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={isSaved ? "#fff" : "none"}
                  stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <button
                onClick={close}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: "rgba(17,26,15,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Name + location — always visible (dark bg behind text when no image) */}
            <div
              className="absolute bottom-4 left-4 right-4"
              style={{
                // When no real image, text sits on the gradient card bg — add a subtle backdrop
                ...(!dest.image ? {
                  backgroundColor: "rgba(0,0,0,0.25)",
                  borderRadius: "0.75rem",
                  padding: "0.5rem 0.75rem",
                } : {}),
              }}
            >
              <h2 className="font-display font-bold text-xl leading-tight text-white mb-1">
                {dest.name}
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {dest.location}
                  </span>
                </div>
                <Stars rating={dest.rating} />
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div
            ref={modalRef}
            className="flex-1 overflow-y-auto px-5 py-5"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              <InfoChip icon="📅" label="Best Time"   value={dest.bestTime || "Year-round"} />
              <InfoChip icon="💰" label="Est. Budget" value={dest.estimatedBudget || "Varies"} />
              <InfoChip icon="🏷️" label="Type"        value={dest.category || "Nature"} />
            </div>

            <ModalSection title="About" icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            }>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                {dest.description}
              </p>
            </ModalSection>

            {dest.highlights?.length > 0 && (
              <ModalSection title="Highlights" icon="✨">
                <ul className="space-y-2">
                  {dest.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm"
                        style={{ color: "var(--color-secondary)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"
                        className="shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </ModalSection>
            )}

            {dest.tags?.length > 0 && (
              <ModalSection title="Tags" icon="🏷️">
                <PillList items={dest.tags} color="var(--color-accent)" />
              </ModalSection>
            )}

            {dest.nearbyAttractions?.length > 0 && (
              <ModalSection title="Nearby Attractions" icon="📍">
                <PillList items={dest.nearbyAttractions} />
              </ModalSection>
            )}

            {dest.localFood?.length > 0 && (
              <ModalSection title="Local Food" icon="🍽️">
                <PillList items={dest.localFood} color="var(--color-accent-warm)" />
              </ModalSection>
            )}

            {dest.stayOptions?.length > 0 && (
              <ModalSection title="Where to Stay" icon="🏡">
                <div className="grid grid-cols-2 gap-2">
                  {dest.stayOptions.map((stay, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                      style={{
                        backgroundColor: "var(--color-surface-alt)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--color-accent)" }}>🏠</span>
                      {stay}
                    </div>
                  ))}
                </div>
              </ModalSection>
            )}

            {dest.travelTips && (
              <div
                className="flex items-start gap-3 p-4 rounded-2xl mb-6"
                style={{
                  backgroundColor: "rgba(61,110,61,0.08)",
                  border: "1px solid rgba(61,110,61,0.2)",
                }}
              >
                <span className="text-lg shrink-0">💡</span>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Travel Tip
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                    {dest.travelTips}
                  </p>
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>

          {/* STICKY FOOTER */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <button onClick={handleOpenMap} className="btn-primary flex-1 justify-center text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Open Maps
            </button>

            <button onClick={handleShare} className="btn-secondary flex-1 justify-center text-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
              Share
            </button>

            <button
              onClick={handleSave}
              aria-label={isSaved ? "Remove from saved" : "Save destination"}
              className="w-11 h-11 rounded-full flex items-center justify-center
                         shrink-0 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isSaved ? "rgba(61,110,61,0.15)" : "var(--color-surface-alt)",
                border: isSaved ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border)",
                color: isSaved ? "var(--color-accent)" : "var(--color-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}