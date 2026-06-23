import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

// GET /api/trending?limit=10
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  const { data, error } = await supabase
    .from('recipe_stats')
    .select('recipe_id, likes, loves, saves, views')
    .order('likes', { ascending: false })
    .limit(limit * 3); // fetch more to re-rank by score

  if (error) return res.status(500).json({ error: error.message });

  const scored = (data || [])
    .map(r => ({ ...r, score: r.likes * 1 + r.loves * 2 + r.saves * 3 + r.views * 0.1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  res.json(scored);
});

// GET /api/trending/saved?limit=10
router.get('/saved', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  const { data, error } = await supabase
    .from('recipe_stats')
    .select('recipe_id, saves')
    .order('saves', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

export default router;
