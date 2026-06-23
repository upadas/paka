import { useState, useCallback } from 'react';
import { recipes } from './data/recipes.js';
import { useSession } from './hooks/useSession.js';
import { useTrending } from './hooks/useTrending.js';
import SearchBar from './components/SearchBar.jsx';
import FlyerCard from './components/FlyerCard.jsx';
import TrendingTile from './components/TrendingTile.jsx';
import SavedTile from './components/SavedTile.jsx';
import AiDrawer from './components/AiDrawer.jsx';
import SuggestModal from './components/SuggestModal.jsx';

const isAdmin = new URLSearchParams(location.search).get('admin') === '1';

export default function App() {
  const [idx,       setIdx]       = useState(0);
  const [aiOpen,    setAiOpen]    = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const sessionId   = useSession();
  const { trending, topSaved } = useTrending();

  const navigate = useCallback((id) => {
    const i = recipes.findIndex(r => r.id === id);
    if (i >= 0) setIdx(i);
  }, []);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(recipes.length - 1, i + 1));

  const recipe = recipes[idx];

  return (
    <>
      {isAdmin && <div className="admin-banner">🔐 Admin Mode — {recipe.title}</div>}

      <header className="app-header">
        <div className="app-logo">
          <div className="logo-roundel">
            <svg width="26" height="26" viewBox="0 0 92 92" fill="none">
              <path d="M38 17c-4-5 3-9 0-14" stroke="#f7cf3f" strokeWidth="3.4" strokeLinecap="round"/>
              <path d="M54 17c4-5-3-9 0-14" stroke="#f7cf3f" strokeWidth="3.4" strokeLinecap="round"/>
              <ellipse cx="46" cy="29" rx="30" ry="7" fill="#fbf3d3"/>
              <circle cx="46" cy="22" r="4.4" fill="#f7cf3f"/>
              <path d="M16 31c0 22 8 38 30 38s30-16 30-38" fill="#fbf3d3"/>
              <path d="M16 36c-8 0-10 12-1 13" stroke="#fbf3d3" strokeWidth="5" strokeLinecap="round"/>
              <path d="M76 36c8 0 10 12 1 13" stroke="#fbf3d3" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-wordmark">Pāka</span>
        </div>

        <SearchBar onSelect={i => setIdx(i)} />

        <span className="app-tagline">Try Something Different Today</span>
      </header>

      <main className="stage-with-sidebar">
        <TrendingTile trending={trending} onSelect={navigate} />

        <div className="stage">
          <button className="arrow arrow-l" onClick={prev} disabled={idx === 0} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>

          <div className="flyer-wrap">
            <FlyerCard key={recipe.id} recipe={recipe} sessionId={sessionId} isAdmin={isAdmin} />
          </div>

          <button className="arrow arrow-r" onClick={next} disabled={idx === recipes.length - 1} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <polyline points="9,6 15,12 9,18"/>
            </svg>
          </button>
        </div>

        <SavedTile topSaved={topSaved} onSelect={navigate} />
      </main>

      <p className="recipe-counter">{idx + 1} / {recipes.length}</p>

      <button className="suggest-pill" onClick={() => setSuggestOpen(true)}>💡 Suggest a Recipe</button>
      <button className="ai-pill" onClick={() => setAiOpen(true)}>🧑‍🍳 What can I cook?</button>

      <AiDrawer open={aiOpen} onClose={() => setAiOpen(false)} onNavigate={navigate} />
      <SuggestModal open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </>
  );
}
