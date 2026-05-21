import React, { useEffect, useRef, useState } from "react";
import useStore from "../store/useStore";

/**
 * HeroSection.jsx — Landing Hero
 *
 * Layout (two-column on desktop, stacked on mobile):
 *   LEFT:  Eyebrow badge → H1 → Subheading → CTA buttons → Category pills → Stats
 *   RIGHT: Floating destination preview cards with staggered float animation
 *
 * Features:
 *   - Radial gradient mesh background (CSS only, no images)
 *   - Animated ambient orbs with subtle mouse-parallax
 *   - Dot-grid texture overlay for organic depth
 *   - Staggered entrance animations on mount
 *   - Floating destination preview cards (float keyframe)
 *   - Quick-search category pills that open AI chat
 *   - Stats trust bar: destinations, travellers, rating, states
 *   - Scroll-down chevron indicator
 */

const PREVIEW_CARDS = [
  { id: 1, name: "Coorg, Karnataka",    tag: "Coffee Trails",   emoji: "☕", rating: 4.8, color: "#3d6e3d", delay: "0s"   },
  { id: 2, name: "Spiti Valley, HP",    tag: "Mountain Escape", emoji: "🏔️", rating: 4.9, color: "#5a7cbf", delay: "0.6s" },
  { id: 3, name: "Majuli Island, Assam",tag: "River Village",   emoji: "🌊", rating: 4.7, color: "#b5640a", delay: "1.2s" },
];

const STATS = [
  { value: "2,400+", label: "Destinations" },
  { value: "18K+",   label: "Travellers"   },
  { value: "4.9★",   label: "Avg Rating"   },
  { value: "28",     label: "States"       },
];

const CATEGORIES = [
  { label: "🌿 Nature",    query: "best nature retreats in India"        },
  { label: "🏔️ Mountains", query: "top mountain destinations India"      },
  { label: "🏡 Villages",  query: "best village stays rural India"       },
  { label: "🦁 Wildlife",  query: "wildlife sanctuaries to visit India"  },
  { label: "🏛️ Heritage",  query: "heritage villages cultural tourism India" },
];

// ── Ambient orbs (background decoration) ─────────────────────────────────────
function AmbientOrbs({ mousePos }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute rounded-full transition-transform duration-700 ease-out"
        style={{
          width: "600px", height: "600px", top: "-100px", left: "-100px",
          background: "radial-gradient(circle, rgba(61,110,61,0.18) 0%, transparent 70%)",
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
        }}
      />
      <div
        className="absolute rounded-full transition-transform duration-1000 ease-out"
        style={{
          width: "500px", height: "500px", bottom: "-80px", right: "-80px",
          background: "radial-gradient(circle, rgba(181,100,10,0.12) 0%, transparent 65%)",
          transform: `translate(${mousePos.x * -0.015}px, ${mousePos.y * -0.015}px)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "300px", height: "300px", top: "40%", left: "40%",
          background: "radial-gradient(circle, rgba(90,156,90,0.08) 0%, transparent 70%)",
        }}
      />
      {/* dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.4,
        }}
      />
    </div>
  );
}

// ── Floating preview card ─────────────────────────────────────────────────────
function PreviewCard({ card }) {
  return (
    <div
      className="gram-card px-4 py-3 flex items-center gap-3"
      style={{
        minWidth: "210px",
        animation: `fadeUp 0.6s ${card.delay} ease both, floatY 4s ${card.delay} ease-in-out infinite`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${card.color}22` }}
      >
        {card.emoji}
      </div>
      <div className="min-w-0">
        <p className="font-display font-semibold text-sm leading-tight truncate"
           style={{ color: "var(--color-primary)" }}>
          {card.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium" style={{ color: card.color }}>{card.tag}</span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>★ {card.rating}</span>
        </div>
      </div>
      <div className="shrink-0 ml-auto">
        <span className="block w-2 h-2 rounded-full animate-pulse-ring"
              style={{ backgroundColor: "var(--color-accent)" }} />
      </div>
    </div>
  );
}

// ── Scroll indicator ──────────────────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <button
      onClick={() => document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" })}
      aria-label="Scroll to destinations"
      className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
      style={{ color: "var(--color-muted)" }}
    >
      <span className="text-xs font-medium tracking-widest uppercase">Explore</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        style={{ animation: "floatY 1.8s ease-in-out infinite" }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroSection() {
  const openChat        = useStore((s) => s.openChat);
  const addMessage      = useStore((s) => s.addMessage);
  const setCurrentQuery = useStore((s) => s.setCurrentQuery);

  const [visible,  setVisible]  = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Trigger entrance animations shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Mouse parallax on orbs
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e) => {
      const r = el.getBoundingClientRect();
      setMousePos({ x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 });
    };
    el.addEventListener("mousemove", handler, { passive: true });
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  const handleQuickSearch = (query) => {
    setCurrentQuery(query);
    addMessage("user", query);
    openChat();
    setTimeout(() => {
      document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden hero-gradient noise-overlay"
      style={{ paddingTop: "30px" }}
    >
      <AmbientOrbs mousePos={mousePos} />

      {/* Main grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full
                      grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8
                      items-center py-16 lg:py-24">

        {/* ── LEFT: Text content ───────────────────────────────────────── */}
        <div className="flex flex-col items-start">

          {/* Eyebrow badge */}
          <div
            className="flex items-center gap-2 mb-6 animate-fade-up stagger-1"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{
                backgroundColor: "rgba(61,110,61,0.12)",
                border: "1px solid rgba(61,110,61,0.25)",
                color: "var(--color-accent)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: "var(--color-accent)" }} />
              AI-Powered Rural Tourism
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-display font-bold leading-[1.08] tracking-tight mb-5
                       text-4xl sm:text-5xl md:text-6xl xl:text-7xl
                       animate-fade-up stagger-2"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <span style={{ color: "var(--color-primary)" }}>Discover</span>{" "}
            <span className="grad-text">Hidden India</span>
            <br />
            <span style={{ color: "var(--color-primary)" }}>One Village</span>{" "}
            <span
              className="font-handwrite font-normal"
              style={{ color: "var(--color-accent-warm)", fontSize: "0.9em" }}
            >
              at a time.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl animate-fade-up stagger-3"
            style={{ color: "var(--color-secondary)", opacity: visible ? 1 : 0 }}
          >
            Ask our AI travel guide anything — rural homestays, mountain escapes,
            eco-retreats, village experiences. Get real-time destination cards
            with maps, tips, and stay recommendations.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap items-center gap-3 mb-8 animate-fade-up stagger-4"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <button
              onClick={() => document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary text-sm px-6 py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              Explore Destinations
            </button>
            <button
              onClick={openChat}
              className="btn-secondary text-sm px-6 py-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Ask AI Assistant
            </button>
          </div>

          {/* Quick-search pills */}
          <div
            className="flex flex-wrap gap-2 mb-10 animate-fade-up stagger-5"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <span className="text-xs font-medium mr-1 self-center" style={{ color: "var(--color-muted)" }}>
              Quick search:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleQuickSearch(cat.query)}
                className="gram-tag cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-accent)";
                  e.currentTarget.style.color = "var(--color-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.color = "";
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stats trust bar */}
          <div
            className="flex flex-wrap items-center gap-6 animate-fade-up stagger-6"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <div className="text-center">
                  <p className="font-display font-bold text-xl leading-none"
                     style={{ color: "var(--color-accent)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {stat.label}
                  </p>
                </div>
                {i < STATS.length - 1 && (
                  <div className="w-px h-8 hidden sm:block"
                       style={{ backgroundColor: "var(--color-border)" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Floating preview cards ───────────────────────────── */}
        <div
          className="relative flex flex-col items-center justify-center lg:items-end gap-4 lg:pr-4"
          style={{ minHeight: "320px" }}
        >
          {/* Decorative ring circles */}
          <div
            className="absolute rounded-full opacity-20 pointer-events-none"
            style={{
              width: "420px", height: "420px",
              border: "1.5px solid var(--color-accent)",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute rounded-full opacity-10 pointer-events-none"
            style={{
              width: "300px", height: "300px",
              border: "1px solid var(--color-accent-warm)",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Globe icon at center */}
          <div
            className="absolute w-20 h-20 rounded-full flex items-center justify-center opacity-15 pointer-events-none"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-hidden="true"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>

          {/* Preview cards */}
          {visible && PREVIEW_CARDS.map((card, i) => (
            <div
              key={card.id}
              style={{
                alignSelf: i % 2 === 0 ? "flex-start" : "flex-end",
                position: "relative",
                zIndex: 3 - i,
              }}
            >
              <PreviewCard card={card} />
            </div>
          ))}

          {/* "Powered by" badge */}
          {visible && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium animate-fade-up"
              style={{
                animationDelay: "0.9s",
                animationFillMode: "both",
                backgroundColor: "var(--color-surface-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-secondary)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
                style={{ color: "var(--color-accent)" }}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Powered by Mistral AI + Tavily Search
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-10">
        <ScrollIndicator />
      </div>
    </section>
  );
}