import { useState } from 'react';
import { recipes } from '../data/recipes.js';

const PANTRY = new Set(['salt','oil','water','sugar','garam-masala']);

function matchRecipes(text) {
  const tokens = text.toLowerCase().split(/[\s,]+/).filter(t => t.length > 2 && !PANTRY.has(t));
  if (!tokens.length) return [];
  return recipes
    .map(r => {
      const keys = new Set(r.ingredients.map(i => i.key).filter(Boolean));
      const hits  = tokens.filter(t => [...keys].some(k => k.includes(t) || t.includes(k))).length;
      return { r, hits };
    })
    .filter(x => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 3)
    .map(x => x.r);
}

export default function AiDrawer({ open, onClose, onNavigate }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Tell me what ingredients you have at home and I\'ll suggest what you can cook! Try: "I have poha, onions, peanuts and lemon"' }
  ]);
  const [input, setInput] = useState('');

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    const matches = matchRecipes(text);
    const reply = matches.length
      ? `I found ${matches.length} recipe${matches.length > 1 ? 's' : ''} for you!\n${matches.map(r => `🍽 ${r.title} (${r.readyMins} min)`).join('\n')}`
      : 'Hmm, I couldn\'t find a match. Try listing more ingredients!';
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: reply, matches }]);
    }, 400);
  }

  return (
    <>
      <div className={`ai-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`ai-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="ai-drawer-head">
          <span className="ai-drawer-title">What's in your kitchen?</span>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>
        <div className="ai-chat">
          {messages.map((m, i) => (
            <div key={i} className={`ai-bubble ai-bubble--${m.role}`}>
              {m.text}
              {m.matches?.map(r => (
                <button key={r.id} className="ai-recipe-link" onClick={() => { onNavigate(r.id); onClose(); }}>
                  → Open {r.title}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="ai-input-row">
          <input className="ai-input" value={input} onChange={e => setInput(e.target.value)}
            placeholder="I have onion, peanuts, lemon, poha…"
            onKeyDown={e => e.key === 'Enter' && send()} />
          <button className="ai-send" onClick={send}>Send</button>
        </div>
      </aside>
    </>
  );
}
