import { useStats } from '../hooks/useStats.js';

export default function LikePanel({ recipeId, sessionId }) {
  const { stats, active, react, save } = useStats(recipeId, sessionId);

  return (
    <div className="like-panel">
      <button
        className={`like-btn ${active.liked ? 'active' : ''}`}
        onClick={() => react('like')}
        title="Like"
      >
        <span className="like-icon">👍</span>
        <span className="like-count">{stats.likes}</span>
      </button>
      <button
        className={`like-btn love ${active.loved ? 'active' : ''}`}
        onClick={() => react('love')}
        title="Love"
      >
        <span className="like-icon">❤️</span>
        <span className="like-count">{stats.loves}</span>
      </button>
      <button
        className={`like-btn save ${active.saved ? 'active' : ''}`}
        onClick={save}
        title="Save"
      >
        <span className="like-icon">{active.saved ? '🔖' : '🏷️'}</span>
        <span className="like-count">{stats.saves}</span>
      </button>
    </div>
  );
}
