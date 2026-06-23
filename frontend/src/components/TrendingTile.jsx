export default function TrendingTile({ trending, onSelect }) {
  if (!trending.length) return null;

  return (
    <aside className="side-tile trending-tile">
      <div className="tile-header">🔥 Top 10 Trending</div>
      <ol className="tile-list">
        {trending.map(({ recipe, score }, i) => (
          <li key={recipe.id} className="tile-item" onClick={() => onSelect(recipe.id)}>
            <span className="tile-rank">{i + 1}</span>
            <span className="tile-emoji">{recipe.heroEmoji}</span>
            <span className="tile-name">{recipe.title}</span>
            <span className="tile-score">🔥{Math.round(score)}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
