import React from "react";
import useStore from "../store/useStore";

/**
 * RecentSearches.jsx — Recent Inquiries Section
 *
 * Reads the last 3 searches from the Zustand store (persisted in localStorage).
 * Each card shows the query, timestamp, destination count, and a preview
 * of the first 2 destination names.
 *
 * Clicking a card calls loadRecentSearch() which:
 *   1. Rehydrates destination cards in the main grid
 *   2. Injects context messages into the AI chat history
 *
 * Layout:
 *   Section heading
 *   ↳ Horizontal scroll row of history cards (3 max)
 *       Each card: clock icon | query | date | destination previews | reload button
 *
 * Hidden entirely when recentSearches is empty.
 */

// ── Relative time formatter ───────────────────────────────────────────────────
function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)   return "Just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

// ── Single history card ───────────────────────────────────────────────────────
function HistoryCard({ entry, onLoad }) {
  const destCount   = entry.destinations?.length || 0;
  const previewNames = entry.destinations
    ?.slice(0, 2)
    .map((d) => d.name)
    .filter(Boolean) || [];

  return (
    <button
      onClick={() => onLoad(entry)}
      className="gram-card flex flex-col gap-3 p-4 text-left
                 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                 min-w-60 max-w-70 shrink-0 w-full sm:w-auto"
      aria-label={`Reload search: ${entry.query}`}
    >
      {/* Top row: clock icon + timestamp */}
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(61,110,61,0.12)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          {timeAgo(entry.timestamp)}
        </span>
      </div>

      {/* Query text */}
      <p
        className="font-display font-semibold text-sm leading-snug line-clamp-2"
        style={{ color: "var(--color-primary)" }}
      >
        "{entry.query}"
      </p>

      {/* Destination preview names */}
      {previewNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {previewNames.map((name) => (
            <span
              key={name}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                color: "var(--color-secondary)",
              }}
            >
              {name}
            </span>
          ))}
          {destCount > 2 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(61,110,61,0.1)",
                color: "var(--color-accent)",
              }}
            >
              +{destCount - 2} more
            </span>
          )}
        </div>
      )}

      {/* Footer: count + reload hint */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          {destCount} destination{destCount !== 1 ? "s" : ""} found
        </span>
        <div className="flex items-center gap-1 text-xs font-medium"
             style={{ color: "var(--color-accent)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
          </svg>
          Reload
        </div>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RecentSearches() {
  const recentSearches  = useStore((s) => s.recentSearches);
  const loadRecentSearch = useStore((s) => s.loadRecentSearch);
  const openChat        = useStore((s) => s.openChat);

  // Don't render section if there's no history
  if (!recentSearches || recentSearches.length === 0) return null;

  return (
    <section
      id="history"
      className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      aria-label="Recent searches"
    >
      {/* Section heading */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-accent)" }}
            >
              Recent Inquiries
            </span>
          </div>
          <h2 className="section-heading">Your Search History</h2>
          <p className="section-subheading">
            Pick up where you left off — your last {recentSearches.length} search
            {recentSearches.length !== 1 ? "es are" : " is"} saved locally.
          </p>
        </div>

        {/* New search CTA */}
        <button
          onClick={openChat}
          className="btn-secondary text-sm hidden sm:inline-flex shrink-0 mb-8"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          New Search
        </button>
      </div>

      {/* Cards row — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex flex-col sm:flex-row gap-4 sm:overflow-x-auto pb-2
                      sm:scrollbar-thin">
        {recentSearches.map((entry, i) => (
          <div
            key={entry.timestamp}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <HistoryCard
              entry={entry}
              onLoad={loadRecentSearch}
            />
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <p
        className="mt-4 text-xs text-center"
        style={{ color: "var(--color-muted)" }}
      >
        🔒 Searches are stored only in your browser —
      </p>
    </section>
  );
}