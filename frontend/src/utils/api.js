/**
 * api.js — API Integration Layer
 *
 * Centralises ALL external API communication:
 *   1. Tavily Search API  — real-time web search for destinations
 *   2. Mistral AI API     — conversational AI responses
 *
 * Also contains pure helper functions:
 *   - shouldUseTavily()          → regex classifier for query type
 *   - isLocationVague()          → detects "near me" without a city
 *   - buildDestinationPrompt()   → constructs the Mistral messages array
 *   - buildConversationPrompt()  → for non-destination chat queries
 *   - parseDestinationsFromAI()  → extracts JSON cards from AI response
 *   - handleUserQuery()          → main orchestrator called by ChatAssistant
 *  - getWikimediaImage()         → fetches a real photo for a place, with fallback
 *  - fetchDestinationImages()     → batch-fetches images for multiple destinations
 *  - makeDestinationId()          → generates a unique ID for each destination card
 */

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const TAVILY_API_KEY  = import.meta.env.VITE_TAVILY_API_KEY;

const MISTRAL_BASE_URL = import.meta.env.VITE_MISTRAL_BASE_URL || "https://api.mistral.ai/v1/chat/completions";
const TAVILY_BASE_URL  = import.meta.env.VITE_TAVILY_BASE_URL  || "https://api.tavily.com/search";
const MISTRAL_MODEL    = import.meta.env.VITE_MISTRAL_MODEL    || "mistral-small-latest";

// ─── 1. TAVILY SEARCH ─────────────────────────────────────────────────────────

export async function searchWithTavily(query, maxResults = 6) {
  const response = await fetch(TAVILY_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: `${query} tourist places to visit travel destinations India`,
      search_depth: "advanced",
      include_answer: true,
      include_images: true,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Tavily ${response.status}: ${err.message || "Search failed"}`);
  }

  const data = await response.json();
  return data.results || [];
}

// ─── 2. MISTRAL AI ────────────────────────────────────────────────────────────
export async function askMistral(messages, maxTokens = 1400) {
  const response = await fetch(MISTRAL_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.72,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Mistral ${response.status}: ${err.error?.message || "AI request failed"}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── 3. WIKIMEDIA IMAGE FETCH ─────────────────────────────────────────────────
/**
 * Falls back to a nature-themed Unsplash source URL if Wikimedia has nothing.
 *
 * @param {string} placeName  — e.g. "Cherrapunji"
 * @param {string} location   — e.g. "Meghalaya, India" (appended to search)
 * @param {number} index      — used only for the fallback seed
 * @returns {Promise<string>} — resolved image URL
 */
export async function getWikimediaImage(placeName = "", location = "", index = 0) {
  try {
    const searchTerm = `${placeName} ${location}`.trim();
    // Wikimedia search API — finds the article then grabs its lead image
    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const img =
        data?.thumbnail?.source ||
        data?.originalimage?.source;
      if (img) return img;
    }
  } catch (_) {
    // silently fall through to fallback
  }

  // Fallback: Unsplash source (reliable, nature/travel themed, keyed to place name)
  const keyword = encodeURIComponent(placeName.split(" ")[0] + " india nature travel");
  return `https://source.unsplash.com/800x500/?${keyword}&sig=${index}`;
}

/**
 * Batch-fetch Wikimedia images for all destinations in parallel.
 * Returns an array of URLs in the same order as the destinations array.
 *
 * @param {Array<{name: string, location: string}>} destinations
 * @returns {Promise<string[]>}
 */
export async function fetchDestinationImages(destinations) {
  return Promise.all(
    destinations.map((dest, i) =>
      getWikimediaImage(dest.name, dest.location, i)
    )
  );
}

// ─── 4. QUERY CLASSIFIERS ─────────────────────────────────────────────────────
export function shouldUseTavily(query) {
  const q = query.toLowerCase();
  const patterns = [
    /suggest|recommend|find|show|list|tell me about/,
    /tourist|travel|visit|destination|place|spot|attraction/,
    /stay|hotel|resort|homestay|village|rural|farm/,
    /near|in|around|close to|between|from/,
    /best|top|popular|hidden gem|unexplored|offbeat/,
    /weekend|trip|getaway|escape|tour|itinerary/,
    /nature|mountain|hill|forest|lake|river|beach|waterfall|valley/,
    /adventure|trek|camp|wildlife|safari|heritage|culture/,
  ];
  return patterns.some((p) => p.test(q));
}

export function isLocationVague(query) {
  const q          = query.toLowerCase();
  const vagueMatch = /near me|nearby|around me|close to me|my location|current location/.test(q);
  const hasPlace   = /in\s+[a-z]{3,}|at\s+[a-z]{3,}|around\s+[a-z]{4,}/.test(q);
  return vagueMatch && !hasPlace;
}

// ─── 5. PROMPT BUILDERS ───────────────────────────────────────────────────────
function getSystemPrompt() {
  return `You are VillageVista's expert AI travel guide, specializing in rural tourism,
eco-stays, village experiences, and off-beat destinations across India and South Asia.
You are warm, enthusiastic, and deeply knowledgeable.

When a user asks about destinations or places to visit, ALWAYS respond with:
1. A short friendly intro sentence (1-2 sentences max)
2. A JSON array wrapped in <destinations>...</destinations> tags

Each object in the array must follow this exact schema:
{
  "name": "Place Name",
  "location": "District, State, Country",
  "description": "2-3 engaging sentences about the place and its unique appeal",
  "category": "one of: Nature | Mountain | Village | Adventure | Wildlife | Cultural | Beach | Heritage",
  "bestTime": "e.g. October to March",
  "rating": 4.3,
  "estimatedBudget": "e.g. 1500-3000 per day",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "tags": ["peaceful", "eco-friendly", "family-friendly"],
  "mapQuery": "Full searchable location string for Google Maps",
  "imageKeyword": "Descriptive phrase for image search e.g. Coorg coffee plantation misty hills",
  "nearbyAttractions": ["Attraction 1", "Attraction 2"],
  "localFood": ["Dish 1", "Dish 2"],
  "travelTips": "One concise practical tip for visiting",
  "stayOptions": ["Homestay", "Eco-resort", "Camping"]
}

Rules:
- Always return 3-5 destination objects per query
- Do NOT invent phone numbers or booking URLs
- For general conversation not about destinations, respond naturally without the JSON block
- Keep intro text under 40 words`;
}

export function buildDestinationPrompt(userQuery, tavilyResults, chatHistory) {
  const history = chatHistory
    .slice(-6)
    .filter((m) => m.role === "user" || m.role === "ai")
    .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));

  let webContext = "";
  if (tavilyResults.length > 0) {
    webContext =
      "\n\nReal-time web context:\n" +
      tavilyResults
        .slice(0, 4)
        .map((r, i) => `[${i + 1}] ${r.title}: ${(r.content || "").slice(0, 280)}`)
        .join("\n\n");
  }

  return [
    { role: "system", content: getSystemPrompt() },
    ...history,
    {
      role: "user",
      content: `${userQuery}${webContext}\n\nPlease respond with a friendly intro and the destinations JSON block.`,
    },
  ];
}

export function buildConversationPrompt(userQuery, chatHistory) {
  const history = chatHistory
    .slice(-6)
    .filter((m) => m.role === "user" || m.role === "ai")
    .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));

  return [
    {
      role: "system",
      content: `You are VillageVista's friendly AI travel guide for rural and eco-tourism in India.
Be warm, helpful, and concise (under 120 words).
If the user asks about specific places, suggest they name a region so you can pull up destination cards.`,
    },
    ...history,
    { role: "user", content: userQuery },
  ];
}

// ─── 6. RESPONSE PARSER ───────────────────────────────────────────────────────
export function parseDestinationsFromAI(aiText) {
  const match = aiText.match(/<destinations>([\s\S]*?)<\/destinations>/i);

  if (!match) {
    return { destinations: [], conversationalText: aiText.trim() };
  }

  const conversationalText = aiText
    .replace(/<destinations>[\s\S]*?<\/destinations>/i, "")
    .trim();

  let raw = [];
  try {
    raw = JSON.parse(match[1].trim());
  } catch (err) {
    console.error("[parseDestinations] JSON parse failed:", err);
    return { destinations: [], conversationalText: aiText.trim() };
  }

  if (!Array.isArray(raw)) {
    return { destinations: [], conversationalText };
  }

  const destinations = raw.map((dest) => ({
    ...dest,
    id: makeDestinationId(dest.name, dest.location),
    // image will be set after fetchDestinationImages() resolves
    image: null,
    highlights:        Array.isArray(dest.highlights)        ? dest.highlights        : [],
    tags:              Array.isArray(dest.tags)              ? dest.tags              : [],
    nearbyAttractions: Array.isArray(dest.nearbyAttractions) ? dest.nearbyAttractions : [],
    localFood:         Array.isArray(dest.localFood)         ? dest.localFood         : [],
    stayOptions:       Array.isArray(dest.stayOptions)       ? dest.stayOptions       : [],
    mapsUrl: dest.mapQuery
      ? `https://www.google.com/maps/search/${encodeURIComponent(dest.mapQuery)}`
      : null,
  }));

  return { destinations, conversationalText };
}

// ─── 7. HELPERS ───────────────────────────────────────────────────────────────
function makeDestinationId(name = "", location = "") {
  const slug = `${name}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const hash = slug
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff, 5381)
    .toString(16)
    .slice(0, 4);
  return `${slug}-${hash}`;
}

// ─── 8. MAIN ORCHESTRATOR ────────────────────────────────────────────────────

/**
 * handleUserQuery
 * Single entry-point called by ChatAssistant on every user message.
 *
 * FIX: After parsing destinations, batch-fetches real Wikimedia photos
 * and attaches them before returning, so every card shows an actual
 * photo of the place instead of a random picsum image.
 *
 * FIX: Only calls Tavily + destination parsing when shouldUseTavily()
 * returns true — plain greetings skip all of that.
 *
 * Returns plain data — caller is responsible for writing to Zustand store.
 *
 * @param {string} userQuery
 * @param {Array}  chatHistory  — store's chatMessages array
 * @returns {Promise<{ conversationalText, destinations, needsClarification, isDestinationQuery }>}
 */
export async function handleUserQuery(userQuery, chatHistory = []) {
  if (isLocationVague(userQuery)) {
    return {
      conversationalText:
        "📍 I'd love to help! Could you please share your city or the area you're in? That way I can suggest the best nearby rural destinations and hidden gems for you.",
      destinations: [],
      needsClarification: true,
      isDestinationQuery: false,
    };
  }

  const isDestinationQuery = shouldUseTavily(userQuery);
  let tavilyResults = [];

  if (isDestinationQuery) {
    try {
      tavilyResults = await searchWithTavily(userQuery);
    } catch (err) {
      console.warn("[handleUserQuery] Tavily failed (using AI knowledge):", err.message);
    }
  }

  const messages = isDestinationQuery
    ? buildDestinationPrompt(userQuery, tavilyResults, chatHistory)
    : buildConversationPrompt(userQuery, chatHistory);

  const aiText = await askMistral(messages, isDestinationQuery ? 1800 : 500);

  if (!isDestinationQuery) {
    return {
      conversationalText: aiText,
      destinations: [],
      needsClarification: false,
      isDestinationQuery: false,
    };
  }

  // Parse destinations from AI response (images are null at this point)
  const { destinations: parsedDests, conversationalText } = parseDestinationsFromAI(aiText);

  if (parsedDests.length === 0) {
    return { conversationalText, destinations: [], needsClarification: false, isDestinationQuery: true };
  }

  const tavilyImages = tavilyResults.map((r) => r.image).filter(Boolean);

  const imageUrls = await fetchDestinationImages(parsedDests);

  const destinations = parsedDests.map((dest, idx) => ({
    ...dest,
    // Prefer Tavily image → Wikimedia image → already set null (card handles placeholder)
    image: tavilyImages[idx] || imageUrls[idx] || null,
  }));

  return { conversationalText, destinations, needsClarification: false, isDestinationQuery: true };
}