import React from "react";
import useStore from "../store/useStore";
import DestinationCard from "./DestinationCard";
import DestinationModal from "./DestinationModel";
import { SkeletonGrid } from "./SkeletonLoader";

/**
 * DestinationsSection.jsx — Main Results Grid
 *
 * Sits between the HeroSection and TrendingSection on the page.
 * Reads destination data from the Zustand store and renders
 * the appropriate state:
 *
 *   isSearching  → SkeletonGrid (shimmer placeholders)
 *   destinations.length > 0 → DestinationCard grid
 *   default      → Empty state with AI prompt CTA
 *
 * Also mounts DestinationModal here (it reads activeDestination
 * from the store and self-manages its open/close state).
 *
 * Layout:
 *   Section heading + result count / query label
 *   ↳ SkeletonGrid   (loading)
 *   ↳ Cards grid     (results)
 *   ↳ Empty state    (idle)
 *   DestinationModal (always mounted, hidden when activeDestination is null)
 */

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onAsk }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      {/* Animated globe illustration */}
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center animate-float"
        style={{
          backgroundColor: "rgba(61,110,61,0.08)",
          border: "1.5px dashed var(--color-border)",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-accent)" strokeWidth="1" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10
                   15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {/* Orbit dot */}
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: "var(--color-accent)",
            top: "10px",
            right: "10px",
            animation: "pulseRing 1.8s ease-out infinite",
          }}
        />
      </div>

      <div>
        <h3
          className="font-display font-semibold text-xl mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          Your adventure awaits
        </h3>
        <p
          className="text-sm max-w-sm leading-relaxed"
          style={{ color: "var(--color-secondary)" }}
        >
          Ask the AI assistant about any rural destination, hill station,
          village stay, or eco-retreat — and destination cards will appear here.
        </p>
      </div>

      {/* Sample prompts */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs mb-1" style={{ color: "var(--color-muted)" }}>
          Try asking:
        </p>
        {[
          "Suggest places in Himachal Pradesh",
          "Best village stays near Pune",
          "Hidden gems in Northeast India",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => onAsk(prompt)}
            className="text-sm px-4 py-2 rounded-full transition-all duration-200
                       hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
              color: "var(--color-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent)";
              e.currentTarget.style.color = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            "{prompt}"
          </button>
        ))}
      </div>

      <button
        onClick={() => onAsk("")}
        className="btn-primary mt-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
        Open AI Assistant
      </button>
    </div>
  );
}

// ── Results header ────────────────────────────────────────────────────────────
function ResultsHeader({ query, count }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--color-accent)" }}
        >
          {count} Destination{count !== 1 ? "s" : ""} Found
        </p>
        <h2 className="section-heading">
          Results for{" "}
          <span className="grad-text">"{query}"</span>
        </h2>
      </div>
      <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>
        Powered by Mistral AI + Tavily
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DestinationsSection() {
  const destinations  = useStore((s) => s.destinations);
  const isSearching   = useStore((s) => s.isSearching);
  const currentQuery  = useStore((s) => s.currentQuery);
  const openChat      = useStore((s) => s.openChat);
  const addMessage    = useStore((s) => s.addMessage);
  const setCurrentQuery = useStore((s) => s.setCurrentQuery);

  const hasResults = destinations.length > 0;

  const handleAsk = (prompt) => {
    if (prompt) {
      setCurrentQuery(prompt);
      addMessage("user", prompt);
    }
    openChat();
  };

  return (
    <section
      id="destinations"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[60vh]"
      aria-label="Destination results"
    >
      {/* ── Loading state ─────────────────────────────────────────────── */}
      {isSearching && (
        <div>
          <div className="mb-8">
            <div className="skeleton h-4 w-32 rounded-lg mb-3" />
            <div className="skeleton h-9 w-72 rounded-xl mb-2" />
            <div className="skeleton h-4 w-48 rounded-lg" />
          </div>
          <SkeletonGrid count={6} />
        </div>
      )}

      {/* ── Results state ─────────────────────────────────────────────── */}
      {!isSearching && hasResults && (
        <div>
          <ResultsHeader query={currentQuery} count={destinations.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <DestinationCard key={dest.id} destination={dest} index={i} />
            ))}
          </div>

          {/* Ask for more nudge */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => openChat()}
              className="btn-secondary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Refine or ask something new
            </button>
          </div>
        </div>
      )}

      {/* ── Empty / idle state ────────────────────────────────────────── */}
      {!isSearching && !hasResults && (
        <EmptyState onAsk={handleAsk} />
      )}

      {/* Modal — always mounted, self-manages visibility via store */}
      <DestinationModal />
    </section>
  );
}