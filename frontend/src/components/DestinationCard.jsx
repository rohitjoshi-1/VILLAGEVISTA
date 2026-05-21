import React, { useState } from "react";
import useStore from "../store/useStore";
import toast from "react-hot-toast";

/**
 * DestinationCard.jsx — Destination Result Card
 */

// ── Category colour map ───────────────────────────────────────────────────────
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

// ── Category emoji map ────────────────────────────────────────────────────────
const CATEGORY_EMOJI = {
  Nature:    "🌿",
  Mountain:  "🏔️",
  Village:   "🏡",
  Adventure: "🧗",
  Wildlife:  "🦁",
  Cultural:  "🏛️",
  Beach:     "🏖️",
  Heritage:  "🏰",
};

// ── Category gradient map (for the fallback card background) ──────────────────
const CATEGORY_GRADIENT = {
  Nature:    "linear-gradient(135deg, #0d2e0d 0%, #1a4a1a 100%)",
  Mountain:  "linear-gradient(135deg, #0d1a3a 0%, #1a2a5a 100%)",
  Village:   "linear-gradient(135deg, #2a1a0a 0%, #4a3010 100%)",
  Adventure: "linear-gradient(135deg, #2a0d0d 0%, #4a1a1a 100%)",
  Wildlife:  "linear-gradient(135deg, #1a2a0a 0%, #2a4a10 100%)",
  Cultural:  "linear-gradient(135deg, #2a0a2a 0%, #4a1a4a 100%)",
  Beach:     "linear-gradient(135deg, #0a1a2a 0%, #0a3a4a 100%)",
  Heritage:  "linear-gradient(135deg, #2a1a0a 0%, #3a2a0a 100%)",
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || { bg: "#1a3a1a", text: "#7ecb7e" };
}

// ── Star rating display ───────────────────────────────────────────────────────
function StarRating({ rating }) {
  const full  = Math.floor(rating || 0);
  const half  = (rating || 0) % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array(full).fill(0).map((_, i) => (
        <svg key={`f${i}`} width="11" height="11" viewBox="0 0 24 24"
          fill="var(--color-accent-warm)" stroke="none">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      ))}
      {half && (
        <svg key="h" width="11" height="11" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="var(--color-accent-warm)" />
              <stop offset="50%" stopColor="var(--color-border)" />
            </linearGradient>
          </defs>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
            fill="url(#half-grad)" />
        </svg>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <svg key={`e${i}`} width="11" height="11" viewBox="0 0 24 24"
          fill="var(--color-border)" stroke="none">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold" style={{ color: "var(--color-accent-warm)" }}>
        {rating?.toFixed(1)}
      </span>
    </span>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveButton({ isSaved, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={isSaved ? "Remove from saved" : "Save destination"}
      className="w-8 h-8 rounded-full flex items-center justify-center
                 transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        backgroundColor: isSaved ? "var(--color-accent)" : "rgba(17,26,15,0.55)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24"
        fill={isSaved ? "#fff" : "none"}
        stroke="#fff"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

// ── Category fallback placeholder ─────────────────────────────────────────────
/**
 * Shown whenever an image is null, empty, or fails to load.
 * Uses the destination's category to pick a relevant emoji + gradient
 * so the card still looks intentional and on-brand.
 */
export function CategoryFallback({ category, size = "card" }) {
  const emoji    = CATEGORY_EMOJI[category]    || "🌍";
  const gradient = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.Nature;
  const catStyle = getCategoryStyle(category);

  const emojiSize  = size === "modal" ? "5rem"  : "3.5rem";
  const labelSize  = size === "modal" ? "0.8rem" : "0.7rem";

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: gradient }}
    >
      {/* Decorative ring */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width:  size === "modal" ? "96px" : "72px",
          height: size === "modal" ? "96px" : "72px",
          backgroundColor: `${catStyle.text}18`,
          border: `1.5px solid ${catStyle.text}35`,
        }}
      >
        <span
          style={{
            fontSize: emojiSize,
            lineHeight: 1,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
          }}
          role="img"
          aria-label={category || "destination"}
        >
          {emoji}
        </span>
      </div>

      {/* Label */}
      <span
        className="font-semibold uppercase tracking-widest"
        style={{ fontSize: labelSize, color: catStyle.text, opacity: 0.8 }}
      >
        {category || "Destination"}
      </span>
    </div>
  );
}

// ── Image with category fallback ──────────────────────────────────────────────
function DestinationImage({ src, alt, category }) {
  const [error, setError] = useState(false);

  // No src at all, or already errored → show category placeholder immediately
  if (!src || error) {
    return <CategoryFallback category={category} size="card" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-full object-cover transition-transform duration-500
                 group-hover:scale-105"
      loading="lazy"
    />
  );
}

// ── Main DestinationCard ──────────────────────────────────────────────────────
export default function DestinationCard({ destination, index = 0 }) {
  const setActiveDestination  = useStore((s) => s.setActiveDestination);
  const toggleSaveDestination = useStore((s) => s.toggleSaveDestination);
  const isDestinationSaved    = useStore((s) => s.isDestinationSaved);

  const isSaved  = isDestinationSaved(destination.id);
  const catStyle = getCategoryStyle(destination.category);

  const handleSave = () => {
    toggleSaveDestination(destination);
    toast(
      isSaved ? "Removed from saved places" : `Saved ${destination.name}! 🌿`,
      { icon: isSaved ? "🗑️" : "💚" }
    );
  };

  const handleViewDetails = () => setActiveDestination(destination);

  const handleOpenMap = (e) => {
    e.stopPropagation();
    if (destination.mapsUrl) {
      window.open(destination.mapsUrl, "_blank", "noopener,noreferrer");
    } else {
      toast("Map link not available for this destination.", { icon: "🗺️" });
    }
  };

  return (
    <article
      className="gram-card group overflow-hidden flex flex-col animate-fade-up cursor-pointer"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${destination.name}`}
      onKeyDown={(e) => e.key === "Enter" && handleViewDetails()}
    >
      {/* ── Image section ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
        <DestinationImage
          src={destination.image}
          alt={destination.name}
          category={destination.category}
        />

        {/* Gradient overlay for readability — only when image loaded */}
        {destination.image && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(10,18,8,0.55) 0%, transparent 50%)",
            }}
          />
        )}

        {/* Category badge — top-left */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
          >
            {destination.category}
          </span>
        </div>

        {/* Save button — top-right */}
        <div className="absolute top-3 right-3">
          <SaveButton isSaved={isSaved} onToggle={handleSave} />
        </div>

        {/* Best time — bottom-left over image */}
        {destination.bestTime && (
          <div className="absolute bottom-3 left-3">
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(17,26,15,0.7)",
                backdropFilter: "blur(8px)",
                color: "#d4f5d4",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {destination.bestTime}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + Location */}
        <div>
          <h3
            className="font-display font-semibold text-base leading-snug mb-1 line-clamp-1"
            style={{ color: "var(--color-primary)" }}
          >
            {destination.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs line-clamp-1" style={{ color: "var(--color-muted)" }}>
              {destination.location}
            </span>
          </div>
        </div>

        {/* Rating row */}
        {destination.rating && (
          <div className="flex items-center justify-between">
            <StarRating rating={destination.rating} />
            {destination.estimatedBudget && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(181,100,10,0.12)",
                  color: "var(--color-accent-warm)",
                  border: "1px solid rgba(181,100,10,0.2)",
                }}
              >
                {destination.estimatedBudget}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p
          className="text-xs leading-relaxed line-clamp-2 flex-1"
          style={{ color: "var(--color-secondary)" }}
        >
          {destination.description}
        </p>

        {/* Tags */}
        {destination.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {destination.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="gram-tag text-xs py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Highlights strip */}
        {destination.highlights?.length > 0 && (
          <div
            className="flex items-start gap-1.5 pt-2"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round"
              className="shrink-0 mt-0.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-xs leading-relaxed line-clamp-1"
               style={{ color: "var(--color-secondary)" }}>
              {destination.highlights[0]}
            </p>
          </div>
        )}

        {/* Action buttons row */}
        <div
          className="flex items-center gap-2 pt-2"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {/* View Details */}
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
            className="btn-primary flex-1 justify-center text-xs py-2 px-3 rounded-xl"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            View Details
          </button>

          {/* Open Map */}
          <button
            onClick={handleOpenMap}
            aria-label="Open in Google Maps"
            title="Open in Google Maps"
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                       transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-secondary)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>

          {/* Share */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(
                `Check out ${destination.name} on VillageVista! ${destination.mapsUrl || ""}`
              );
              toast("Link copied to clipboard! 🔗");
            }}
            aria-label="Share destination"
            title="Copy share link"
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                       transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-secondary)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}