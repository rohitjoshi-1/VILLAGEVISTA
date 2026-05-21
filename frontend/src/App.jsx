import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useStore from "./store/useStore";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ChatAssistant from "./components/ChatAssistant";

/**
 * App.jsx — Root Component (Zustand edition)
 *
 * No Context Provider wrapper needed — Zustand manages state globally.
 *
 * Responsibilities:
 *   - Call applyTheme() on mount to sync persisted isDark value → <html> class
 *   - Render the top-level layout: Navbar → HomePage → ChatAssistant
 *   - Mount react-hot-toast Toaster with design-token-aware styles
 */

export default function App() {
  // Pull only what App itself needs from the store
  const isDark     = useStore((s) => s.isDark);
  const applyTheme = useStore((s) => s.applyTheme);

  // On first mount, sync the persisted isDark value to the <html> class.
  // Without this, a user who prefers light mode would see a dark flash on reload.
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <div className="min-h-screen bg-surface text-primary font-body transition-colors duration-300">
      {/* Sticky navigation bar */}
      <Navbar />

      {/* Page content */}
      <main>
        <HomePage />
      </main>

      {/* Floating AI chat button + sliding panel */}
      <ChatAssistant />

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark ? "#1e2d1a" : "#f0faf0",
            color: isDark ? "#d4f5d4" : "#1a2e1a",
            border: "1px solid #4a7c4a",
            borderRadius: "12px",
            fontFamily: "'Fraunces', serif",
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
}