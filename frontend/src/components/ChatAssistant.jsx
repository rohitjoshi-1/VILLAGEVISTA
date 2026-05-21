import React, { useState, useRef, useEffect, useCallback } from "react";
import useStore from "../store/useStore";
import { useChatQuery } from "../hooks/useChatQuery";

/**
 * ChatAssistant.jsx — Floating AI Chat Button + Sliding Panel
 */

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  return text.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={pi}>{part.slice(1, -1)}</em>;
      return part;
    });
    return (
      <React.Fragment key={li}>
        {parts}
        {li < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: "var(--color-accent)", opacity: 0.9 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
        style={{ backgroundColor: "var(--color-surface-alt)" }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// ── AI message bubble ─────────────────────────────────────────────────────────
function AiMessage({ content, isLatest }) {
  return (
    <div className={`flex items-start gap-2.5 mb-4 ${isLatest ? "animate-fade-up" : ""}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <div
        className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
        style={{
          backgroundColor: "var(--color-surface-alt)",
          color: "var(--color-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        {renderMarkdown(content)}
      </div>
    </div>
  );
}

// ── User message bubble ───────────────────────────────────────────────────────
function UserMessage({ content, isLatest }) {
  return (
    <div className={`flex items-start justify-end gap-2.5 mb-4 ${isLatest ? "animate-fade-up" : ""}`}>
      <div
        className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
        style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
      >
        {content}
      </div>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
        style={{
          backgroundColor: "var(--color-surface-alt)",
          border: "1.5px solid var(--color-border)",
          color: "var(--color-secondary)",
        }}
      >
        U
      </div>
    </div>
  );
}

// ── Destination result notice ─────────────────────────────────────────────────
function DestinationNotice({ count, onView }) {
  return (
    <div
      className="mx-auto mb-4 px-4 py-3 rounded-2xl text-sm text-center animate-fade-up
                 flex flex-col items-center gap-2"
      style={{
        backgroundColor: "rgba(61,110,61,0.1)",
        border: "1px solid rgba(61,110,61,0.25)",
        color: "var(--color-accent)",
      }}
    >
      <span>
        ✨ Found <strong>{count}</strong> destination{count !== 1 ? "s" : ""} for you!
      </span>
      <button
        onClick={onView}
        className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        View destination cards ↓
      </button>
    </div>
  );
}

// ── Chat input bar ────────────────────────────────────────────────────────────
function InputBar({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  const handleChange = (e) => { setText(e.target.value); resize(); };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div
      className="p-3 flex items-end gap-2"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about any destination…"
        disabled={disabled}
        rows={1}
        aria-label="Chat input"
        className="gram-input resize-none flex-1 py-2.5 text-sm leading-snug
                   transition-all duration-200"
        style={{ minHeight: "42px", maxHeight: "120px", opacity: disabled ? 0.6 : 1 }}
      />
      <button
        onClick={submit}
        disabled={!text.trim() || disabled}
        aria-label="Send message"
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                   transition-all duration-200 hover:scale-105 active:scale-95
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
        style={{
          backgroundColor: text.trim() && !disabled
            ? "var(--color-accent)"
            : "var(--color-surface-alt)",
          border: "1.5px solid var(--color-border)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={text.trim() && !disabled ? "#fff" : "var(--color-muted)"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}

// ── Panel header ──────────────────────────────────────────────────────────────
function PanelHeader({ onClose, onClear }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 shrink-0"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-sm leading-none"
             style={{ color: "var(--color-primary)" }}>
            VillageVista AI
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-accent)" }}>
            ● Online
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          aria-label="Clear chat"
          title="Clear conversation"
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--color-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--color-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  "Suggest places in Uttarakhand",
  "Best monsoon destinations",
  "Village stays near Delhi",
  "Hidden gems in Kerala",
  "Budget trips in Rajasthan",
];

function SuggestionChips({ onSelect }) {
  return (
    <div className="px-3 pb-3 flex flex-wrap gap-2">
      {SUGGESTION_CHIPS.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-200
                     hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
            color: "var(--color-secondary)",
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ── Floating button ───────────────────────────────────────────────────────────
function FloatingButton({ onClick, chatOpen, hasUnread }) {
  return (
    <button
      onClick={onClick}
      aria-label={chatOpen ? "Close AI assistant" : "Open AI assistant"}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
                 flex items-center justify-center transition-all duration-300
                 hover:scale-110 active:scale-95"
      style={{
        backgroundColor: "var(--color-accent)",
        boxShadow: "0 4px 20px rgba(61,110,61,0.45)",
        animation: !chatOpen ? "pulseRing 2s ease-out infinite" : "none",
      }}
    >
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: chatOpen ? 0 : 1,
          transform: chatOpen ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      </span>
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: chatOpen ? 1 : 0,
          transform: chatOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
      {hasUnread && !chatOpen && (
        <span
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 animate-pulse"
          style={{
            backgroundColor: "var(--color-accent-warm)",
            borderColor: "var(--color-surface)",
          }}
        />
      )}
    </button>
  );
}

// ── Main ChatAssistant ────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const chatOpen     = useStore((s) => s.chatOpen);
  const toggleChat   = useStore((s) => s.toggleChat);
  const closeChat    = useStore((s) => s.closeChat);
  const chatMessages = useStore((s) => s.chatMessages);
  const isAiTyping   = useStore((s) => s.isAiTyping);
  const clearChat    = useStore((s) => s.clearChat);

  // FIX: All API orchestration is now in the shared hook.
  const { sendQuery } = useChatQuery();

  const [lastResultCount, setLastResultCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.role === "ai" && !chatOpen) setHasUnread(true);
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    if (chatOpen) setHasUnread(false);
  }, [chatOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && chatOpen) closeChat(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatOpen, closeChat]);

  // ── Main send handler ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    // Reset result notice for the new query immediately
    setLastResultCount(0);

    const result = await sendQuery(text, { scrollToResults: true });

    if (result?.destinations?.length > 0) {
      setLastResultCount(result.destinations.length);
    }
  }, [sendQuery]);

  const handleSuggestionClick = (chip) => handleSend(chip);

  const handleViewDestinations = () => {
    closeChat();
    setTimeout(() => {
      document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const showSuggestions = chatMessages.length === 1;

  return (
    <>
      <FloatingButton onClick={toggleChat} chatOpen={chatOpen} hasUnread={hasUnread} />

      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={closeChat}
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: chatOpen ? 1 : 0,
          pointerEvents: chatOpen ? "auto" : "none",
        }}
      />

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="VillageVista AI travel assistant"
        className="fixed z-50 flex flex-col glass-panel transition-all duration-400"
        style={{
          bottom: "88px",
          right: "24px",
          width: "min(420px, calc(100vw - 48px))",
          height: "min(600px, calc(100vh - 120px))",
          opacity: chatOpen ? 1 : 0,
          transform: chatOpen
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.97)",
          pointerEvents: chatOpen ? "auto" : "none",
          transformOrigin: "bottom right",
        }}
      >
        <PanelHeader onClose={closeChat} onClear={clearChat} />

        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ overscrollBehavior: "contain" }}
          aria-live="polite"
          aria-label="Chat messages"
        >
          {chatMessages.map((msg, i) => {
            const isLatest = i === chatMessages.length - 1;
            return msg.role === "ai" ? (
              <AiMessage key={`${msg.timestamp}-${i}`} content={msg.content} isLatest={isLatest} />
            ) : (
              <UserMessage key={`${msg.timestamp}-${i}`} content={msg.content} isLatest={isLatest} />
            );
          })}

          {isAiTyping && <TypingIndicator />}

          {lastResultCount > 0 && !isAiTyping && (
            <DestinationNotice count={lastResultCount} onView={handleViewDestinations} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {showSuggestions && <SuggestionChips onSelect={handleSuggestionClick} />}

        <InputBar onSend={handleSend} disabled={isAiTyping} />
      </div>
    </>
  );
}