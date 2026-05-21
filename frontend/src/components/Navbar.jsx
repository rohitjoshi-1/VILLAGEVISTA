import React, { useState, useEffect, useCallback } from "react";
import useStore from "../store/useStore";

/**
 * Navbar.jsx — Sticky Responsive Navigation Bar
 *
 * Desktop layout:
 *   [Logo] ←————→ [Nav Links] ←————→ [Theme Toggle] [Ask AI — CTA]
 *
 * Mobile layout:
 *   [Logo] ←————→ [Hamburger]
 *   Hamburger → full-screen animated overlay with links + theme toggle
 *
 * Features:
 *   - Transparent at top → frosted-glass backdrop after 20px scroll
 *   - Active link tracking via IntersectionObserver
 *   - Hamburger icon morphs into × when open
 *   - Overlay closes on Escape key, outside click, or link click
 *   - Body scroll locked while mobile menu is open
 *   - All animations via CSS classes defined in index.css
 */

// ─── Nav link definitions ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",         href: "#home" },
  { label: "Destinations", href: "#destinations" },
  { label: "Trending",     href: "#trending" },
  { label: "Categories",   href: "#categories" },
  { label: "History",      href: "#history" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
/** Animated sun / moon toggle button */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:ring-2"
      style={{
        background: isDark
          ? "rgba(106,184,106,0.12)"
          : "rgba(61,110,61,0.10)",
        border: "1.5px solid var(--color-border)",
      }}
    >
      {/* Sun icon — visible in dark mode */}
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
        }}
      >
        <SunIcon />
      </span>

      {/* Moon icon — visible in light mode */}
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        <MoonIcon />
      </span>
    </button>
  );
}

/** Three-bar → X animated hamburger */
function HamburgerButton({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.25 rounded-xl md:hidden focus-visible:ring-2 transition-colors duration-200"
      style={{ border: "1.5px solid var(--color-border)" }}
    >
      {/* Three bars that animate into an X */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full transition-all duration-300 origin-center"
          style={{
            width: i === 1 ? "14px" : "20px",
            height: "2px",
            backgroundColor: "var(--color-primary)",
            opacity: isOpen && i === 1 ? 0 : 1,
            transform: isOpen
              ? i === 0
                ? "translateY(7px) rotate(45deg)"
                : i === 2
                ? "translateY(-7px) rotate(-45deg)"
                : "scaleX(0)"
              : "none",
          }}
        />
      ))}
    </button>
  );
}

/** A single nav link — desktop version */
function NavLink({ href, label, isActive, onClick }) {
  return (
    <a
      href={href}
      onClick={(e) => onClick(e, href)}
      className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
      style={{
        color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--color-primary)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--color-secondary)";
      }}
    >
      {/* Active pill background */}
      {isActive && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--color-accent)", opacity: 0.1 }}
        />
      )}
      {label}

      {/* Active dot indicator */}
      {isActive && (
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      )}
    </a>
  );
}

/** A single nav link — mobile overlay version */
function MobileNavLink({ href, label, isActive, onClick, delay }) {
  return (
    <a
      href={href}
      onClick={(e) => onClick(e, href)}
      className="flex items-center justify-between w-full px-6 py-4 rounded-2xl font-display text-2xl font-semibold transition-all duration-200 animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        color: isActive ? "var(--color-accent)" : "var(--color-primary)",
        backgroundColor: isActive
          ? "rgba(106,184,106,0.08)"
          : "transparent",
      }}
    >
      <span>{label}</span>
      {isActive && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      )}
    </a>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="var(--color-accent-warm)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="var(--color-accent)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const isDark     = useStore((s) => s.isDark);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const openChat   = useStore((s) => s.openChat);

  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeLink, setActiveLink] = useState("#home");

  // ── Scroll: backdrop opacity + active section tracking ────────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Walk sections bottom-up and find the first one above the viewport midpoint
      const ids = NAV_LINKS.map((l) => l.href.slice(1));
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveLink(`#${ids[i]}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Escape key closes mobile menu ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Lock body scroll when mobile menu is open ─────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // ── Smooth scroll handler shared by desktop + mobile links ───────────────
  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      {/* NAVBAR BAR */}
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          paddingTop:    scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
          backgroundColor: scrolled
            ? isDark
              ? "rgba(17,26,15,0.90)"
              : "rgba(245,242,235,0.90)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom:   scrolled ? "1px solid var(--color-border)" : "none",
          boxShadow:      scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* ── Logo ────────────────────────────────────────────────────── */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            aria-label="VillageVista — Back to top"
            className="flex items-center gap-2.5 group shrink-0"
          >
            {/* Icon mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         transition-transform duration-300 group-hover:rotate-12
                         group-hover:scale-110"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <LeafIcon />
            </div>

            {/* Word mark */}
            <span className="font-display text-xl font-bold tracking-tight leading-none select-none">
              <span style={{ color: "var(--color-accent)" }}>Village</span>
              <span style={{ color: "var(--color-primary)" }}>Vista</span>
            </span>
          </a>

          {/* ── Desktop Nav Links (hidden on mobile) ─────────────────────── */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={activeLink === link.href}
                onClick={handleNavClick}
              />
            ))}
          </nav>

          {/* ── Desktop Right Actions ────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

            {/* CTA button — opens AI chat */}
            <button
              onClick={openChat}
              className="btn-primary gap-1.5"
              aria-label="Open AI travel assistant"
            >
              <SparkleIcon />
              Ask AI
            </button>
          </div>

          {/* ── Mobile: theme toggle + hamburger ────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <HamburgerButton isOpen={menuOpen} onToggle={() => setMenuOpen((p) => !p)} />
          </div>
        </div>
      </header>

      {/* Dark backdrop — clicking it closes the menu */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--color-overlay)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          backdropFilter: menuOpen ? "blur(4px)" : "none",
        }}
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm md:hidden flex flex-col
                   transition-transform duration-400 ease-in-out"
        style={{
          backgroundColor: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: menuOpen ? "-8px 0 32px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {/* Logo repeat */}
          <span className="font-display text-xl font-bold">
            <span style={{ color: "var(--color-accent)" }}>Gram</span>
            <span style={{ color: "var(--color-primary)" }}>Stay</span>
          </span>

          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            className="w-9 h-9 rounded-full flex items-center justify-center
                       transition-colors duration-200"
            style={{ border: "1.5px solid var(--color-border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2.5"
              strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links list */}
        <nav
          aria-label="Mobile navigation"
          className="flex-1 flex flex-col justify-center px-4 gap-1"
        >
          {menuOpen &&
            NAV_LINKS.map((link, i) => (
              <MobileNavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={activeLink === link.href}
                onClick={handleNavClick}
                delay={i * 55}
              />
            ))}
        </nav>

        {/* Panel footer — AI CTA */}
        <div
          className="px-6 py-6"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {menuOpen && (
            <button
              onClick={() => { setMenuOpen(false); openChat(); }}
              className="btn-primary w-full justify-center text-base animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <SparkleIcon />
              Ask AI Assistant
            </button>
          )}

          {/* Tagline */}
          <p
            className="text-center text-xs mt-4 font-handwrite"
            style={{ color: "var(--color-muted)" }}
          >
            Discover Rural India ✦ One Village at a Time
          </p>
        </div>
      </div>
    </>
  );
}