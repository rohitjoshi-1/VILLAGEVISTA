import { useCallback } from "react";
import useStore from "../store/useStore";
import { handleUserQuery, shouldUseTavily } from "../utils/api";

/**
 * useChatQuery.js — Shared hook for firing AI destination queries
 */
export function useChatQuery() {
  const addMessage       = useStore((s) => s.addMessage);
  const saveRecentSearch = useStore((s) => s.saveRecentSearch);
  const openChat         = useStore((s) => s.openChat);

  /**
   * sendQuery
   *
   * @param {string} userMessage
   * @param {{ openChatPanel?: boolean, scrollToResults?: boolean }} opts
   * @returns {Promise<object|null>}  the result object from handleUserQuery
   */
  const sendQuery = useCallback(async (userMessage, opts = {}) => {
    const { openChatPanel = false, scrollToResults = false } = opts;

    if (openChatPanel) openChat();
    addMessage("user", userMessage);

    const isDestQuery = shouldUseTavily(userMessage);

    // ── Atomic loading state ON ──────────────────────────────────────────────
    // Single setState call → single React re-render → no flicker
    useStore.setState({
      isAiTyping:  true,
      isSearching: isDestQuery,
    });

    // Optimistic scroll toward results area
    if (scrollToResults && isDestQuery) {
      setTimeout(() => {
        document.getElementById("destinations")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 350);
    }

    try {
      // Always read the freshest snapshot — avoids stale closure bugs
      const currentMessages = useStore.getState().chatMessages;
      const result = await handleUserQuery(userMessage, currentMessages);

      // Push the AI text reply into chat
      addMessage("ai", result.conversationalText);

      if (result.destinations && result.destinations.length > 0) {
        useStore.setState({
          destinations:  result.destinations,
          currentQuery:  userMessage,
          isAiTyping:    false,
          isSearching:   false,
        });

        saveRecentSearch(userMessage, result.destinations);

        // Secondary scroll once cards are rendered
        if (scrollToResults) {
          setTimeout(() => {
            document.getElementById("destinations")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 600);
        }
      } else {
        // No destinations — just clear loading flags
        useStore.setState({ isAiTyping: false, isSearching: false });
      }

      return result;
    } catch (err) {
      console.error("[useChatQuery] sendQuery error:", err);
      addMessage(
        "ai",
        "🌿 Apologies, I couldn't fetch destinations right now. Please check your API keys or try again in a moment."
      );
      useStore.setState({ isAiTyping: false, isSearching: false });
      return null;
    }
  }, [addMessage, openChat, saveRecentSearch]);

  return { sendQuery };
}