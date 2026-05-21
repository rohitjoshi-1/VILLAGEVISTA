import React, { useState } from "react";
import useStore from "../store/useStore";
import { useChatQuery } from "../hooks/useChatQuery";

/**
 * TrendingSection.jsx — Trending & Seasonal Destinations
 */

const TRENDING = [
  // Monsoon
  {
    id: "t1", season: "Monsoon",
    name: "Cherrapunji", state: "Meghalaya",
    tagline: "World's wettest place — lush valleys & living root bridges",
    emoji: "🌧️",
    gradient: "linear-gradient(135deg, #1a3a2a, #2a5a3a)",
    query: "tourist places in Cherrapunji Meghalaya",
    badge: "🔥 Trending",
  },
  {
    id: "t2", season: "Monsoon",
    name: "Coorg", state: "Karnataka",
    tagline: "Coffee hills draped in mist & waterfalls",
    emoji: "☕",
    gradient: "linear-gradient(135deg, #2a1a0a, #4a3010)",
    query: "places to visit in Coorg Karnataka",
    badge: "⭐ Top Rated",
  },
  {
    id: "t3", season: "Monsoon",
    name: "Lonavala", state: "Maharashtra",
    tagline: "Misty ghats and monsoon-fed lakes near Mumbai",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #0a1a3a, #1a3a5a)",
    query: "tourist destinations Lonavala Maharashtra",
    badge: "🌿 Eco Pick",
  },
  // Winter
  {
    id: "t4", season: "Winter",
    name: "Spiti Valley", state: "Himachal Pradesh",
    tagline: "Snow-draped monasteries & sub-zero stargazing",
    emoji: "❄️",
    gradient: "linear-gradient(135deg, #0a1a2a, #1a2a4a)",
    query: "Spiti Valley winter travel guide",
    badge: "🏔️ Adventure",
  },
  {
    id: "t5", season: "Winter",
    name: "Rann of Kutch", state: "Gujarat",
    tagline: "Endless white salt desert under full moon",
    emoji: "🌕",
    gradient: "linear-gradient(135deg, #2a2a1a, #4a4a2a)",
    query: "Rann of Kutch festival travel places",
    badge: "🔥 Trending",
  },
  {
    id: "t6", season: "Winter",
    name: "Majuli Island", state: "Assam",
    tagline: "World's largest river island & Vaishnavite culture",
    emoji: "🛶",
    gradient: "linear-gradient(135deg, #1a2a1a, #2a4a2a)",
    query: "Majuli Island Assam places to visit",
    badge: "💎 Hidden Gem",
  },
  // Summer
  {
    id: "t7", season: "Summer",
    name: "Zanskar Valley", state: "Ladakh",
    tagline: "Remote Himalayan gorges only open in summer",
    emoji: "⛰️",
    gradient: "linear-gradient(135deg, #1a1a3a, #2a2a5a)",
    query: "Zanskar Valley Ladakh summer trip",
    badge: "🏔️ Adventure",
  },
  {
    id: "t8", season: "Summer",
    name: "Chopta", state: "Uttarakhand",
    tagline: "Mini Switzerland of India — alpine meadows & Tungnath",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #1a3a1a, #2a5a2a)",
    query: "Chopta Uttarakhand summer destinations",
    badge: "⭐ Top Rated",
  },
  {
    id: "t9", season: "Summer",
    name: "Tawang", state: "Arunachal Pradesh",
    tagline: "Cloud-kissed monastery town at 10,000 ft",
    emoji: "🏯",
    gradient: "linear-gradient(135deg, #2a1a0a, #3a2a1a)",
    query: "Tawang Arunachal Pradesh travel guide",
    badge: "💎 Hidden Gem",
  },
];

const SEASONS = ["All", "Monsoon", "Winter", "Summer"];

const BADGE_STYLES = {
  "🔥 Trending":   { bg: "rgba(220,60,20,0.18)",  color: "#f07050" },
  "⭐ Top Rated":  { bg: "rgba(200,160,20,0.18)", color: "#d4a840" },
  "🌿 Eco Pick":   { bg: "rgba(61,110,61,0.18)",  color: "#7ecb7e" },
  "🏔️ Adventure":  { bg: "rgba(60,90,180,0.18)",  color: "#7aaaeb" },
  "💎 Hidden Gem": { bg: "rgba(160,80,200,0.18)", color: "#c07ade" },
};

function SeasonTab({ label, active, onClick }) {
  const SEASON_EMOJIS = { All: "🌍", Monsoon: "🌧️", Winter: "❄️", Summer: "☀️" };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                 transition-all duration-200 whitespace-nowrap"
      style={{
        backgroundColor: active ? "var(--color-accent)" : "var(--color-surface-alt)",
        color:            active ? "#fff" : "var(--color-secondary)",
        border:           active ? "none" : "1px solid var(--color-border)",
        transform:        active ? "scale(1.04)" : "scale(1)",
      }}
    >
      {SEASON_EMOJIS[label]} {label}
    </button>
  );
}

function TrendingCard({ item, onSearch, index }) {
  const [hovered, setHovered] = useState(false);
  const badgeStyle = BADGE_STYLES[item.badge] || BADGE_STYLES["🔥 Trending"];

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer
                 transition-all duration-300 animate-fade-up group"
      style={{
        background: item.gradient,
        animationDelay: `${index * 70}ms`,
        animationFillMode: "both",
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSearch(item.query)}
      role="button"
      tabIndex={0}
      aria-label={`Explore ${item.name}`}
      onKeyDown={(e) => e.key === "Enter" && onSearch(item.query)}
    >
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl
                   pointer-events-none select-none transition-transform duration-300"
        style={{
          opacity: 0.18,
          transform: `translateY(-50%) ${hovered ? "scale(1.15) rotate(8deg)" : "scale(1) rotate(0deg)"}`,
        }}
        aria-hidden="true"
      >
        {item.emoji}
      </div>

      <div className="relative z-10 p-5">
        <div className="mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
          >
            {item.badge}
          </span>
        </div>
        <h3
          className="font-display font-bold text-base leading-tight mb-1"
          style={{ color: "#ffffff" }}
        >
          {item.name}
        </h3>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
          {item.state}
        </p>
        <p
          className="text-xs leading-relaxed mb-4 line-clamp-2"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {item.tagline}
        </p>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold
                     transition-all duration-200"
          style={{
            color: hovered ? "#ffffff" : "rgba(255,255,255,0.7)",
            transform: hovered ? "translateX(3px)" : "translateX(0)",
          }}
        >
          Explore with AI
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function TrendingSection() {
  const openChat = useStore((s) => s.openChat);

  const { sendQuery } = useChatQuery();

  const [activeSeason, setActiveSeason] = useState("All");

  const filtered = activeSeason === "All"
    ? TRENDING
    : TRENDING.filter((t) => t.season === activeSeason);

  const handleSearch = (query) => {
    openChat();
    sendQuery(query, { scrollToResults: true });
  };

  return (
    <section
      id="trending"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      aria-label="Trending destinations"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent-warm)" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent-warm)" }}
          >
            Trending Now
          </span>
        </div>
        <h2 className="section-heading">Popular Destinations</h2>
        <p className="section-subheading">
          Hand-picked rural escapes loved by travellers this season.
          Click any to get AI-powered travel details.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {SEASONS.map((s) => (
          <SeasonTab key={s} label={s} active={activeSeason === s} onClick={() => setActiveSeason(s)} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <TrendingCard key={item.id} item={item} index={i} onSearch={handleSearch} />
        ))}
      </div>
    </section>
  );
}