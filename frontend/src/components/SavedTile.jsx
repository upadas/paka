export default function SavedTile({ topSaved, onSelect }) {
  if (!topSaved.length) return null;

  return (
    <aside className="side-tile saved-tile">
      <div className="tile-header">🔖 Most Saved</div>
      <ol className="tile-list">
        {topSaved.map(({ recipe, saves }, i) => (
          <li key={recipe.id} className="tile-item" onClick={() => onSelect(recipe.id)}>
            <span className="tile-rank">{i + 1}</span>
            <span className="tile-emoji">{recipe.heroEmoji}</span>
            <span className="tile-name">{recipe.title}</span>
            <span className="tile-score">🔖{saves}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
