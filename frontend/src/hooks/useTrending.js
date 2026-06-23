import { useState, useEffect } from 'react';
import { recipes } from '../data/recipes.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function hydrate(rows) {
  return rows
    .map(row => ({ ...row, recipe: recipes.find(r => r.id === row.recipe_id) }))
    .filter(r => r.recipe);
}

export function useTrending() {
  const [trending, setTrending] = useState([]);
  const [topSaved, setTopSaved] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/trending?limit=10`).then(r => r.json())
      .then(data => setTrending(hydrate(data))).catch(() => {});

    fetch(`${API}/api/trending/saved?limit=10`).then(r => r.json())
      .then(data => setTopSaved(hydrate(data))).catch(() => {});
  }, []);

  return { trending, topSaved };
}
