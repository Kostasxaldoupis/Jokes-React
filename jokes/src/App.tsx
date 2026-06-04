import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import CategoryPills from "./components/CategoryPills";
import JokeBox from "./components/JokeBox";
import ActionButtons from "./components/ActionButton";
import jokeCache from "./services/jokeCache";
import "./App.css";

type Joke = {
  setup: string;
  punchline: string;
  type: string;
  id: number;
  source: string;
  category?: string;
};

function App() {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("READY.");
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<"teletext" | "terminal">("teletext");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchJoke = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setJoke(null);
    setStatus("FETCHING...");

    // If offline, try to get from cache
    if (!isOnline) {
      setStatus("OFFLINE. LOADING CACHED...");
      const cachedJoke = jokeCache.getRandomCachedJoke(category);

      if (cachedJoke) {
        setTimeout(() => {
          setJoke({
            setup: cachedJoke.setup,
            punchline: cachedJoke.punchline,
            type: cachedJoke.type,
            id: cachedJoke.id,
            source: cachedJoke.source + " (cached)",
            category: cachedJoke.category,
          });
          setCount((c) => c + 1);
          setStatus("FROM CACHE. PRESS REVEAL.");
          setLoading(false);
        }, 300);
        return;
      } else {
        setStatus("OFFLINE. NO CACHED JOKES.");
        setLoading(false);
        return;
      }
    }

    // Online: fetch from API
    const useV2 = category !== "" || Math.random() < 0.5;

    try {
      let setup, punchline, type, id, source, jokeCategory;

      if (useV2) {
        const cat = category || "Any";
        const res = await fetch(
          `https://v2.jokeapi.dev/joke/${cat}?type=twopart&blacklistFlags=nsfw,racist,sexist`,
        );
        const data = await res.json();
        if (data.error) throw new Error(data.message);
        setup = data.setup;
        punchline = data.delivery;
        type = data.category;
        id = data.id;
        source = "jokeapiv2";
        jokeCategory = data.category;

        // Save to cache for offline use
        jokeCache.saveJoke({
          setup,
          punchline,
          type,
          id,
          source,
          category: jokeCategory,
        });
      } else {
        const res = await fetch(
          "https://official-joke-api.appspot.com/random_joke",
        );
        const data = await res.json();
        setup = data.setup;
        punchline = data.punchline;
        type = data.type;
        id = data.id;
        source = "official";
        jokeCategory = "Any";

        jokeCache.saveJoke({
          setup,
          punchline,
          type,
          id,
          source,
          category: "Any",
        });
      }

      setJoke({ setup, punchline, type, id, source, category: jokeCategory });
      setCount((c) => c + 1);
      setStatus("RECEIVED. PRESS REVEAL.");
    } catch {
      setStatus("ERROR. TRY AGAIN.");
      // If API fails but we have cached jokes, try cache as fallback
      const cachedJoke = jokeCache.getRandomCachedJoke(category);
      if (cachedJoke) {
        setStatus("API ERROR. USING CACHED...");
        setJoke({
          setup: cachedJoke.setup,
          punchline: cachedJoke.punchline,
          type: cachedJoke.type,
          id: cachedJoke.id,
          source: cachedJoke.source + " (fallback)",
          category: cachedJoke.category,
        });
        setCount((c) => c + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [category, isOnline]);

  const revealPunchline = useCallback(() => {
    setRevealed((r) => !r);
    setStatus(
      revealed
        ? "HIDDEN."
        : theme === "teletext"
          ? "HA. HA. HA."
          : "PUNCHLINE DECRYPTED.",
    );
  }, [revealed, theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        if (!loading) fetchJoke();
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (joke && !loading) revealPunchline();
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setTheme((prev) => (prev === "teletext" ? "terminal" : "teletext"));
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setStatus("READY.");
        if (!joke) setRevealed(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [fetchJoke, revealPunchline, joke, loading]);

  // Get cache count for display
  const cachedJokesCount = jokeCache.getCachedJokes().length;

  return (
    <div className={`app ${theme}`}>
      <div className="theme-bar">
        <button
          className={`theme-btn ${theme === "teletext" ? "active" : ""}`}
          onClick={() => setTheme("teletext")}
        >
          TELETEXT
        </button>
        <button
          className={`theme-btn ${theme === "terminal" ? "active" : ""}`}
          onClick={() => setTheme("terminal")}
        >
          TERMINAL
        </button>
      </div>

      {/* Status bar with online indicator */}
      <div className="shortcuts-hint">
        <div className="status-indicators">
          <span className={`online-status ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "🟢 ONLINE" : "🔴 OFFLINE"}
          </span>
          <span>📦 {cachedJokesCount} cached</span>
        </div>
        <div className="shortcuts">
          ⌨️ [N] Next | [R] Reveal | [T] Theme | [Esc] Clear
        </div>
      </div>

      <div className="screen">
        <Header theme={theme} count={count} />

        <div className="content">
          {theme === "terminal" && (
            <div className="log-line">
              {loading ? "fetching joke..." : status.toLowerCase()}
            </div>
          )}

          <JokeBox joke={joke} loading={loading} theme={theme} />

          <div className="punch-box">
            <div className="punch-label">► PUNCHLINE</div>
            <div className="punch-text">
              {joke && revealed ? (
                <span style={{ color: "var(--punch-c)" }}>
                  {joke.punchline}
                </span>
              ) : (
                <span className="redacted">
                  ████████████████████████████████
                </span>
              )}
            </div>
          </div>

          {theme === "teletext" && <div className="status-line">{status}</div>}

          <CategoryPills selected={category} onSelect={setCategory} />

          <ActionButtons
            onFetch={fetchJoke}
            onReveal={revealPunchline}
            revealed={revealed}
            hasJoke={!!joke}
            loading={loading}
          />
        </div>

        <Header theme={theme} count={count} footer />
      </div>
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
