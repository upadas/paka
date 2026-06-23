import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

// GET /api/stats/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('recipe_stats')
    .select('likes, loves, saves, views')
    .eq('recipe_id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || { likes: 0, loves: 0, saves: 0, views: 0 });
});

// POST /api/stats/:id/view
router.post('/:id/view', async (req, res) => {
  await supabase.rpc('increment_stat', { p_recipe_id: req.params.id, p_col: 'views' });
  res.json({ ok: true });
});

// POST /api/stats/:id/react  { type: 'like'|'love', sessionId }
router.post('/:id/react', async (req, res) => {
  const { type, sessionId } = req.body;
  if (!['like', 'love'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const col = type === 'like' ? 'likes' : 'loves';

  // Try to insert interaction (fails silently if duplicate = already reacted)
  const { error: insertErr } = await supabase
    .from('user_interactions')
    .insert({ session_id: sessionId, recipe_id: req.params.id, type });

  if (insertErr && insertErr.code === '23505') {
    // Already reacted — toggle off
    await supabase.from('user_interactions').delete()
      .eq('session_id', sessionId).eq('recipe_id', req.params.id).eq('type', type);
    await supabase.rpc('decrement_stat', { p_recipe_id: req.params.id, p_col: col });
    return res.json({ active: false });
  }

  await supabase.rpc('increment_stat', { p_recipe_id: req.params.id, p_col: col });
  res.json({ active: true });
});

// POST /api/stats/:id/save  { sessionId }
router.post('/:id/save', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const { error: insertErr } = await supabase
    .from('user_interactions')
    .insert({ session_id: sessionId, recipe_id: req.params.id, type: 'save' });

  if (insertErr && insertErr.code === '23505') {
    await supabase.from('user_interactions').delete()
      .eq('session_id', sessionId).eq('recipe_id', req.params.id).eq('type', 'save');
    await supabase.rpc('decrement_stat', { p_recipe_id: req.params.id, p_col: 'saves' });
    return res.json({ saved: false });
  }

  await supabase.rpc('increment_stat', { p_recipe_id: req.params.id, p_col: 'saves' });
  res.json({ saved: true });
});

// GET /api/stats/:id/session/:sessionId  — what has this session done?
router.get('/:id/session/:sessionId', async (req, res) => {
  const { data } = await supabase
    .from('user_interactions')
    .select('type')
    .eq('recipe_id', req.params.id)
    .eq('session_id', req.params.sessionId);
  const types = (data || []).map(r => r.type);
  res.json({ liked: types.includes('like'), loved: types.includes('love'), saved: types.includes('save') });
});

export default router;
