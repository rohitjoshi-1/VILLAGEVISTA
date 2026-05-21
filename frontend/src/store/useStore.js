import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * useStore.js — Global Zustand Store
 *
 * Zustand replaces React Context entirely. No providers needed —
 * any component just imports and calls useStore() directly.
 *
 * The store is split into logical slices:
 *   1. Theme slice         → isDark, toggleTheme
 *   2. Chat slice          → chatOpen, messages, typing state, actions
 *   3. Destination slice   → results, loading, active modal, current query
 *   4. Persistence slice   → recentSearches, savedDestinations (via persist middleware)
 *
 * The `persist` middleware from Zustand automatically syncs the
 * designated parts of state to localStorage, replacing useLocalStorage.
 */

// ─── Max limits ───────────────────────────────────────────────────────────────
const MAX_RECENT_SEARCHES = 3;

// ─── Welcome message (seeded into chat on init) ───────────────────────────────
const WELCOME_MESSAGE = {
  role: "ai",
  content:
    "Namaste! 🌿 I'm your VillageVista AI travel guide. Ask me about rural destinations, village stays, nature retreats, or any travel inspiration — I'll find the best spots for you!",
  timestamp: Date.now(),
};

// ─── Store definition ─────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      // 1. THEME SLICE

      isDark: true,

      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark;
          // Apply/remove "dark" class on <html> immediately
          document.documentElement.classList.toggle("dark", next);
          return { isDark: next };
        }),

      // Called once on app mount to sync <html> class with persisted value
      applyTheme: () => {
        const { isDark } = get();
        document.documentElement.classList.toggle("dark", isDark);
      },

      // 2. CHAT SLICE
      chatOpen: false,
      chatMessages: [WELCOME_MESSAGE],
      isAiTyping: false,

      openChat: () => set({ chatOpen: true }),
      closeChat: () => set({ chatOpen: false }),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),

      /**
       * Append a new message bubble to the conversation.
       * @param {"user"|"ai"} role
       * @param {string} content
       */
      addMessage: (role, content) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { role, content, timestamp: Date.now() },
          ],
        })),

      /**
       * Update the last AI message in-place (used for streaming/replace pattern).
       * @param {string} content
       */
      updateLastAiMessage: (content) =>
        set((s) => {
          const msgs = [...s.chatMessages];
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === "ai") {
              msgs[i] = { ...msgs[i], content };
              break;
            }
          }
          return { chatMessages: msgs };
        }),

      setIsAiTyping: (val) => set({ isAiTyping: val }),

      /**
       * Reset chat to the initial welcome message and clear destination results.
       */
      clearChat: () =>
        set({
          chatMessages: [{ ...WELCOME_MESSAGE, timestamp: Date.now() }],
          destinations: [],
          currentQuery: "",
        }),

      // 3. DESTINATION SLICE
      destinations: [],
      isSearching: false,
      activeDestination: null, // destination object whose detail modal is open
      currentQuery: "",

      setDestinations: (destinations) => set({ destinations }),
      setIsSearching: (val) => set({ isSearching: val }),
      setActiveDestination: (dest) => set({ activeDestination: dest }),
      setCurrentQuery: (q) => set({ currentQuery: q }),

      // 4. PERSISTENCE SLICE  (synced to localStorage)
      recentSearches: [],    // [{ query, destinations, timestamp }]
      savedDestinations: [], // [destination object, ...]

      /**
       * Save a completed search to history (max 3, newest first).
       * Duplicate queries are moved to the front instead of duplicated.
       * @param {string} query
       * @param {Array}  results  — destination objects
       */
      saveRecentSearch: (query, results) =>
        set((s) => {
          const filtered = s.recentSearches.filter(
            (r) => r.query.toLowerCase() !== query.toLowerCase()
          );
          return {
            recentSearches: [
              { query, destinations: results, timestamp: Date.now() },
              ...filtered,
            ].slice(0, MAX_RECENT_SEARCHES),
          };
        }),

      /**
       * Reload a past search result into the destinations panel
       * and inject context messages into the chat.
       * @param {{ query: string, destinations: Array }} searchEntry
       */
      loadRecentSearch: (searchEntry) =>
        set((s) => ({
          currentQuery: searchEntry.query,
          destinations: searchEntry.destinations,
          chatMessages: [
            ...s.chatMessages,
            {
              role: "user",
              content: searchEntry.query,
              timestamp: Date.now(),
            },
            {
              role: "ai",
              content: `Here are the results I found earlier for **"${searchEntry.query}"**. Let me know if you'd like fresh results or want to explore a different area! 🗺️`,
              timestamp: Date.now() + 1,
            },
          ],
        })),

      /**
       * Toggle save/unsave a destination by its id.
       * @param {Object} destination
       */
      toggleSaveDestination: (destination) =>
        set((s) => {
          const exists = s.savedDestinations.find(
            (d) => d.id === destination.id
          );
          return {
            savedDestinations: exists
              ? s.savedDestinations.filter((d) => d.id !== destination.id)
              : [...s.savedDestinations, destination],
          };
        }),

      /**
       * Check whether a destination is currently saved.
       * @param {string} id
       * @returns {boolean}
       */
      isDestinationSaved: (id) =>
        get().savedDestinations.some((d) => d.id === id),
    }),

    // ── Persist config ────────────────────────────────────────────────────────
    {
      name: "villagevista_store", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist these keys — volatile UI state is excluded
      partialize: (state) => ({
        isDark: state.isDark,
        recentSearches: state.recentSearches,
        savedDestinations: state.savedDestinations,
      }),
    }
  )
);

export default useStore;