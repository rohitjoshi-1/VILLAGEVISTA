import React, { useState } from "react";
import useStore from "../store/useStore";
import { useChatQuery } from "../hooks/useChatQuery";

/**
 * CategoryExplorer.jsx — Explore by Travel Category
 */

const CATEGORIES = [
  {
    id: "nature",
    label: "Nature Retreats",
    icon: "🌿",
    description: "Forests, rivers, valleys & pristine wilderness",
    count: "340+ spots",
    query: "best nature retreats and eco destinations in India",
    gradient: "linear-gradient(135deg, #0d2e0d 0%, #1a4a1a 100%)",
    accentColor: "#7ecb7e",
    borderColor: "rgba(126,203,126,0.25)",
  },
  {
    id: "mountains",
    label: "Mountain Escapes",
    icon: "🏔️",
    description: "High-altitude passes, snow peaks & hill stations",
    count: "280+ spots",
    query: "top mountain destinations and hill stations India",
    gradient: "linear-gradient(135deg, #0d1a3a 0%, #1a2a5a 100%)",
    accentColor: "#7aaaeb",
    borderColor: "rgba(122,170,235,0.25)",
  },
  {
    id: "villages",
    label: "Village Stays",
    icon: "🏡",
    description: "Homestays, local life & authentic rural culture",
    count: "520+ spots",
    query: "best village stays and rural homestays in India",
    gradient: "linear-gradient(135deg, #2a1a0a 0%, #4a3010 100%)",
    accentColor: "#d4a050",
    borderColor: "rgba(212,160,80,0.25)",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "🧗",
    description: "Trekking, camping, rafting & adrenaline trails",
    count: "190+ spots",
    query: "adventure trekking camping destinations India",
    gradient: "linear-gradient(135deg, #2a0d0d 0%, #4a1a1a 100%)",
    accentColor: "#e07a5a",
    borderColor: "rgba(224,122,90,0.25)",
  },
  {
    id: "wildlife",
    label: "Wildlife & Safari",
    icon: "🦁",
    description: "National parks, bird sanctuaries & jungle lodges",
    count: "120+ spots",
    query: "wildlife sanctuaries safari national parks India",
    gradient: "linear-gradient(135deg, #1a2a0a 0%, #2a4a10 100%)",
    accentColor: "#a0c050",
    borderColor: "rgba(160,192,80,0.25)",
  },
  {
    id: "cultural",
    label: "Cultural Tourism",
    icon: "🏛️",
    description: "Temples, forts, tribal art & living traditions",
    count: "410+ spots",
    query: "cultural heritage tourism tribal villages India",
    gradient: "linear-gradient(135deg, #2a0a2a 0%, #4a1a4a 100%)",
    accentColor: "#c07ade",
    borderColor: "rgba(192,122,222,0.25)",
  },
  {
    id: "beach",
    label: "Beach & Coastal",
    icon: "🏖️",
    description: "Secluded shores, fishing villages & backwaters",
    count: "160+ spots",
    query: "secluded beaches coastal villages backwaters India",
    gradient: "linear-gradient(135deg, #0a1a2a 0%, #0a3a4a 100%)",
    accentColor: "#50b0d0",
    borderColor: "rgba(80,176,208,0.25)",
  },
  {
    id: "heritage",
    label: "Heritage & Forts",
    icon: "🏰",
    description: "Palaces, ancient towns & UNESCO world heritage",
    count: "230+ spots",
    query: "heritage forts ancient towns UNESCO sites India",
    gradient: "linear-gradient(135deg, #2a1a0a 0%, #3a2a0a 100%)",
    accentColor: "#c0a050",
    borderColor: "rgba(192,160,80,0.25)",
  },
];

function CategoryTile({ cat, onSelect, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(cat.query, cat.label)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl text-left
                 transition-all duration-300 animate-fade-up group"
      style={{
        background: cat.gradient,
        border: `1px solid ${hovered ? cat.borderColor : "rgba(255,255,255,0.06)"}`,
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
        transform: hovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${cat.borderColor}`
          : "var(--shadow-sm)",
        padding: "1.25rem",
      }}
      aria-label={`Explore ${cat.label}`}
    >
      <div
        className="absolute right-2 bottom-2 text-7xl pointer-events-none
                   select-none transition-all duration-400"
        style={{
          opacity: hovered ? 0.22 : 0.12,
          transform: hovered ? "scale(1.2) rotate(10deg)" : "scale(1) rotate(0deg)",
        }}
        aria-hidden="true"
      >
        {cat.icon}
      </div>

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${cat.accentColor}18, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3
                     transition-transform duration-300"
          style={{
            backgroundColor: `${cat.accentColor}20`,
            border: `1px solid ${cat.accentColor}35`,
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {cat.icon}
        </div>

        <h3
          className="font-display font-bold text-sm leading-tight mb-1"
          style={{ color: "#ffffff" }}
        >
          {cat.label}
        </h3>

        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {cat.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${cat.accentColor}20`, color: cat.accentColor }}
          >
            {cat.count}
          </span>

          <div
            className="flex items-center gap-1 text-xs font-medium
                       transition-all duration-200"
            style={{
              color: hovered ? cat.accentColor : "rgba(255,255,255,0.45)",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            Explore
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

function AskAIBanner({ onAsk }) {
  return (
    <div
      className="col-span-full rounded-2xl p-6 flex flex-col sm:flex-row
                 items-center justify-between gap-4 animate-fade-up"
      style={{
        background: "linear-gradient(135deg, rgba(61,110,61,0.15), rgba(181,100,10,0.10))",
        border: "1px solid rgba(61,110,61,0.25)",
        animationDelay: "500ms",
        animationFillMode: "both",
      }}
    >
      <div>
        <p
          className="font-display font-bold text-base mb-1"
          style={{ color: "var(--color-primary)" }}
        >
          Can't find your vibe? ✨
        </p>
        <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
          Describe what you're looking for and our AI will find the perfect
          rural destination for you — from misty waterfalls to desert villages.
        </p>
      </div>
      <button onClick={onAsk} className="btn-primary whitespace-nowrap shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
        Ask AI Assistant
      </button>
    </div>
  );
}

export default function CategoryExplorer() {
  const openChat = useStore((s) => s.openChat);

  const { sendQuery } = useChatQuery();

  const handleSelect = async(query, label) => {
    const userMessage = `Show me the best ${label} destinations in India`;
    openChat();
    await sendQuery(userMessage, { scrollToResults: true });
    console.log(sendQuery)

  };

  return (
    <section
      id="categories"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      aria-label="Explore by category"
    >
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Browse Categories
          </span>
        </div>
        <h2 className="section-heading">Explore by Travel Style</h2>
        <p className="section-subheading">
          Choose a travel mood and let our AI surface the best destinations for it.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {CATEGORIES.map((cat, i) => (
          <CategoryTile key={cat.id} cat={cat} index={i} onSelect={handleSelect} />
        ))}
        <AskAIBanner onAsk={openChat} />
      </div>
    </section>
  );
}