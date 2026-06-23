import { useState, useEffect, useRef } from 'react';
import LikePanel from './LikePanel.jsx';

const TAG_CAT = t =>
  ['Vegan', 'Vegetarian'].includes(t) ? 'diet' :
  ['Gluten-free', 'Diabetic-friendly', 'Low-calorie', 'Light'].includes(t) ? 'health' : 'nutrition';

function fmtFrac(x, unit) {
  const u = unit ? ' ' + unit : '';
  if (x <= 0.0001) return '0' + u;
  const eighths = Math.round(x * 8);
  const whole = Math.floor(eighths / 8);
  const rem = eighths % 8;
  const map = { 0: '', 1: '⅛', 2: '¼', 3: '⅜', 4: '½', 5: '⅝', 6: '¾', 7: '⅞' };
  let str;
  if (whole > 0 && rem > 0) str = whole + map[rem];
  else if (whole > 0) str = String(whole);
  else str = map[rem] || '0';
  return str + u;
}

function computeServings(recipe, adults, children) {
  const people = adults + children;
  const eff = Math.max(0.5, adults + children * 0.5);
  const scale = eff / recipe.baseServings;
  const ingredients = recipe.ingredients.map(d => {
    let qty;
    if (d.t === 'taste') qty = '';
    else if (d.t === 'range') {
      const lo = Math.max(1, Math.round(d.low * scale));
      const hi = Math.max(lo, Math.round(d.high * scale));
      qty = lo + '–' + hi + (d.u ? ' ' + d.u : '');
    } else if (d.t === 'count') {
      qty = Math.max(1, Math.round(d.q * scale)) + (d.u ? ' ' + d.u : '');
    } else {
      qty = fmtFrac(d.q * scale, d.u);
    }
    return { ...d, qty, scaledCal: Math.round(d.cal * scale) };
  });
  const totalCal = ingredients.reduce((s, i) => s + i.scaledCal, 0);
  const perServing = people > 0 ? Math.round(totalCal / people) : totalCal;
  return { ingredients, totalCal, perServing, servesLabel: 'Serves ' + people };
}

export default function FlyerCard({ recipe, sessionId, isAdmin }) {
  const [adults,   setAdults]   = useState(2);
  const [children, setChildren] = useState(0);
  const titleRef = useRef(null);
  const blobRef  = useRef(null);

  const { ingredients, totalCal, perServing, servesLabel } = computeServings(recipe, adults, children);

  useEffect(() => {
    if (titleRef.current && blobRef.current) {
      blobRef.current.style.width = Math.max(140, titleRef.current.scrollWidth * 0.88) + 'px';
    }
  }, [recipe.id]);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const storedPhoto = (() => { try { return localStorage.getItem('paka.photo.' + recipe.id); } catch { return null; } })();

  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { localStorage.setItem('paka.photo.' + recipe.id, ev.target.result); } catch {}
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const clamp = (v, min = 0, max = 30) => Math.max(min, Math.min(max, v));

  return (
    <div className="flyer-card">
      <div className="leaf leaf1">🌿</div>
      <div className="leaf leaf2">🌿</div>
      <div className="leaf leaf3">🌿</div>

      <div className="flyer-header">
        <div className="title-col">
          <div className="recipe-script">{recipe.script}</div>
          <div className="title-wrap">
            <div className="title-blob" ref={blobRef}></div>
            <h1 className="recipe-title" ref={titleRef}>{recipe.title}</h1>
          </div>
          <div className="badge-wrap">
            <span className="brush-banner green-banner">{recipe.badge}</span>
          </div>
          <p className="recipe-blurb">{recipe.blurb}</p>
          {recipe.tags?.length > 0 && (
            <div className="diet-tags">
              {recipe.tags.map(t => <span key={t} className="diet-tag" data-cat={TAG_CAT(t)}>{t}</span>)}
            </div>
          )}
          <LikePanel recipeId={recipe.id} sessionId={sessionId} />
        </div>

        <div className="hero-col">
          {(storedPhoto || recipe.heroSrc)
            ? <img className="hero-img" src={storedPhoto || recipe.heroSrc} alt={recipe.title} />
            : <div className="hero-placeholder">{recipe.heroEmoji}</div>
          }
          {isAdmin && (
            <label className="admin-upload-btn">
              📷 Upload Photo
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
          )}
          <div className="ready-badge">
            <span className="ready-top">Ready in</span>
            <span className="ready-num">{recipe.readyMins}</span>
            <span className="ready-bot">Mins!</span>
          </div>
        </div>
      </div>

      <div className="calc-box">
        <div className="cooking-for">Cooking<br />for?</div>
        <div className="stepper-group">
          <span className="stepper-label">🧑 Adults</span>
          <div className="stepper-row">
            <button className="step-btn" onClick={() => setAdults(v => clamp(v - 1))}>−</button>
            <input className="step-input" type="number" min="0" max="30" value={adults}
              onChange={e => setAdults(clamp(parseInt(e.target.value) || 0))} />
            <button className="step-btn" onClick={() => setAdults(v => clamp(v + 1))}>+</button>
          </div>
        </div>
        <div className="stepper-group">
          <span className="stepper-label">🧒 Children</span>
          <div className="stepper-row">
            <button className="step-btn" onClick={() => setChildren(v => clamp(v - 1))}>−</button>
            <input className="step-input" type="number" min="0" max="30" value={children}
              onChange={e => setChildren(clamp(parseInt(e.target.value) || 0))} />
            <button className="step-btn" onClick={() => setChildren(v => clamp(v + 1))}>+</button>
          </div>
        </div>
        <div className="cal-summary">
          <div className="cal-total">{totalCal} <span className="cal-unit">calories</span></div>
          <div className="cal-sub">whole cooked {recipe.title} · <b>{perServing}</b> cal per serving</div>
        </div>
        <div className="calc-note">Measurements & calories scale automatically · each child counts as ½ an adult portion.</div>
      </div>

      <div className="flyer-body">
        <div className="ing-col">
          <div className="section-head">
            <span className="brush-banner green-banner section-banner">
              INGREDIENTS <span className="serves-tag">{servesLabel}</span>
            </span>
          </div>
          <ul className="ing-list">
            {ingredients.map((ing, i) => (
              <li key={i} className="ing-item">
                <span className="ing-icon">{ing.icon}</span>
                <span className="ing-text">
                  {ing.qty && <b>{ing.qty} </b>}{ing.name}
                  {ing.sub && <span className="ing-sub"> {ing.sub}</span>}
                </span>
                <span className="ing-cal">{ing.scaledCal > 0 ? ing.scaledCal + ' cal' : ''}</span>
              </li>
            ))}
          </ul>
          <div className="goodness-box">
            <div className="goodness-title">Goodness in every bite!</div>
            <div className="goodness-items">
              {recipe.goodness.map(g => (
                <div key={g} className="goodness-item">
                  <span className="goodness-check">✓</span>{g}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="method-col">
          <div className="section-head">
            <span className="brush-banner yellow-banner">METHOD</span>
          </div>
          <ol className="method-list">
            {recipe.method.map((s, i) => (
              <li key={i} className="method-item">
                <span className="step-num">{i + 1}</span>
                <div className="step-body">
                  <div className="step-title">{s.title}</div>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {recipe.tip && (
            <div className="tip-box">
              <span className="tip-label">Tip · </span>
              <span className="tip-text">{recipe.tip}</span>
            </div>
          )}
        </div>
      </div>

      {recipe.serveWith?.length > 0 && (
        <div className="serve-section">
          <span className="brush-banner yellow-banner">SERVE IT WITH</span>
          <div className="serve-items">
            {recipe.serveWith.map((s, i) => (
              <div key={i} className="serve-item">
                {i > 0 && <div className="serve-divider"></div>}
                <span className="serve-item-icon">{s.icon}</span>
                <span className="serve-item-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flyer-footer">
        <div className="footer-left">Simple ingredients.<br />Amazing taste.</div>
        <div className="footer-right">Good Food,<br />Good Mood! 🙂</div>
      </div>
      <div className="footer-stripe"></div>
    </div>
  );
}
