import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SuggestModal({ open, onClose }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    try {
      await fetch(`${API}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
    } catch {}
    setSent(true);
    setTimeout(() => { setSent(false); setText(''); onClose(); }, 2000);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box suggest-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Suggest a Recipe</div>
        <div className="modal-sub">We'd love to add your favourite dish!</div>
        {sent
          ? <p style={{ textAlign: 'center', color: '#2f6e2e', fontWeight: 800, padding: '16px 0' }}>✅ Thanks! We'll add it soon.</p>
          : <>
              <textarea className="suggest-textarea" value={text} onChange={e => setText(e.target.value)}
                placeholder="e.g. Pesarattu, Gongura Chicken, Natu Kodi Pulusu…" />
              <button className="suggest-submit" onClick={submit}>Send Suggestion →</button>
            </>
        }
      </div>
    </div>
  );
}
