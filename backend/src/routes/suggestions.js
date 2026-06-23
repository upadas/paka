import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

// POST /api/suggestions  { text }
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text required' });
  const { error } = await supabase.from('suggestions').insert({ text: text.trim() });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/suggestions  (admin only)
router.get('/', async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
