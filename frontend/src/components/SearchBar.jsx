import { useState, useRef, useEffect, useCallback } from 'react';
import { recipes } from '../data/recipes.js';

const PHRASES = [
  'Search something spicy…',
  'Search something quick & easy…',
  'Search a vegan meal…',
  'Search something for Sunday brunch…',
  'Search a high-protein dish…',
  'Search something diabetic-friendly…',
  'Search a South Indian classic…',
  'Search something under 20 minutes…',
  'Search a dal for tonight…',
  'Search something hearty & filling…',
  'Search a Rasoi Magic recipe…',
  'Search something gluten-free…',
  'Search a dish with paneer…',
  'Search something for the kids…',
  'Search a comfort bowl…',
  'Try something different today',
];

const TAG_CAT = t =>
  ['Vegan', 'Vegetarian'].includes(t) ? 'diet' :
  ['Gluten-free', 'Diabetic-friendly', 'Low-calorie', 'Light'].includes(t) ? 'health' :
  'nutrition';

function scoreRecipe(recipe, q) {
  const hay = [recipe.title, recipe.script, recipe.badge, recipe.blurb,
    ...(recipe.tags || []), ...recipe.ingredients.map(i => i.name + ' ' + (i.key || ''))
  ].join(' ').toLowerCase();
  const words = q.toLowerCase().split(/\s+/);
  const matched = words.filter(w => hay.includes(w)).length;
  return matched / words.length;
}

export default function SearchBar({ onSelect }) {
  const [query,  setQuery]  = useState('');
  const [open,   setOpen]   = useState(false);
  const [phrase, setPhrase] = useState('');
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);
  const twRef    = useRef({ idx: 0, char: 0, timer: null });

  // Typewriter
  const typeStep = useCallback(() => {
    const tw = twRef.current;
    if (document.activeElement === inputRef.current) return;
    const full = PHRASES[tw.idx];
    setPhrase(full.slice(0, tw.char));
    if (tw.char < full.length) {
      tw.char++;
      tw.timer = setTimeout(typeStep, 62);
    } else {
      tw.timer = setTimeout(() => {
        tw.idx  = (tw.idx + 1) % PHRASES.length;
        tw.char = 0;
        typeStep();
      }, 1900);
    }
  }, []);

  useEffect(() => {
    twRef.current.timer = setTimeout(typeStep, 400);
    return () => clearTimeout(twRef.current.timer);
  }, [typeStep]);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', e => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); inputRef.current?.focus(); } });
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = query.trim()
    ? recipes.map((r, i) => ({ r, i, s: scoreRecipe(r, query) }))
        .filter(x => x.s > 0).sort((a, b) => b.s - a.s)
    : recipes.map((r, i) => ({ r, i, s: 1 }));

  return (
    <div className="header-search-wrap" ref={wrapRef}>
      <span className="header-search-icon">🔍</span>
      <input
        ref={inputRef}
        className="header-search-input"
        value={query}
        placeholder={phrase}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { clearTimeout(twRef.current.timer); setOpen(true); }}
        onBlur={() => { if (!query) { twRef.current.char = 0; typeStep(); } }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setOpen(false); inputRef.current.blur(); }
          if (e.key === 'Enter' && results[0]) {
            onSelect(results[0].i);
            setOpen(false); setQuery(''); inputRef.current.blur();
          }
        }}
      />
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.slice(0, 12).map(({ r, i }) => (
            <div key={r.id} className="search-result-item" onMouseDown={() => { onSelect(i); setOpen(false); setQuery(''); }}>
              <span className="search-result-emoji">{r.heroEmoji}</span>
              <div className="search-result-info">
                <div className="search-result-name">{r.title}</div>
                <div className="search-result-meta">{r.readyMins} min · {r.badge}</div>
                <div className="search-result-tags">
                  {(r.tags || []).map(t => <span key={t} className="diet-tag" data-cat={TAG_CAT(t)}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
