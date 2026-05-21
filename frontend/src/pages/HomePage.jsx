import React from "react";
import HeroSection from "../components/HeroSection";
import DestinationsSection from "../components/DestinationsSection";
import TrendingSection from "../components/TrendingSection";
import CategoryExplorer from "../components/CategoryExplorer";
import RecentSearches from "../components/RecentSearches";

/**
 * HomePage.jsx — Page Composition
 *
 * Assembles all sections in vertical order.
 * Each section is independently scrollable via anchor id:
 *
 *   #home          → HeroSection
 *   #destinations  → DestinationsSection (AI result cards)
 *   #trending      → TrendingSection
 *   #categories    → CategoryExplorer
 *   #history       → RecentSearches
 *
 * Footer
 */

function SectionDivider() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <hr className="gram-divider" />
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="py-10 px-4 sm:px-6 lg:px-8 text-center"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span className="font-display font-bold text-base">
            <span style={{ color: "var(--color-accent)" }}>Village</span>
            <span style={{ color: "var(--color-primary)" }}>Vista</span>
          </span>
        </div>

        <p className="font-handwrite text-base" style={{ color: "var(--color-muted)" }}>
          Discover Rural India ✦ One Village at a Time
        </p>

        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Powered by{" "}
          <span style={{ color: "var(--color-accent)" }}>Mistral AI</span>
          {" "}+{" "}
          <span style={{ color: "var(--color-accent-warm)" }}>Tavily Search</span>
          {" · "}Built with Love
        </p>

        <p className="text-xs" style={{ color: "var(--color-border)" }}>
          © {new Date().getFullYear()} VillageVista. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider />
      <DestinationsSection />
      <SectionDivider />
      <TrendingSection />
      <SectionDivider />
      <CategoryExplorer />
      <SectionDivider />
      <RecentSearches />
      <Footer />
    </>
  );
}