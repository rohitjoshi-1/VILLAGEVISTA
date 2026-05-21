import React from "react";

/**
 * SkeletonLoader.jsx — Shimmer Placeholder Cards
 *
 * Shown in the DestinationsSection while the AI + Tavily search is running.
 * Mirrors the exact layout of a DestinationCard so the page doesn't jump
 * when real cards replace the skeletons.
 *
 * Components exported:
 *   SkeletonCard       — single card-shaped shimmer placeholder
 *   SkeletonGrid       — renders N SkeletonCards in a responsive grid
 */
function Shimmer({ className = "", style = {} }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--color-surface-card)",
        border: "1px solid var(--color-border)",
      }}
      aria-label="Loading destination..."
      role="status"
    >
      {/* Image placeholder */}
      <Shimmer style={{ height: "180px", borderRadius: 0 }} />

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Category badge + save button row */}
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-20 rounded-full" />
          <Shimmer className="h-7 w-7 rounded-full" />
        </div>

        {/* Title */}
        <Shimmer className="h-5 w-3/4 rounded-lg" />

        {/* Location */}
        <Shimmer className="h-3.5 w-1/2 rounded-lg" />

        {/* Rating row */}
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-24 rounded-lg" />
          <Shimmer className="h-5 w-20 rounded-full" />
        </div>

        {/* Description lines */}
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3 w-full rounded" />
          <Shimmer className="h-3 w-5/6 rounded" />
        </div>

        {/* Tags row */}
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-5 w-20 rounded-full" />
          <Shimmer className="h-5 w-14 rounded-full" />
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Shimmer className="h-8 flex-1 rounded-xl" />
          <Shimmer className="h-8 w-9 rounded-xl" />
          <Shimmer className="h-8 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Grid of skeleton cards ────────────────────────────────────────────────────
export function SkeletonGrid({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-live="polite"
      aria-label="Loading destinations"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonGrid;