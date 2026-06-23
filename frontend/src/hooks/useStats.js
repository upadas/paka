import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useStats(recipeId, sessionId) {
  const [stats,   setStats]   = useState({ likes: 0, loves: 0, saves: 0, views: 0 });
  const [active,  setActive]  = useState({ liked: false, loved: false, saved: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recipeId || !sessionId) return;
    let cancelled = false;

    Promise.all([
      fetch(`${API}/api/stats/${recipeId}`).then(r => r.json()),
      fetch(`${API}/api/stats/${recipeId}/session/${sessionId}`).then(r => r.json()),
    ]).then(([s, a]) => {
      if (cancelled) return;
      setStats(s);
      setActive(a);
    }).catch(() => {});

    // Register view (fire-and-forget)
    fetch(`${API}/api/stats/${recipeId}/view`, { method: 'POST' }).catch(() => {});

    return () => { cancelled = true; };
  }, [recipeId, sessionId]);

  const react = useCallback(async (type) => {
    if (loading) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/stats/${recipeId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, sessionId }),
      });
      const data = await res.json();
      const key  = type === 'like' ? 'liked' : 'loved';
      const col  = type === 'like' ? 'likes' : 'loves';
      setActive(prev => ({ ...prev, [key]: data.active }));
      setStats(prev  => ({ ...prev, [col]: prev[col] + (data.active ? 1 : -1) }));
    } finally { setLoading(false); }
  }, [recipeId, sessionId, loading]);

  const save = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/stats/${recipeId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setActive(prev => ({ ...prev, saved: data.saved }));
      setStats(prev  => ({ ...prev, saves: prev.saves + (data.saved ? 1 : -1) }));
    } finally { setLoading(false); }
  }, [recipeId, sessionId, loading]);

  return { stats, active, react, save };
}
