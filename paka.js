/* ── Fraction formatter (verbatim from design handoff) ─────────── */
function fmtFrac(x, unit) {
  const u = unit ? ' ' + unit : '';
  if (x <= 0.0001) return '0' + u;
  const eighths = Math.round(x * 8);
  const whole   = Math.floor(eighths / 8);
  const rem     = eighths % 8;
  const map     = { 0:'', 1:'⅛', 2:'¼', 3:'⅜', 4:'½', 5:'⅝', 6:'¾', 7:'⅞' };
  let str;
  if (whole > 0 && rem > 0) str = whole + map[rem];
  else if (whole > 0)       str = String(whole);
  else                      str = map[rem] || '0';
  return str + u;
}

/* ── Scaling logic (verbatim from design handoff) ───────────────── */
function computeServings(recipe, adults, children) {
  const people = adults + children;
  const eff    = Math.max(0.5, adults + children * 0.5);
  const scale  = eff / recipe.baseServings;

  const ingredients = recipe.ingredients.map(d => {
    let qty;
    if (d.t === 'taste') {
      qty = '';
    } else if (d.t === 'range') {
      const lo = Math.max(1, Math.round(d.low  * scale));
      const hi = Math.max(lo, Math.round(d.high * scale));
      qty = lo + '–' + hi + (d.u ? ' ' + d.u : '');
    } else if (d.t === 'count') {
      const n = Math.max(1, Math.round(d.q * scale));
      qty = n + (d.u ? ' ' + d.u : '');
    } else {
      qty = fmtFrac(d.q * scale, d.u);
    }
    return { ...d, qty, cal: Math.round(d.cal * scale) };
  });

  const totalCal   = ingredients.reduce((s, i) => s + i.cal, 0);
  const perServing = people > 0 ? Math.round(totalCal / people) : totalCal;
  const servesLabel = 'Serves ' + people;

  return { ingredients, totalCal, perServing, servesLabel, people, scale };
}

/* ── Recipe catalog ─────────────────────────────────────────────── */
const recipes = [
  {
    id: 'poha',
    title: 'Poha',
    script: 'Light, Healthy & Delicious',
    badge: 'A COMFORTING INDIAN CLASSIC',
    blurb: 'Soft, fluffy & bursting with flavor — the perfect quick breakfast or any-time snack!',
    readyMins: 15,
    baseServings: 2,
    heroEmoji: '🍚',
    ingredients: [
      { icon:'🍚', t:'frac',  q:1.5,  u:'cups',  name:'thick poha',           sub:'(flattened rice)', cal:330, key:'poha' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium', name:'onion, finely chopped', sub:'',               cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:1,    u:'',       name:'green chilli, chopped', sub:'',               cal:4,   key:'green-chilli' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'mustard seeds',         sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:0.5,  u:'tsp',   name:'cumin seeds',           sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🥜', t:'range', low:8, high:10, u:'', name:'peanuts',             sub:'',               cal:60,  key:'peanuts' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',         sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:0.25, u:'tsp',   name:'turmeric powder',       sub:'',               cal:2,   key:'turmeric' },
      { icon:'🍬', t:'frac',  q:0.5,  u:'tsp',   name:'sugar',                 sub:'(optional)',     cal:8,   key:'sugar' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',         sub:'',               cal:0,   key:'salt' },
      { icon:'🍋', t:'frac',  q:1,    u:'tbsp',  name:'lemon juice',            sub:'',               cal:3,   key:'lemon' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',  name:'fresh coriander, chopped',sub:'',             cal:1,   key:'coriander' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',                    sub:'',               cal:240, key:'oil' },
    ],
    method: [
      { title:'PREPARE THE POHA',  body:'Rinse the poha gently in a colander under water. Drain well and keep aside for 5 minutes to soften.' },
      { title:'TEMPER THE SPICES', body:'Heat oil and add mustard seeds. When they splutter, add cumin, peanuts, curry leaves & green chilli. Sauté a minute.' },
      { title:'ADD THE ONION',     body:'Add the chopped onion and sauté until soft and translucent.' },
      { title:'ADD THE FLAVOR',    body:'Sprinkle in turmeric, salt & sugar. Mix well so the colour coats everything evenly.' },
      { title:'ADD THE POHA',      body:'Fold in the rinsed poha and mix gently. Cook on a low flame for 2–3 minutes, stirring occasionally.' },
      { title:'FINISH & SERVE',    body:'Turn off the heat. Add lemon juice & fresh coriander. Mix and serve hot — garnish with sev if you like!' },
    ],
    goodness: ['Light on the stomach','Packed with energy','Naturally gluten-free','Perfect for all ages'],
    serveWith: [{ icon:'☕', label:'Hot Chai' }, { icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }],
    tip: 'Always rinse in a colander, never a bowl — it keeps every flake separate and pillowy, never mushy.',
    tags: ['Vegetarian', 'Gluten-free', 'Light'],
  },
  {
    id: 'upma',
    title: 'Upma',
    script: 'Savory & Satisfying',
    badge: 'A SOUTH INDIAN STAPLE',
    blurb: 'Fluffy semolina sautéed with aromatics and veggies — nourishing and ready in minutes!',
    readyMins: 20,
    baseServings: 2,
    heroEmoji: '🫕',
    ingredients: [
      { icon:'🌾', t:'frac',  q:1,    u:'cup',   name:'semolina (rava)',    sub:'',         cal:340, key:'semolina' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium', name:'onion, chopped',    sub:'',         cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:1,    u:'',       name:'green chilli',      sub:'',         cal:4,   key:'green-chilli' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'mustard seeds',     sub:'',         cal:8,   key:'mustard-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',    sub:'',         cal:2,   key:'curry-leaves' },
      { icon:'🥜', t:'frac',  q:2,    u:'tbsp',  name:'peanuts',           sub:'',         cal:100, key:'peanuts' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',               sub:'',         cal:240, key:'oil' },
      { icon:'💧', t:'frac',  q:2,    u:'cups',  name:'water',             sub:'',         cal:0,   key:'water' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',    sub:'',         cal:0,   key:'salt' },
    ],
    method: [
      { title:'DRY ROAST THE RAVA', body:'Dry roast semolina on medium heat until lightly golden and fragrant, about 3–4 minutes. Remove and keep aside.' },
      { title:'TEMPER',             body:'Heat oil. Add mustard seeds. When they splutter, add curry leaves, green chilli, and peanuts. Sauté for a minute.' },
      { title:'ADD ONION',          body:'Add chopped onion and sauté until soft and translucent, 2–3 minutes.' },
      { title:'BOIL WATER',         body:'Pour in water, add salt, and bring to a rolling boil.' },
      { title:'ADD RAVA & STIR',    body:'Add the roasted rava in a slow, steady stream, stirring continuously to prevent lumps.' },
      { title:'COVER & SERVE',      body:'Cover and cook on low for 2 minutes until water is absorbed. Serve hot with coconut chutney!' },
    ],
    goodness: ['Rich in complex carbs','Quick & energizing','Easily digestible','Versatile & filling'],
    serveWith: [{ icon:'🥥', label:'Coconut Chutney' }, { icon:'☕', label:'Filter Coffee' }, { icon:'🍋', label:'Lemon Wedge' }],
    tip: 'Roasting the rava first is the secret to fluffy, non-sticky upma. Never skip this step!',
    tags: ['Vegetarian', 'High-carb'],
  },
  {
    id: 'rajma',
    title: 'Rajma',
    script: 'Hearty & Wholesome',
    badge: "NORTH INDIA'S COMFORT FOOD",
    blurb: 'Creamy kidney beans in a rich tomato masala — the ultimate comfort meal with rice!',
    readyMins: 45,
    baseServings: 4,
    heroEmoji: '🫘',
    ingredients: [
      { icon:'🫘', t:'frac',  q:2,   u:'cups',  name:'kidney beans (rajma)', sub:'(soaked overnight)', cal:450, key:'rajma' },
      { icon:'🧅', t:'count', q:2,   u:'',      name:'onions, finely chopped',sub:'',                  cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,   u:'',      name:'tomatoes, pureed',      sub:'',                  cal:75,  key:'tomato' },
      { icon:'🧄', t:'count', q:5,   u:'',      name:'garlic cloves, minced', sub:'',                  cal:20,  key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,   u:'inch',  name:'ginger, grated',        sub:'',                  cal:5,   key:'ginger' },
      { icon:'🫗', t:'frac',  q:3,   u:'tbsp',  name:'oil',                   sub:'',                  cal:360, key:'oil' },
      { icon:'🟡', t:'frac',  q:1,   u:'tsp',   name:'turmeric powder',       sub:'',                  cal:8,   key:'turmeric' },
      { icon:'🌶️',t:'frac',  q:1,   u:'tsp',   name:'red chilli powder',     sub:'',                  cal:6,   key:'red-chilli' },
      { icon:'🟤', t:'frac',  q:1,   u:'tsp',   name:'cumin seeds',           sub:'',                  cal:4,   key:'cumin-seeds' },
      { icon:'✨', t:'frac',  q:1.5, u:'tsp',   name:'garam masala',          sub:'',                  cal:12,  key:'garam-masala' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',        sub:'',                  cal:0,   key:'salt' },
      { icon:'🌱', t:'frac',  q:2,   u:'tbsp',  name:'fresh coriander',       sub:'(for garnish)',     cal:1,   key:'coriander' },
    ],
    method: [
      { title:'PRESSURE COOK', body:'Pressure cook soaked rajma with water and a pinch of salt for 4–5 whistles until completely soft. Reserve cooking liquid.' },
      { title:'BROWN THE ONIONS', body:'Heat oil. Add cumin seeds. When they crackle, add onions and sauté until golden brown, about 8 minutes.' },
      { title:'ADD GINGER-GARLIC', body:'Add minced ginger and garlic. Sauté 2 minutes until the raw smell disappears completely.' },
      { title:'BUILD THE MASALA', body:'Add tomato puree, turmeric, chilli powder, and salt. Cook on medium heat until oil separates from the masala.' },
      { title:'ADD RAJMA & SIMMER', body:'Add cooked rajma along with some cooking liquid. Simmer for 15–20 minutes, mashing a few beans for a creamy gravy.' },
      { title:'FINISH', body:'Stir in garam masala. Simmer 2 more minutes. Garnish with fresh coriander and a small knob of butter for richness.' },
    ],
    goodness: ['High in plant protein','Rich in fibre','Iron-packed','Slow-releasing energy'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫓', label:'Phulka Roti' }, { icon:'🥗', label:'Kachumber Salad' }],
    tip: 'Always soak rajma overnight — it cuts cooking time significantly and makes beans easier to digest.',
    tags: ['Vegan', 'High-protein', 'High-fibre'],
  },
  {
    id: 'biryani',
    title: 'Biryani',
    script: 'Fragrant & Royal',
    badge: 'HYDERABADI DUM PUKHT',
    blurb: 'Slow-cooked layers of spiced chicken and saffron rice — a celebration on every plate!',
    readyMins: 75,
    baseServings: 4,
    heroEmoji: '🍗',
    ingredients: [
      { icon:'🍗', t:'frac',  q:800,  u:'g',    name:'chicken (bone-in pieces)', sub:'',             cal:1200, key:'chicken' },
      { icon:'🍚', t:'frac',  q:2,    u:'cups', name:'basmati rice',             sub:'(soaked 30 min)',cal:680, key:'basmati' },
      { icon:'🥛', t:'frac',  q:1,    u:'cup',  name:'full-fat yogurt',           sub:'',             cal:150,  key:'yogurt' },
      { icon:'🧅', t:'frac',  q:1,    u:'cup',  name:'crispy fried onions',       sub:'(birista)',    cal:160,  key:'onion' },
      { icon:'🫙', t:'frac',  q:3,    u:'tbsp', name:'ghee',                      sub:'',             cal:360,  key:'ghee' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'g',    name:'saffron strands',           sub:'soaked in 4 tbsp warm milk', cal:2, key:'saffron' },
      { icon:'🌿', t:'frac',  q:20,   u:'g',    name:'fresh mint leaves',         sub:'',             cal:5,    key:'mint' },
      { icon:'🌸', t:'frac',  q:2,    u:'tbsp', name:'rose water',                sub:'',             cal:0,    key:'rose-water' },
      { icon:'✨', t:'frac',  q:2,    u:'tsp',  name:'garam masala',              sub:'',             cal:12,   key:'garam-masala' },
      { icon:'🌶️',t:'frac',  q:1.5,  u:'tsp',  name:'Kashmiri chili powder',     sub:'',             cal:9,    key:'red-chilli' },
      { icon:'🧄', t:'count', q:6,    u:'',     name:'garlic cloves, minced',     sub:'',             cal:24,   key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch', name:'ginger, grated',            sub:'',             cal:5,    key:'ginger' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',             sub:'',             cal:0,    key:'salt' },
    ],
    method: [
      { title:'MARINATE',       body:'Mix chicken with yogurt, ginger-garlic paste, chili powder, garam masala, half the birista, and salt. Marinate at least 2 hours (overnight is best).' },
      { title:'PARBOIL RICE',   body:'Boil water with whole spices (bay leaf, cardamom, cloves). Add soaked rice and cook until 70% done — each grain should still have a bite. Drain.' },
      { title:'LAYER',          body:'In a heavy pot, spread the marinated chicken first. Top with the parboiled rice. Drizzle saffron milk, ghee, remaining birista, and mint leaves over the rice.' },
      { title:'DUM COOK',       body:'Seal the pot tightly with foil, then the lid. Cook on a tawa (griddle) over low heat for 25 minutes — this trapped steam (dum) is the secret.' },
      { title:'REST & SERVE',   body:'Rest off heat for 10 minutes. Gently mix from the bottom before serving — you want some layers to remain. Serve with raita and salad.' },
    ],
    goodness: ['Rich in protein','Aromatic & satisfying','Calcium from yogurt','Mood-lifting saffron'],
    serveWith: [{ icon:'🥗', label:'Raita' }, { icon:'🫙', label:'Mirchi ka Salan' }, { icon:'🥚', label:'Boiled Egg' }],
    tip: 'The tawa under the pot distributes heat gently. Never cook biryani on direct high flame — patience is the ingredient you can\'t buy.',
    tags: ['High-protein', 'High-carb'],
  },
  {
    id: 'pulao',
    title: 'Pulao',
    script: 'Simple & Aromatic',
    badge: 'ONE-POT WONDER',
    blurb: 'Fragrant basmati rice with vegetables and whole spices — light, elegant and effortless!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🍛',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,   u:'cups', name:'basmati rice',           sub:'(rinsed & soaked 20 min)', cal:680, key:'basmati' },
      { icon:'🥕', t:'frac',  q:1,   u:'cup',  name:'carrots, diced',         sub:'',                         cal:50,  key:'carrot' },
      { icon:'🫛', t:'frac',  q:0.5, u:'cup',  name:'green peas (frozen OK)', sub:'',                         cal:60,  key:'peas' },
      { icon:'🫘', t:'frac',  q:0.5, u:'cup',  name:'green beans, sliced',    sub:'',                         cal:22,  key:'beans' },
      { icon:'🧅', t:'frac',  q:1,   u:'large',name:'onion, thinly sliced',   sub:'',                         cal:44,  key:'onion' },
      { icon:'🫙', t:'frac',  q:2,   u:'tbsp', name:'ghee or butter',         sub:'',                         cal:240, key:'ghee' },
      { icon:'🍃', t:'count', q:2,   u:'',     name:'bay leaves',             sub:'',                         cal:2,   key:'bay-leaf' },
      { icon:'💚', t:'count', q:4,   u:'',     name:'cardamom pods',          sub:'',                         cal:6,   key:'cardamom' },
      { icon:'🟫', t:'count', q:4,   u:'',     name:'cloves',                 sub:'',                         cal:3,   key:'cloves' },
      { icon:'🟤', t:'frac',  q:1,   u:'inch', name:'cinnamon stick',         sub:'',                         cal:3,   key:'cinnamon' },
      { icon:'🧄', t:'count', q:4,   u:'',     name:'garlic cloves, minced',  sub:'',                         cal:16,  key:'garlic' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',          sub:'',                        cal:0,   key:'salt' },
    ],
    method: [
      { title:'TEMPER SPICES',   body:'Heat ghee in a heavy pot. Add bay leaves, cardamom, cloves, and cinnamon. Sizzle 30 seconds until fragrant.' },
      { title:'COOK THE ONION',  body:'Add sliced onion and sauté until golden. Add garlic and cook 1 more minute.' },
      { title:'ADD VEGETABLES',  body:'Stir in carrots, beans, and peas. Sauté 2 minutes.' },
      { title:'ADD RICE',        body:'Drain the soaked rice and add to the pot. Gently stir to coat each grain with ghee and spices.' },
      { title:'ADD WATER & COOK',body:'Pour in 3½ cups water and salt. Bring to a boil, then cover and cook on the lowest heat for 15 minutes.' },
      { title:'REST & FLUFF',    body:'Turn off heat. Rest covered for 5 minutes. Fluff gently with a fork, removing whole spices as you serve.' },
    ],
    goodness: ['Light & easy to digest','Balanced carbs & veggies','No heavy masala','Whole-spice goodness'],
    serveWith: [{ icon:'🥛', label:'Raita' }, { icon:'🫙', label:'Pickle' }, { icon:'🥗', label:'Papad' }],
    tip: 'The rice-to-water ratio is 1:1¾ for pulao (not 1:2 like plain rice) — the soaking means the grain needs less water.',
    tags: ['Vegetarian', 'Gluten-free'],
  },
  {
    id: 'samai-upma',
    title: 'Samai Upma',
    script: 'Wholesome & Nutty',
    badge: 'LITTLE MILLET COMFORT',
    blurb: 'Fluffy little millet cooked with South Indian tempering — light, nutritious and deeply satisfying!',
    readyMins: 25,
    baseServings: 2,
    heroEmoji: '🌾',
    ingredients: [
      { icon:'🌾', t:'frac',  q:1,    u:'cup',   name:'samai (little millet)',  sub:'(rinsed, drained)',  cal:340, key:'samai' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, finely chopped',  sub:'',                   cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',       name:'tomato, chopped',        sub:'',                   cal:22,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies, slit',   sub:'',                   cal:8,   key:'green-chilli' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'mustard seeds',          sub:'',                   cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:0.5,  u:'tsp',   name:'cumin seeds',            sub:'',                   cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',         sub:'',                   cal:2,   key:'curry-leaves' },
      { icon:'🥜', t:'frac',  q:2,    u:'tbsp',  name:'peanuts',                sub:'',                   cal:100, key:'peanuts' },
      { icon:'🟡', t:'frac',  q:0.25, u:'tsp',   name:'turmeric powder',        sub:'',                   cal:2,   key:'turmeric' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',                    sub:'',                   cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',          sub:'',                  cal:0,   key:'salt' },
      { icon:'🍋', t:'frac',  q:1,    u:'tbsp',  name:'lemon juice',             sub:'',                  cal:3,   key:'lemon' },
    ],
    method: [
      { title:'DRY ROAST MILLET', body:'Dry roast samai on medium heat for 3–4 minutes, stirring constantly, until it smells nutty and turns slightly golden. Remove and set aside.' },
      { title:'TEMPER',           body:'Heat oil. Add mustard seeds. When they pop, add cumin, peanuts, curry leaves, and green chillies. Sauté 1 minute.' },
      { title:'BUILD BASE',       body:'Add onion, sauté until soft. Add tomato and turmeric. Cook until tomato breaks down, about 3 minutes.' },
      { title:'ADD MILLET',       body:'Add the roasted samai and stir well to coat with the masala.' },
      { title:'COOK WITH WATER',  body:'Pour in 2 cups of boiling water and salt. Stir, cover, and cook on low heat for 10–12 minutes until water is absorbed.' },
      { title:'FINISH',           body:'Fluff gently with a fork. Add lemon juice, mix, and serve hot with chutney or curd.' },
    ],
    goodness: ['High in fibre','Diabetic-friendly grain','Gluten-free','Rich in minerals'],
    serveWith: [{ icon:'🥥', label:'Coconut Chutney' }, { icon:'🥛', label:'Curd' }, { icon:'☕', label:'Filter Coffee' }],
    tip: 'Samai absorbs more water than semolina — use 1:2 millet-to-water. If it dries out before cooking through, splash in a little hot water.',
    tags: ['Vegan', 'Gluten-free', 'Diabetic-friendly', 'High-fibre'],
  },
  {
    id: 'uggani',
    title: 'Uggani',
    script: 'Light & Lively',
    badge: 'ANDHRA PUFFED RICE SNACK',
    blurb: 'Puffed rice tossed with a zesty peanut tempering — the beloved street-side breakfast of Rayalaseema!',
    readyMins: 15,
    baseServings: 2,
    heroEmoji: '🍿',
    ingredients: [
      { icon:'🍿', t:'frac',  q:4,    u:'cups',  name:'borugulu (puffed rice)',  sub:'',              cal:200, key:'puffed-rice' },
      { icon:'🥜', t:'frac',  q:3,    u:'tbsp',  name:'peanuts',                sub:'(roasted)',     cal:150, key:'peanuts' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, finely chopped',  sub:'',              cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies, slit',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'mustard seeds',          sub:'',              cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:0.5,  u:'tsp',   name:'cumin seeds',            sub:'',              cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',         sub:'',              cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:0.25, u:'tsp',   name:'turmeric powder',        sub:'',              cal:2,   key:'turmeric' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',                    sub:'',              cal:240, key:'oil' },
      { icon:'🍋', t:'frac',  q:2,    u:'tbsp',  name:'lemon juice',            sub:'(generous)',    cal:6,   key:'lemon' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',          sub:'',             cal:0,   key:'salt' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',  name:'fresh coriander',        sub:'',              cal:1,   key:'coriander' },
    ],
    method: [
      { title:'SOFTEN THE PORI',  body:'Place puffed rice in a large bowl. Sprinkle 3–4 tbsp of water over it and toss lightly. It should be barely moist — not wet. Set aside 2 minutes.' },
      { title:'TEMPER',           body:'Heat oil in a kadhai. Add mustard seeds. When they pop, add cumin, peanuts, curry leaves, and green chillies. Sauté until peanuts are golden.' },
      { title:'ADD ONION',        body:'Add finely chopped onion. Sauté on medium heat until translucent, about 3 minutes.' },
      { title:'SEASON',           body:'Add turmeric and salt. Mix well.' },
      { title:'TOSS THE PORI',    body:'Add the softened puffed rice to the pan. Toss gently on low heat for 2 minutes until everything is evenly coated and heated through.' },
      { title:'FINISH',           body:'Turn off heat. Add lemon juice and fresh coriander. Toss once more and serve immediately — uggani waits for no one!' },
    ],
    goodness: ['Very low calorie','Quick energy boost','Easy on digestion','No heavy masala'],
    serveWith: [{ icon:'☕', label:'Ginger Chai' }, { icon:'🥜', label:'Groundnut Chutney' }, { icon:'🫙', label:'Allam Pachadi' }],
    tip: 'The secret is barely moistening the pori — too much water makes it soggy. Toss with just enough to take the crunch off and keep each grain separate.',
    tags: ['Vegan', 'Gluten-free', 'Low-calorie'],
  },
  {
    id: 'uppudu-pindi',
    title: 'Uppudu Pindi',
    script: 'Hearty & Traditional',
    badge: 'ANDHRA BROKEN WHEAT UPMA',
    blurb: 'Coarsely broken wheat slow-cooked with spices — the rustic, filling breakfast of Andhra kitchens!',
    readyMins: 30,
    baseServings: 2,
    heroEmoji: '🌾',
    ingredients: [
      { icon:'🌾', t:'frac',  q:1,    u:'cup',   name:'goduma rava (broken wheat / dalia)', sub:'(coarse)',  cal:340, key:'broken-wheat' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, finely chopped',              sub:'',          cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',       name:'tomato, finely chopped',             sub:'(optional)',cal:22,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies, chopped',            sub:'',          cal:8,   key:'green-chilli' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'mustard seeds',                      sub:'',          cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:0.5,  u:'tsp',   name:'cumin seeds',                        sub:'',          cal:4,   key:'cumin-seeds' },
      { icon:'🫘', t:'count', q:1,    u:'tsp',   name:'chana dal (split chickpea)',          sub:'',          cal:18,  key:'chana-dal' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',                    sub:'',          cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:0.25, u:'tsp',   name:'turmeric powder',                    sub:'',          cal:2,   key:'turmeric' },
      { icon:'🫗', t:'frac',  q:2.5,  u:'tbsp',  name:'oil',                                sub:'',          cal:300, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',                      sub:'',         cal:0,   key:'salt' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',  name:'fresh coriander',                    sub:'',          cal:1,   key:'coriander' },
    ],
    method: [
      { title:'DRY ROAST',        body:'Dry roast broken wheat on medium heat for 4–5 minutes, stirring continuously, until it turns light golden and smells nutty. Remove and set aside.' },
      { title:'TEMPER',           body:'Heat oil in a heavy pan. Add mustard seeds. When they splutter, add cumin, chana dal, curry leaves, and green chillies. Sauté until dal turns golden.' },
      { title:'COOK ONION',       body:'Add onion and cook until soft. Add tomato (if using) and cook until it breaks down.' },
      { title:'SEASON',           body:'Add turmeric, salt, and 2 cups of boiling water. Stir well.' },
      { title:'ADD WHEAT & COOK', body:'Add the roasted broken wheat in a slow stream, stirring to prevent lumps. Cover and cook on low heat for 12–15 minutes, stirring occasionally.' },
      { title:'REST & SERVE',     body:'Broken wheat takes longer than semolina — check by tasting. Cover and rest 3 minutes off heat. Garnish with coriander and serve hot.' },
    ],
    goodness: ['High fibre grain','Low glycemic index','Keeps you full longer','Rich in iron & magnesium'],
    serveWith: [{ icon:'🥥', label:'Coconut Chutney' }, { icon:'🥛', label:'Curd' }, { icon:'🫙', label:'Gongura Pachadi' }],
    tip: 'Roasting the dalia until golden is non-negotiable — it brings out a lovely nuttiness and ensures the upma doesn\'t turn mushy.',
    tags: ['Vegan', 'High-fibre', 'Diabetic-friendly'],
  },
  {
    id: 'butter-paneer',
    title: 'Butter Paneer',
    script: 'Velvety & Indulgent',
    badge: 'RESTAURANT-STYLE DELIGHT',
    blurb: 'Silky tomato gravy enriched with butter and cream, cradling pillowy paneer — pure comfort!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🧀',
    ingredients: [
      { icon:'🧀', t:'frac',  q:250,  u:'g',     name:'paneer, cubed',              sub:'',              cal:680,  key:'paneer' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp',  name:'butter (unsalted)',           sub:'',              cal:400,  key:'butter' },
      { icon:'🥛', t:'frac',  q:100,  u:'ml',    name:'heavy cream',                sub:'',              cal:345,  key:'cream' },
      { icon:'🍅', t:'frac',  q:400,  u:'g',     name:'tomatoes, pureed',           sub:'',              cal:80,   key:'tomato' },
      { icon:'🧅', t:'frac',  q:1,    u:'large', name:'onion, roughly chopped',     sub:'',              cal:55,   key:'onion' },
      { icon:'🧄', t:'count', q:5,    u:'',      name:'garlic cloves',              sub:'',              cal:20,   key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch',  name:'ginger',                     sub:'',              cal:5,    key:'ginger' },
      { icon:'🌶️',t:'frac',  q:1.5,  u:'tsp',   name:'Kashmiri chili powder',      sub:'(for color)',   cal:9,    key:'red-chilli' },
      { icon:'✨', t:'frac',  q:1.5,  u:'tsp',   name:'garam masala',               sub:'',              cal:12,   key:'garam-masala' },
      { icon:'🍬', t:'frac',  q:1,    u:'tsp',   name:'sugar',                      sub:'',              cal:16,   key:'sugar' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                sub:'',              cal:4,    key:'cumin-seeds' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',              sub:'',             cal:0,    key:'salt' },
      { icon:'🌱', t:'frac',  q:1,    u:'tbsp',  name:'kasuri methi (dried fenugreek)', sub:'(crushed)', cal:3,   key:'kasuri-methi' },
    ],
    method: [
      { title:'MAKE THE BASE',    body:'Sauté onion, garlic, and ginger in 2 tbsp butter until golden. Add tomatoes and cook until soft. Cool slightly and blend to a very smooth paste.' },
      { title:'COOK THE GRAVY',   body:'Melt remaining butter in the same pan. Add cumin seeds. Pour in the blended gravy. Cook on medium heat, stirring, until butter separates — about 8 minutes.' },
      { title:'SPICE IT UP',      body:'Add Kashmiri chili powder, garam masala, salt, and sugar. Cook for another 5 minutes. The gravy should be deep red and glossy.' },
      { title:'ADD CREAM',        body:'Reduce heat. Stir in heavy cream gradually. Let it simmer gently for 3 minutes — do not boil after adding cream.' },
      { title:'ADD PANEER',       body:'Slide in the paneer cubes. Simmer on the lowest heat for 5 minutes so the paneer soaks up the gravy.' },
      { title:'FINISH',           body:'Crush kasuri methi between your palms and sprinkle in. Stir gently. Finish with a swirl of cream in the bowl.' },
    ],
    goodness: ['High in calcium','Protein-rich paneer','Lycopene from tomatoes','Satisfying & filling'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'The secret to restaurant colour is Kashmiri chili — it gives a brilliant red without too much heat. Don\'t skip it.',
    tags: ['Vegetarian', 'Protein-rich'],
  },
  {
    id: 'paneer-tikka-masala',
    title: 'Paneer Tikka Masala',
    script: 'Smoky & Aromatic',
    badge: 'TANDOOR-INSPIRED CLASSIC',
    blurb: 'Charred, marinated paneer tikka simmered in a spiced onion-tomato masala — best of both worlds!',
    readyMins: 50,
    baseServings: 4,
    heroEmoji: '🍢',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',             sub:'',                cal:816, key:'paneer' },
      { icon:'🥛', t:'frac',  q:150,  u:'g',    name:'thick yogurt',              sub:'(for marinade)',   cal:112, key:'yogurt' },
      { icon:'🧈', t:'frac',  q:2,    u:'tbsp', name:'butter',                    sub:'',                cal:200, key:'butter' },
      { icon:'🫗', t:'frac',  q:1,    u:'tbsp', name:'oil',                       sub:'',                cal:120, key:'oil' },
      { icon:'🥛', t:'frac',  q:75,   u:'ml',   name:'heavy cream',               sub:'',                cal:260, key:'cream' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',          sub:'',                cal:66,  key:'tomato' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',    sub:'',                cal:88,  key:'onion' },
      { icon:'🧄', t:'count', q:5,    u:'',     name:'garlic cloves, minced',     sub:'',                cal:20,  key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch', name:'ginger, grated',            sub:'',                cal:5,   key:'ginger' },
      { icon:'🌶️',t:'frac',  q:2,    u:'tsp',  name:'Kashmiri chili powder',     sub:'divided',         cal:12,  key:'red-chilli' },
      { icon:'✨', t:'frac',  q:2,    u:'tsp',  name:'garam masala',              sub:'divided',         cal:16,  key:'garam-masala' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',  name:'turmeric powder',           sub:'',                cal:8,   key:'turmeric' },
      { icon:'🌱', t:'frac',  q:1,    u:'tsp',  name:'kasuri methi',              sub:'(crushed)',       cal:3,   key:'kasuri-methi' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',             sub:'',               cal:0,   key:'salt' },
    ],
    method: [
      { title:'MARINATE PANEER',  body:'Mix yogurt with 1 tsp each chili powder, garam masala, turmeric, oil, and salt. Coat paneer cubes well. Marinate 30 minutes minimum.' },
      { title:'CHAR THE TIKKA',   body:'Grill marinated paneer on a hot pan or under the broiler until nicely charred on the edges, about 3 min per side. Set aside.' },
      { title:'BUILD MASALA',     body:'Melt butter in a pan. Sauté onion until golden. Add ginger-garlic and cook 2 minutes. Add tomato puree, remaining spices, and salt.' },
      { title:'COOK THE GRAVY',   body:'Cook the masala on medium heat until oil separates, about 10 minutes. Add a splash of water if it sticks. The deeper the colour, the richer the flavour.' },
      { title:'ADD CREAM',        body:'Lower heat. Stir in cream and kasuri methi. Simmer 3 minutes.' },
      { title:'ADD TIKKA & REST', body:'Add the charred paneer. Coat gently and simmer 5 minutes so the smoky tikka melds into the gravy. Serve immediately.' },
    ],
    goodness: ['Char adds antioxidants','Protein-rich','Calcium powerhouse','Deeply satisfying'],
    serveWith: [{ icon:'🫓', label:'Garlic Naan' }, { icon:'🧅', label:'Raw Onion Rings' }, { icon:'🍋', label:'Lime Wedge' }],
    tip: 'Don\'t skip the charring — the smoky paneer edges against the creamy gravy is what makes this dish unforgettable.',
    tags: ['Vegetarian', 'Protein-rich'],
  },
  {
    id: 'chole',
    title: 'Chole',
    script: 'Bold & Earthy',
    badge: 'PUNJABI CHANA MASALA',
    blurb: 'Chunky chickpeas simmered in a robust, tangy masala — a hearty dish with personality in every bite!',
    readyMins: 50,
    baseServings: 4,
    heroEmoji: '🧆',
    ingredients: [
      { icon:'🫘', t:'frac',  q:1.5,  u:'cups', name:'chickpeas (kabuli chana)',   sub:'(soaked overnight)', cal:540, key:'chickpeas' },
      { icon:'🍅', t:'frac',  q:3,    u:'medium',name:'tomatoes, finely chopped',  sub:'',                   cal:66,  key:'tomato' },
      { icon:'🧅', t:'count', q:2,    u:'',      name:'onions, finely chopped',    sub:'',                   cal:88,  key:'onion' },
      { icon:'🧄', t:'count', q:5,    u:'',      name:'garlic cloves, minced',     sub:'',                   cal:20,  key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch',  name:'ginger, grated',            sub:'',                   cal:5,   key:'ginger' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp',  name:'oil',                       sub:'',                   cal:360, key:'oil' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',               sub:'',                   cal:4,   key:'cumin-seeds' },
      { icon:'🌶️',t:'frac',  q:1.5,  u:'tsp',   name:'Kashmiri chili powder',     sub:'',                   cal:9,   key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',   name:'coriander powder',          sub:'',                   cal:6,   key:'coriander' },
      { icon:'✨', t:'frac',  q:1.5,  u:'tsp',   name:'chana masala powder',       sub:'',                   cal:10,  key:'garam-masala' },
      { icon:'🍋', t:'frac',  q:1.5,  u:'tbsp',  name:'amchur (dry mango powder)', sub:'(or lemon juice)',   cal:8,   key:'amchur' },
      { icon:'🍃', t:'count', q:2,    u:'',      name:'tea bags or black cardamom',sub:'(for colour)',        cal:0,   key:'tea' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',             sub:'',                  cal:0,   key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',    body:'Pressure cook soaked chickpeas with 2 tea bags or a black cardamom for 5–6 whistles. The tea gives the deep dark colour authentic chole is known for. Reserve the liquid.' },
      { title:'MAKE THE MASALA',  body:'Heat oil. Add cumin. When it sizzles, add onion and cook until deep golden — take your time here, 10 minutes minimum.' },
      { title:'GINGER-GARLIC',    body:'Add ginger and garlic. Sauté 2 minutes. Add tomatoes, all the dry spices, and salt. Cook until oil separates.' },
      { title:'BLEND HALF',       body:'Optional but recommended: blend half the masala smooth and return to pan for a thicker, restaurant-style gravy.' },
      { title:'ADD CHICKPEAS',    body:'Add the cooked chickpeas along with ½ cup of the cooking liquid. Simmer for 15–20 minutes. Mash a few chickpeas to thicken.' },
      { title:'FINISH WITH TANG', body:'Add amchur or lemon juice. Simmer 2 minutes. The sourness is what makes chole distinctive — taste and adjust.' },
    ],
    goodness: ['Very high in protein','Excellent fibre','Iron-rich legume','Keeps you full all morning'],
    serveWith: [{ icon:'🫓', label:'Bhature / Puri' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Raw Onion' }],
    tip: 'Cooking chickpeas with tea bags gives the authentic dark colour without any tea flavour. Remove the bags before adding to the masala.',
    tags: ['Vegan', 'High-protein', 'High-fibre'],
  },
  {
    id: 'dal-tadka',
    title: 'Dal Tadka',
    script: 'Humble & Soul-Warming',
    badge: "DHABHA-STYLE GOLD",
    blurb: 'Yellow lentils cooked soft and finished with a sizzling ghee tadka — the taste of every Indian roadside dhaba!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🫕',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal (split pigeon pea)', sub:'(rinsed)',      cal:350, key:'dal' },
      { icon:'🍅', t:'count', q:2,    u:'',       name:'tomatoes, chopped',          sub:'',              cal:44,  key:'tomato' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium', name:'onion, finely chopped',      sub:'',              cal:44,  key:'onion' },
      { icon:'🧄', t:'count', q:4,    u:'',       name:'garlic cloves',              sub:'(2 minced, 2 sliced)', cal:16, key:'garlic' },
      { icon:'🫙', t:'frac',  q:2,    u:'tbsp',   name:'ghee',                       sub:'(for tadka)',   cal:240, key:'ghee' },
      { icon:'🫗', t:'frac',  q:1,    u:'tbsp',   name:'oil',                        sub:'',              cal:120, key:'oil' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',    name:'cumin seeds',                sub:'',              cal:4,   key:'cumin-seeds' },
      { icon:'🌶️',t:'count', q:2,    u:'',        name:'dried red chillies',         sub:'',              cal:6,   key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',    name:'turmeric powder',            sub:'',              cal:4,   key:'turmeric' },
      { icon:'🌶️',t:'frac',  q:0.5,  u:'tsp',    name:'Kashmiri chili powder',      sub:'(for tadka)',   cal:3,   key:'red-chilli' },
      { icon:'🟤', t:'frac',  q:0.25, u:'tsp',    name:'asafoetida (hing)',           sub:'',              cal:1,   key:'hing' },
      { icon:'🧂', t:'taste', text:'',             name:'salt, to taste',              sub:'',             cal:0,   key:'salt' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',   name:'fresh coriander',             sub:'',             cal:1,   key:'coriander' },
    ],
    method: [
      { title:'PRESSURE COOK DAL', body:'Pressure cook rinsed toor dal with 2.5 cups water, turmeric, and a drop of oil for 3–4 whistles until completely soft. Mash lightly.' },
      { title:'COOK THE BASE',     body:'Heat oil in a pan. Sauté onion until golden. Add minced garlic and tomatoes. Cook until oil separates and tomato is soft.' },
      { title:'COMBINE',           body:'Add the cooked dal to the pan. Add water to reach your preferred consistency. Season with salt. Simmer 5 minutes.' },
      { title:'MAKE THE TADKA',    body:'In a small pan, heat ghee until very hot. Add cumin seeds, sliced garlic, dried red chillies, and a pinch of hing. They should sizzle and char slightly — 20 seconds.' },
      { title:'ADD CHILI',         body:'Off heat, add Kashmiri chili powder to the tadka. It will bloom instantly in the hot ghee. Swirl to mix.' },
      { title:'POUR & SERVE',      body:'Pour the sizzling tadka directly over the dal. Do not stir — let it sit on top for a dramatic presentation. Garnish with coriander.' },
    ],
    goodness: ['Plant-based protein','Excellent for digestion','Iron & B vitamins','Gut-friendly lentils'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫓', label:'Roti' }, { icon:'🥗', label:'Papad & Achaar' }],
    tip: 'The tadka must be poured over the dal piping hot — that loud sizzle when ghee hits the lentils is the soul of the dish.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'pongal',
    title: 'Pongal',
    script: 'Warm & Comforting',
    badge: 'SOUTH INDIAN TEMPLE FOOD',
    blurb: 'Soft rice and moong dal cooked together with pepper and ghee — simplicity elevated to sacred!',
    readyMins: 30,
    baseServings: 2,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🍚', t:'frac',  q:0.75, u:'cup',  name:'raw rice (sona masoori)',   sub:'',              cal:255, key:'rice' },
      { icon:'🟡', t:'frac',  q:0.25, u:'cup',  name:'yellow moong dal',          sub:'',              cal:80,  key:'moong-dal' },
      { icon:'🫙', t:'frac',  q:2.5,  u:'tbsp', name:'ghee',                      sub:'(be generous)', cal:300, key:'ghee' },
      { icon:'⚫', t:'frac',  q:1,    u:'tsp',  name:'whole black pepper',        sub:'(coarsely crushed)', cal:5, key:'pepper' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',  name:'cumin seeds',               sub:'',              cal:4,   key:'cumin-seeds' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch', name:'ginger, grated',            sub:'',              cal:5,   key:'ginger' },
      { icon:'🌿', t:'range', low:10, high:12, u:'', name:'curry leaves',          sub:'',              cal:2,   key:'curry-leaves' },
      { icon:'🥜', t:'frac',  q:2,    u:'tbsp', name:'cashews',                   sub:'',              cal:90,  key:'cashews' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',             sub:'',              cal:0,   key:'salt' },
    ],
    method: [
      { title:'DRY ROAST DAL',   body:'Dry roast moong dal until it turns light golden and smells nutty, about 3 minutes. This adds depth to the pongal.' },
      { title:'PRESSURE COOK',   body:'Combine rice and roasted dal in a pressure cooker with 3.5 cups water and salt. Cook for 4–5 whistles — it should be very soft and mushy.' },
      { title:'MASH & LOOSEN',   body:'Mash the rice-dal mixture well. Add a little hot water if needed to reach a thick porridge consistency.' },
      { title:'MAKE TADKA',      body:'Heat ghee in a small pan until hot. Fry cashews until golden. Add cumin, pepper, ginger, and curry leaves. Sizzle 30 seconds.' },
      { title:'COMBINE',         body:'Pour the tadka into the rice-dal mixture. Stir to combine. Add more ghee if it looks dry — pongal should glisten.' },
      { title:'SERVE HOT',       body:'Pongal sets quickly as it cools. Serve immediately with sambar and coconut chutney.' },
    ],
    goodness: ['Easy to digest','Warming pepper & ginger','Protein from moong dal','Temple food simplicity'],
    serveWith: [{ icon:'🥘', label:'Sambar' }, { icon:'🥥', label:'Coconut Chutney' }, { icon:'🥒', label:'Vada' }],
    tip: 'Pongal should be creamy and slightly sticky — not dry. Keep a cup of hot water nearby to loosen it while cooking.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'khichdi',
    title: 'Khichdi',
    script: 'Simple & Restorative',
    badge: "INDIA'S ULTIMATE COMFORT BOWL",
    blurb: 'Rice and lentils simmered into a gentle, golden bowl — what every Indian reaches for when the soul needs comfort!',
    readyMins: 25,
    baseServings: 2,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🍚', t:'frac',  q:0.5,  u:'cup',  name:'rice (any short-grain)',   sub:'',              cal:170, key:'rice' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'cup',  name:'yellow moong dal',         sub:'(split, washed)', cal:160, key:'moong-dal' },
      { icon:'🫙', t:'frac',  q:2,    u:'tbsp', name:'ghee',                     sub:'',              cal:240, key:'ghee' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'turmeric powder',          sub:'',              cal:4,   key:'turmeric' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',  name:'cumin seeds',              sub:'',              cal:4,   key:'cumin-seeds' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',  name:'coriander powder',         sub:'',              cal:3,   key:'coriander' },
      { icon:'🌶️',t:'count', q:1,    u:'',     name:'green chilli',             sub:'(optional)',    cal:4,   key:'green-chilli' },
      { icon:'🫚', t:'frac',  q:0.5,  u:'inch', name:'ginger, grated',           sub:'',              cal:3,   key:'ginger' },
      { icon:'🟤', t:'frac',  q:0.25, u:'tsp',  name:'asafoetida (hing)',         sub:'',              cal:1,   key:'hing' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',            sub:'',              cal:0,   key:'salt' },
    ],
    method: [
      { title:'RINSE & SOAK',   body:'Rinse rice and dal together. Soak for 15 minutes if you have time — it speeds up cooking and improves texture.' },
      { title:'PRESSURE COOK',  body:'Combine rice, dal, turmeric, and 3 cups water in a pressure cooker. Cook for 3–4 whistles until completely soft. Open and stir — it should be creamy.' },
      { title:'MAKE TADKA',     body:'Heat ghee in a small pan. Add hing, cumin seeds, ginger, and green chilli. Sizzle 30 seconds until fragrant.' },
      { title:'SEASON & COMBINE',body:'Add coriander powder to the tadka. Pour the sizzling tadka into the khichdi. Add salt. Stir well.' },
      { title:'ADJUST TEXTURE', body:'Khichdi should flow off a spoon — neither soup nor solid. Add hot water and stir to loosen if needed.' },
      { title:'SERVE',          body:'Serve hot with a generous extra spoon of ghee on top, yogurt on the side, and papad. Simple. Healing. Perfect.' },
    ],
    goodness: ['Easiest to digest','Gluten-free','Balanced protein & carbs','Ayurvedic healing food'],
    serveWith: [{ icon:'🥛', label:'Curd / Yogurt' }, { icon:'🫙', label:'Pickle' }, { icon:'🥗', label:'Papad' }],
    tip: 'A generous pour of ghee at the end is not optional — it\'s what transforms khichdi from simple food into soul food.',
    tags: ['Vegan', 'Gluten-free', 'Diabetic-friendly'],
  },

  /* ── Rasoi Magic series ─────────────────────────── */
  {
    id: 'rasoi-paneer-tikka',
    title: 'Rasoi Magic Paneer Tikka',
    script: 'Packet Magic, Real Flavour',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Juicy paneer tikka using Rasoi Magic masala — restaurant quality from a single packet!',
    readyMins: 25,
    baseServings: 3,
    heroEmoji: '🍢',
    ingredients: [
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, cubed',              sub:'',                cal:680, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',      name:'Rasoi Magic Paneer Tikka Masala packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🥛', t:'frac',  q:100,  u:'g',     name:'thick yogurt',               sub:'',                cal:75,  key:'yogurt' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',                        sub:'',                cal:240, key:'oil' },
      { icon:'🫚', t:'frac',  q:1,    u:'tbsp',  name:'lemon juice',                sub:'',                cal:3,   key:'lemon' },
      { icon:'🫑', t:'count', q:1,    u:'',      name:'capsicum, cubed',            sub:'(any colour)',    cal:25,  key:'capsicum' },
      { icon:'🧅', t:'count', q:1,    u:'',      name:'onion, cubed',               sub:'',                cal:44,  key:'onion' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MAKE MARINADE',   body:'Mix yogurt with the full Rasoi Magic packet, 1 tbsp oil, lemon juice, and a pinch of salt. The masala already has all the spice — trust the packet.' },
      { title:'MARINATE',        body:'Coat paneer, capsicum, and onion cubes in the marinade. Rest for at least 20 minutes — overnight gives maximum flavour.' },
      { title:'SKEWER & COOK',   body:'Thread onto skewers alternating paneer, capsicum, onion. Grill on a hot pan or oven (220°C) for 8–10 minutes, turning halfway.' },
      { title:'CHAR & SERVE',    body:'Brush with oil and give it a final high-heat blast for char marks. Serve immediately with mint chutney.' },
    ],
    goodness: ['High in calcium','Protein-rich','Quick weeknight dish','No masala measuring needed'],
    serveWith: [{ icon:'🌿', label:'Mint Chutney' }, { icon:'🧅', label:'Onion Rings' }, { icon:'🍋', label:'Lemon Wedge' }],
    tip: 'The Rasoi Magic packet already has salt — add extra only after tasting the marinade, not before.',
    tags: ['Vegetarian', 'Protein-rich'],
  },
  {
    id: 'rasoi-butter-chicken',
    title: 'Rasoi Magic Butter Chicken',
    script: 'Shortcut to Soul Food',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'The beloved murgh makhani — silky, rich, and perfectly spiced with the Rasoi Magic packet!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🍗',
    ingredients: [
      { icon:'🍗', t:'frac',  q:600,  u:'g',    name:'boneless chicken, cubed',    sub:'',                cal:900, key:'chicken' },
      { icon:'📦', t:'count', q:1,    u:'',      name:'Rasoi Magic Butter Chicken Masala packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🧈', t:'frac',  q:3,    u:'tbsp',  name:'butter',                     sub:'',                cal:300, key:'butter' },
      { icon:'🥛', t:'frac',  q:100,  u:'ml',   name:'heavy cream',                sub:'',                cal:345, key:'cream' },
      { icon:'🍅', t:'frac',  q:400,  u:'g',    name:'tomato puree (canned OK)',    sub:'',                cal:80,  key:'tomato' },
      { icon:'🥛', t:'frac',  q:3,    u:'tbsp',  name:'yogurt',                     sub:'(for marinade)',  cal:30,  key:'yogurt' },
      { icon:'🍬', t:'frac',  q:1,    u:'tsp',   name:'sugar',                      sub:'',                cal:16,  key:'sugar' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MARINATE',        body:'Mix chicken with yogurt and half the Rasoi Magic packet. Marinate 30 minutes.' },
      { title:'COOK CHICKEN',    body:'Sear marinated chicken in 1 tbsp butter on high heat until cooked and lightly charred. Remove and set aside.' },
      { title:'MAKE GRAVY',      body:'Melt remaining butter. Add tomato puree and the rest of the Rasoi Magic packet. Cook on medium until butter separates, about 8 minutes.' },
      { title:'FINISH',          body:'Add sugar, cream, and chicken. Simmer on low for 5 minutes. Do not boil after adding cream — low and slow keeps it silky.' },
    ],
    goodness: ['High in protein','Lycopene from tomatoes','Quick to prepare','Crowd pleaser'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'Use canned tomato puree instead of fresh — it\'s richer, more consistent, and cuts 10 minutes off cooking time.',
    tags: ['High-protein'],
  },
  {
    id: 'rasoi-chole',
    title: 'Rasoi Magic Chole',
    script: 'Dhaba Taste, Home Kitchen',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Bold, tangy, deep-coloured chole made easy with the iconic Rasoi Magic masala packet!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🧆',
    ingredients: [
      { icon:'🫘', t:'frac',  q:400,  u:'g',    name:'chickpeas (canned or cooked)', sub:'',               cal:480, key:'chickpeas' },
      { icon:'📦', t:'count', q:1,    u:'',      name:'Rasoi Magic Chhole Masala packet', sub:'(50g)',      cal:60,  key:'masala' },
      { icon:'🧅', t:'count', q:2,    u:'',      name:'onions, finely chopped',       sub:'',               cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',      name:'tomatoes, chopped',            sub:'',               cal:66,  key:'tomato' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp',  name:'oil',                          sub:'',               cal:360, key:'oil' },
      { icon:'🧄', t:'count', q:4,    u:'',      name:'garlic cloves, minced',        sub:'',               cal:16,  key:'garlic' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK ONION',      body:'Heat oil. Sauté onion until deep golden. Add garlic and cook 1 minute.' },
      { title:'ADD TOMATO',      body:'Add tomatoes and cook until oil separates, about 8 minutes.' },
      { title:'ADD MASALA',      body:'Add the full Rasoi Magic packet and stir well. Cook the masala for 3 minutes until fragrant.' },
      { title:'ADD CHICKPEAS',   body:'Add chickpeas with ½ cup water. Simmer 10–12 minutes, mashing a few for thickness. Season with salt.' },
    ],
    goodness: ['High in protein','Excellent fibre','Iron-rich','Ready in 30 minutes'],
    serveWith: [{ icon:'🫓', label:'Bhature' }, { icon:'🍚', label:'Rice' }, { icon:'🧅', label:'Raw Onion' }],
    tip: 'Canned chickpeas save 40 minutes. Drain and rinse them well before adding — this removes the tinny flavour.',
    tags: ['Vegan', 'High-protein', 'High-fibre'],
  },

  /* ── Dal series ─────────────────────────────────── */
  {
    id: 'mango-dal',
    title: 'Mamidikaya Pappu',
    script: 'Tangy & Summery',
    badge: 'RAW MANGO TOOR DAL',
    blurb: 'Toor dal slow-cooked with sour green mango — a tangy Andhra summer classic that pairs perfectly with rice!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🥭',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal (split pigeon pea)', sub:'(rinsed)',       cal:350, key:'dal' },
      { icon:'🥭', t:'frac',  q:1,    u:'medium',name:'raw green mango, chopped',    sub:'(peeled, firm)', cal:60,  key:'mango' },
      { icon:'🌶️',t:'count', q:3,    u:'',      name:'green chillies, slit',        sub:'',               cal:12,  key:'green-chilli' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, chopped',              sub:'(optional)',     cal:44,  key:'onion' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:1.5,  u:'tbsp',  name:'ghee',                        sub:'(for tadka)',    cal:180, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                 sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🔴', t:'count', q:2,    u:'',      name:'dried red chillies',          sub:'',               cal:6,   key:'red-chilli' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Add rinsed dal, mango pieces, green chillies, onion, turmeric, and 2.5 cups water to pressure cooker. Cook 3–4 whistles until dal is completely soft.' },
      { title:'MASH & SEASON',   body:'Open and mash the dal. The mango will dissolve into the dal, giving a beautiful tartness. Add salt and adjust water for consistency.' },
      { title:'TADKA',           body:'Heat ghee until hot. Add mustard seeds. When they pop, add cumin, dried red chillies, and curry leaves. Sizzle 30 seconds.' },
      { title:'POUR & SERVE',    body:'Pour the sizzling tadka over the dal. Stir gently and serve hot with steamed rice and a spoon of ghee.' },
    ],
    goodness: ['Vitamin C from mango','High in protein','Natural tanginess without tamarind','Iron-rich lentils'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🥒', label:'Papad' }],
    tip: 'Use a firm, very sour raw mango — not a ripe one. The more sour, the better the dal. Taste and add a squeeze of lemon if needed.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'dosakai-dal',
    title: 'Dosakai Pappu',
    script: 'Mild & Comforting',
    badge: 'YELLOW CUCUMBER DAL',
    blurb: 'Toor dal cooked with tender dosakai — a gentle, mildly tangy Andhra dal that is pure home cooking!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🥒',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🥒', t:'frac',  q:2,    u:'cups',  name:'dosakai (yellow cucumber), cubed', sub:'(peeled, deseeded)', cal:30, key:'dosakai' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, slit',        sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:1.5,  u:'tbsp',  name:'ghee',                        sub:'',               cal:180, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                 sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🔴', t:'count', q:2,    u:'',      name:'dried red chillies',          sub:'',               cal:6,   key:'red-chilli' },
      { icon:'🧄', t:'count', q:3,    u:'',      name:'garlic cloves, crushed',      sub:'',               cal:12,  key:'garlic' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Combine dal, dosakai, green chillies, and turmeric in cooker with 2.5 cups water. Cook 3 whistles — dosakai becomes very soft and melts into the dal.' },
      { title:'MASH',            body:'Open and mash well. Dosakai gives the dal a subtle tartness and creamy body. Season with salt.' },
      { title:'TADKA',           body:'Heat ghee. Add mustard seeds, then cumin, garlic, red chillies, and curry leaves. Fry until garlic is golden.' },
      { title:'COMBINE',         body:'Pour the tadka into the dal, stir, and simmer 2 minutes. Serve with rice and a generous spoon of ghee.' },
    ],
    goodness: ['Low calorie vegetable','High in protein','Easy on digestion','Cooling dosakai'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🫙', label:'Pickle' }],
    tip: 'Deseed the dosakai before using — the seeds make the dal bitter. The flesh should look like a pale yellow cucumber.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'palak-dal',
    title: 'Palak Pappu',
    script: 'Green & Nourishing',
    badge: 'SPINACH TOOR DAL',
    blurb: 'Iron-rich spinach and protein-packed toor dal simmered together — the most nutritious bowl in your kitchen!',
    readyMins: 28,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🌿', t:'frac',  q:200,  u:'g',     name:'fresh spinach (palak)',       sub:'(roughly chopped)', cal:46, key:'spinach' },
      { icon:'🍅', t:'count', q:1,    u:'',      name:'tomato, chopped',             sub:'',               cal:22,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, slit',        sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:1.5,  u:'tbsp',  name:'ghee',                        sub:'',               cal:180, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                 sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🧄', t:'count', q:3,    u:'',      name:'garlic cloves',               sub:'',               cal:12,  key:'garlic' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Pressure cook dal with tomato, green chillies, turmeric, and 2.5 cups water for 3 whistles.' },
      { title:'ADD SPINACH',     body:'Open the cooker. Add spinach to the hot dal — it will wilt in 2 minutes from residual heat. Stir and mash gently.' },
      { title:'SEASON',          body:'Add salt and simmer open on low heat for 5 minutes to let flavours meld.' },
      { title:'TADKA',           body:'Heat ghee. Add mustard seeds. When they pop, add cumin, garlic, and curry leaves. Pour over dal and serve.' },
    ],
    goodness: ['Rich in iron','High in protein','Folate from spinach','Low calorie'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫓', label:'Roti' }, { icon:'🫙', label:'Ghee' }],
    tip: 'Add spinach after pressure cooking, not inside — it stays greener, brighter, and more nutritious.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'gongura-dal',
    title: 'Gongura Pappu',
    script: 'Tangy & Distinctive',
    badge: 'SORREL LEAF TOOR DAL',
    blurb: 'Toor dal with tangy sorrel leaves — the bold, sour taste of Andhra in its most beloved form!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🌱',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🌱', t:'frac',  q:100,  u:'g',     name:'gongura leaves (red sorrel)', sub:'(stalks removed)', cal:30, key:'gongura' },
      { icon:'🌶️',t:'count', q:3,    u:'',      name:'green chillies',             sub:'',               cal:12,  key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:2,    u:'tbsp',  name:'ghee',                        sub:'',               cal:240, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                 sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🧄', t:'count', q:4,    u:'',      name:'garlic cloves, crushed',      sub:'',               cal:16,  key:'garlic' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🔴', t:'count', q:2,    u:'',      name:'dried red chillies',          sub:'',               cal:6,   key:'red-chilli' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Pressure cook dal with gongura leaves, green chillies, and turmeric for 3–4 whistles. The gongura will completely melt into the dal.' },
      { title:'MASH',            body:'Mash the dal thoroughly. The gongura gives it a beautiful deep red-green colour and intense sourness. Season with salt.' },
      { title:'TADKA',           body:'Heat ghee until very hot. Add mustard seeds, cumin, crushed garlic, red chillies, and curry leaves. Let garlic turn golden.' },
      { title:'FINISH',          body:'Pour the sizzling tadka over the dal. Stir once and serve immediately — gongura pappu is best piping hot.' },
    ],
    goodness: ['Antioxidant-rich gongura','High in protein','Naturally sour — no tamarind needed','Iron-rich combo'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🧅', label:'Raw Onion' }],
    tip: 'Use green gongura for milder sourness, red-stalked gongura for intense tang. Both are correct — it\'s a matter of taste.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'pappu-pulusu',
    title: 'Pappu Pulusu',
    script: 'Sweet, Sour & Spicy',
    badge: 'ANDHRA DAL CURRY',
    blurb: 'A uniquely Andhra dal that balances sweet jaggery, sour tamarind, and fiery chilli in one bowl!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🟡', t:'frac',  q:0.75, u:'cup',  name:'toor dal',                   sub:'(rinsed)',         cal:265, key:'dal' },
      { icon:'🟤', t:'frac',  q:2,    u:'tbsp', name:'tamarind paste',             sub:'(or lemon-sized ball soaked)', cal:15, key:'tamarind' },
      { icon:'🍬', t:'frac',  q:1,    u:'tsp',  name:'jaggery (or brown sugar)',   sub:'',                cal:16,  key:'sugar' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, finely chopped',     sub:'',                cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, chopped',          sub:'',                cal:44,  key:'tomato' },
      { icon:'🌶️',t:'count', q:3,    u:'',     name:'green chillies, slit',       sub:'',                cal:12,  key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'turmeric powder',            sub:'',                cal:4,   key:'turmeric' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil',                        sub:'',                cal:240, key:'oil' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',  name:'mustard seeds',              sub:'',                cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',  name:'cumin seeds',                sub:'',                cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',           sub:'',                cal:2,   key:'curry-leaves' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Pressure cook dal with tomato, green chillies, and turmeric for 3 whistles until soft. Mash well.' },
      { title:'COOK ONION',      body:'In a separate pan, heat oil. Temper mustard seeds, cumin, and curry leaves. Add onion and sauté until golden.' },
      { title:'ADD TAMARIND',    body:'Add the mashed dal to the pan. Stir in tamarind paste and 1–1.5 cups water. Bring to a boil.' },
      { title:'BALANCE FLAVOURS',body:'Add jaggery and salt. Simmer 10 minutes — this is where the magic happens: sour, sweet, and spicy merge together. Taste and balance.' },
    ],
    goodness: ['Unique flavour balance','High in protein','Natural sweetness from jaggery','Comfort food classic'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🥒', label:'Papad' }],
    tip: 'The jaggery is not optional — it is what separates pappu pulusu from regular dal. Start with 1 tsp and adjust to your taste.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'bacchali-dal',
    title: 'Bacchali Pappu',
    script: 'Slippery & Soothing',
    badge: 'MALABAR SPINACH DAL',
    blurb: 'Malabar spinach leaves cooked into toor dal — a slightly slimy, deeply nourishing Andhra dal!',
    readyMins: 28,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🌿', t:'frac',  q:150,  u:'g',     name:'bacchali (Malabar spinach)', sub:'(leaves & tender stems)', cal:25, key:'bacchali' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies',             sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:1.5,  u:'tbsp',  name:'ghee',                        sub:'',               cal:180, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🔴', t:'count', q:2,    u:'',      name:'dried red chillies',          sub:'',               cal:6,   key:'red-chilli' },
      { icon:'🧄', t:'count', q:3,    u:'',      name:'garlic cloves',               sub:'',               cal:12,  key:'garlic' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Cook dal with bacchali leaves, green chillies, and turmeric for 3 whistles. The leaves will completely blend into the dal, making it slimy and thick.' },
      { title:'MASH & SEASON',   body:'Mash everything together. The natural mucilage from bacchali gives this dal its signature slippery texture. Season with salt.' },
      { title:'TADKA',           body:'Heat ghee until hot. Add mustard seeds, dried red chillies, garlic, and curry leaves. Fry until garlic turns light golden.' },
      { title:'SERVE',           body:'Pour the tadka over the dal. Serve immediately with hot rice — bacchali pappu thickens as it sits, so eat it fresh.' },
    ],
    goodness: ['Rich in calcium','High in protein','Aids digestion','Cooling greens'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🫙', label:'Pickle' }],
    tip: 'The slippery texture is completely normal and desirable — it is the whole point of bacchali. Don\'t mistake it for overcooking.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },
  {
    id: 'methi-dal',
    title: 'Methi Pappu',
    script: 'Bitter & Beautiful',
    badge: 'FENUGREEK LEAF DAL',
    blurb: 'Toor dal with fresh fenugreek leaves — a slightly bitter, deeply flavourful dal that is good for you in every way!',
    readyMins: 28,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🌿', t:'frac',  q:100,  u:'g',     name:'fresh methi leaves (fenugreek)', sub:'(cleaned)',   cal:25,  key:'methi' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium',name:'onion, chopped',              sub:'',               cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',      name:'tomato, chopped',             sub:'',               cal:22,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies',             sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:1.5,  u:'tbsp',  name:'ghee',                        sub:'',               cal:180, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',   name:'cumin seeds',                 sub:'',               cal:4,   key:'cumin-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Pressure cook dal with tomato, green chillies, and turmeric for 3 whistles. Mash well.' },
      { title:'COOK METHI',      body:'In a pan, heat ghee. Sauté onion until golden. Add methi leaves and cook 5 minutes — the bitterness mellows significantly.' },
      { title:'COMBINE',         body:'Add the cooked dal to the pan. Add salt and ½ cup water if needed. Simmer together for 5 minutes.' },
      { title:'TADKA',           body:'Make a quick tadka with mustard seeds, cumin, and curry leaves in the same ghee. Pour over the dal and serve.' },
    ],
    goodness: ['Blood sugar regulation','High in protein','Iron-rich greens','Digestive benefits'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫓', label:'Roti' }, { icon:'🫙', label:'Ghee' }],
    tip: 'Salt the methi leaves and let them sit for 5 minutes before cooking — this draws out some bitterness. Squeeze and discard the water.',
    tags: ['Vegan', 'High-protein', 'Gluten-free', 'Diabetic-friendly'],
  },
  {
    id: 'sambar',
    title: 'Sambar',
    script: 'The Soul of South India',
    badge: 'SOUTH INDIAN DAL CURRY',
    blurb: 'Tangy, spiced toor dal curry packed with vegetables — the dish that makes every South Indian meal complete!',
    readyMins: 40,
    baseServings: 6,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',   name:'toor dal',                   sub:'(rinsed)',        cal:350, key:'dal' },
      { icon:'🍆', t:'count', q:1,    u:'',      name:'small brinjal (eggplant), quartered', sub:'',       cal:20,  key:'brinjal' },
      { icon:'🥕', t:'count', q:1,    u:'',      name:'carrot, diced',               sub:'',               cal:25,  key:'carrot' },
      { icon:'🧅', t:'count', q:8,    u:'',      name:'shallots (sambar onions)',     sub:'(peeled whole)', cal:40,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',      name:'tomatoes, quartered',         sub:'',               cal:44,  key:'tomato' },
      { icon:'🟤', t:'frac',  q:2,    u:'tbsp',  name:'tamarind paste',              sub:'',               cal:15,  key:'tamarind' },
      { icon:'📦', t:'frac',  q:2,    u:'tbsp',  name:'sambar powder',               sub:'',               cal:20,  key:'masala' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',   name:'turmeric powder',             sub:'',               cal:4,   key:'turmeric' },
      { icon:'🫙', t:'frac',  q:2,    u:'tbsp',  name:'ghee or oil',                 sub:'',               cal:240, key:'ghee' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',   name:'mustard seeds',               sub:'',               cal:8,   key:'mustard-seeds' },
      { icon:'🌿', t:'range', low:10, high:12, u:'', name:'curry leaves',            sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',  name:'fresh coriander',             sub:'',               cal:1,   key:'coriander' },
    ],
    method: [
      { title:'COOK DAL',        body:'Pressure cook dal with turmeric and 2 cups water for 4 whistles. Mash until smooth.' },
      { title:'COOK VEGETABLES', body:'In a pot, add 2 cups water with shallots, brinjal, carrot, and tomatoes. Boil until vegetables are just tender, about 8 minutes.' },
      { title:'ADD DAL & TAMARIND', body:'Add the mashed dal and tamarind paste to the vegetables. Stir in sambar powder and salt. Simmer 10–12 minutes.' },
      { title:'TADKA',           body:'Heat ghee. Add mustard seeds. When they pop, add curry leaves. Pour over the sambar. Finish with coriander.' },
    ],
    goodness: ['Packed with vegetables','High in protein','Probiotic-friendly','Complete meal in a bowl'],
    serveWith: [{ icon:'🥞', label:'Idly / Dosa' }, { icon:'🍚', label:'Steamed Rice' }, { icon:'🥒', label:'Medu Vada' }],
    tip: 'The secret to restaurant sambar is cooking the vegetables separately from the dal — they stay firm while the dal stays smooth.',
    tags: ['Vegan', 'High-protein', 'Gluten-free'],
  },

  /* ── South Indian tiffin ────────────────────────── */
  {
    id: 'idly',
    title: 'Idly',
    script: 'Cloud-Soft & Ancient',
    badge: 'STEAMED RICE CAKES',
    blurb: 'Fermented rice and lentil cakes steamed to perfection — the lightest, most digestible breakfast on earth!',
    readyMins: 20,
    baseServings: 4,
    heroEmoji: '🥞',
    ingredients: [
      { icon:'🍚', t:'frac',  q:3,    u:'cups',  name:'idly rice (parboiled rice)', sub:'(soaked 6 hrs)',  cal:1020, key:'rice' },
      { icon:'⚪', t:'frac',  q:1,    u:'cup',   name:'urad dal (split black gram)', sub:'(soaked 6 hrs)', cal:280,  key:'urad-dal' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'fenugreek seeds (methi)',    sub:'(soaked with dal)',cal:8,   key:'methi' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'GRIND',           body:'Grind soaked urad dal (with methi) with minimal water until light and fluffy. Grind rice coarsely. Mix together in a large bowl with salt.' },
      { title:'FERMENT',         body:'Cover loosely and ferment 8–12 hours in a warm place (the batter should rise and turn bubbly). This is non-negotiable for soft idlies.' },
      { title:'PREPARE MOULD',   body:'Grease idly plates. Stir the batter gently — don\'t over-mix and deflate the bubbles.' },
      { title:'STEAM',           body:'Fill moulds ¾ full. Steam on medium heat for exactly 10 minutes. A toothpick should come out clean.' },
      { title:'SERVE',           body:'Rest 2 minutes before unmoulding — they will release cleanly. Serve hot with sambar and chutneys.' },
    ],
    goodness: ['Probiotic from fermentation','Zero oil','Easy to digest','Perfect for all ages'],
    serveWith: [{ icon:'🍲', label:'Sambar' }, { icon:'🥥', label:'Coconut Chutney' }, { icon:'🫙', label:'Gunpowder' }],
    tip: 'The batter ratio matters: 3:1 rice to dal. And the grinder matters — a wet grinder makes lighter, fluffier idlies than a blender.',
    tags: ['Vegan', 'Gluten-free', 'Light'],
  },
  {
    id: 'dosa',
    title: 'Dosa',
    script: 'Crispy, Thin & Golden',
    badge: 'FERMENTED RICE CREPE',
    blurb: 'Paper-thin, lacy, golden crepes with crispy edges — the most versatile dish in South Indian cooking!',
    readyMins: 15,
    baseServings: 4,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'🍚', t:'frac',  q:3,    u:'cups',  name:'idly rice',                  sub:'(soaked 6 hrs)',  cal:1020, key:'rice' },
      { icon:'⚪', t:'frac',  q:1,    u:'cup',   name:'urad dal',                   sub:'(soaked 6 hrs)', cal:280,  key:'urad-dal' },
      { icon:'🟤', t:'frac',  q:0.5,  u:'tsp',   name:'fenugreek seeds',             sub:'',               cal:8,    key:'methi' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp',  name:'oil or ghee',                sub:'(for cooking)',   cal:360,  key:'oil' },
    ],
    method: [
      { title:'BATTER',          body:'Use idly batter (same recipe), but thin it slightly more with water — dosa batter should flow like thin cream, thinner than idly batter.' },
      { title:'HEAT THE TAWA',   body:'Heat a cast-iron or non-stick tawa on high until very hot. Sprinkle a few drops of water — they should evaporate instantly.' },
      { title:'POUR & SPREAD',   body:'Pour a ladle of batter in the centre. Immediately spiral outward with the back of the ladle in circular motions to make a thin disc.' },
      { title:'ADD OIL & COOK',  body:'Drizzle oil or ghee around the edges. Cook on medium-high until the edges crisp and release — do not flip for plain dosa.' },
      { title:'SERVE',           body:'Fold in half or roll. Serve immediately — a dosa waits for no one.' },
    ],
    goodness: ['Probiotic fermented batter','Low in fat','Energy-rich','Naturally gluten-free'],
    serveWith: [{ icon:'🥥', label:'Coconut Chutney' }, { icon:'🍲', label:'Sambar' }, { icon:'🥔', label:'Potato Masala' }],
    tip: 'The tawa must be very hot and then briefly wiped with an oiled cloth before each dosa — this is the ritual that gives you crispy, non-stick results.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'uttapam',
    title: 'Uttapam',
    script: 'Thick, Soft & Topped',
    badge: 'SOUTH INDIAN PANCAKE',
    blurb: 'A thick, soft dosa pancake topped with onions, tomatoes and chillies — a breakfast that is a meal in itself!',
    readyMins: 20,
    baseServings: 4,
    heroEmoji: '🥞',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,    u:'cups',  name:'idly/dosa batter',           sub:'(fermented)',     cal:680, key:'rice' },
      { icon:'🧅', t:'frac',  q:1,    u:'large', name:'onion, finely chopped',       sub:'',               cal:55,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',      name:'tomatoes, finely chopped',    sub:'(deseeded)',      cal:44,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, finely chopped', sub:'',            cal:8,   key:'green-chilli' },
      { icon:'🌱', t:'frac',  q:3,    u:'tbsp',  name:'fresh coriander, chopped',    sub:'',               cal:2,   key:'coriander' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp',  name:'oil or ghee',                sub:'(for cooking)',   cal:360, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MIX TOPPINGS',    body:'Combine chopped onion, tomato, green chilli, and coriander in a bowl. Season with a pinch of salt.' },
      { title:'POUR THICK',      body:'On a heated tawa, pour a full ladle of batter. Do NOT spread thin — just let it settle into a 6-inch circle about 5mm thick.' },
      { title:'ADD TOPPINGS',    body:'Immediately scatter the chopped topping mix generously over the surface. Press lightly.' },
      { title:'COOK COVERED',    body:'Drizzle oil around the edges. Cover with a lid and cook on medium heat for 3–4 minutes until the bottom is golden.' },
      { title:'FLIP',            body:'Flip carefully and cook the topping side for 2 minutes until the onions char slightly. Serve hot.' },
    ],
    goodness: ['Probiotic batter','Loaded with vegetables','Satisfying & filling','No heavy masala'],
    serveWith: [{ icon:'🥥', label:'Coconut Chutney' }, { icon:'🍲', label:'Sambar' }, { icon:'🫙', label:'Tomato Chutney' }],
    tip: 'The only difference between dosa and uttapam is thickness and direction — more batter, no spreading, covered cooking. Same batter, different result.',
    tags: ['Vegan', 'Gluten-free'],
  },

  /* ── Stir fries & fusion ────────────────────────── */
  {
    id: 'broccoli-garlic',
    title: 'Broccoli Garlic Stir Fry',
    script: 'Quick & Vibrant',
    badge: 'INDO-CHINESE STIR FRY',
    blurb: 'Crisp broccoli florets tossed with fried garlic, chilli, and soy — ready in 10 minutes flat!',
    readyMins: 12,
    baseServings: 2,
    heroEmoji: '🥦',
    ingredients: [
      { icon:'🥦', t:'frac',  q:400,  u:'g',    name:'broccoli, cut into florets', sub:'',               cal:136, key:'broccoli' },
      { icon:'🧄', t:'count', q:6,    u:'',     name:'garlic cloves, thinly sliced', sub:'',             cal:24,  key:'garlic' },
      { icon:'🌶️',t:'count', q:2,    u:'',     name:'dried red chillies',          sub:'',               cal:6,   key:'red-chilli' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil',                         sub:'',               cal:240, key:'oil' },
      { icon:'🫙', t:'frac',  q:1,    u:'tbsp', name:'soy sauce',                   sub:'(low sodium OK)', cal:8,  key:'soy' },
      { icon:'🌿', t:'frac',  q:0.5,  u:'tsp',  name:'sesame oil',                  sub:'(finishing)',    cal:20,  key:'sesame-oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt & pepper, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'BLANCH',          body:'Blanch broccoli in boiling salted water for exactly 90 seconds. Drain and immediately plunge into cold water — this keeps it bright green and crisp.' },
      { title:'FRY GARLIC',      body:'Heat oil in a wok on very high heat. Add sliced garlic and dried red chillies. Fry until garlic is golden at the edges — 60 seconds. Watch it closely.' },
      { title:'STIR FRY',        body:'Add the blanched broccoli. Toss on high heat for 2 minutes — you want heat, not steam. The broccoli should look glossy.' },
      { title:'SEASON',          body:'Add soy sauce and a pinch of pepper. Toss 30 seconds more. Finish with a drizzle of sesame oil off heat.' },
    ],
    goodness: ['Very low calorie','High in vitamin C','Rich in antioxidants','Gluten-free option'],
    serveWith: [{ icon:'🍚', label:'Fried Rice' }, { icon:'🍜', label:'Noodles' }, { icon:'🥣', label:'As a Side' }],
    tip: 'The cold water plunge after blanching is what keeps broccoli crispy and electric-green. Skip it and you get army-green mush.',
    tags: ['Vegan', 'Gluten-free', 'Low-calorie'],
  },
  {
    id: 'broccoli-besan',
    title: 'Broccoli Besan',
    script: 'Crispy & Spiced',
    badge: 'ROASTED GRAM FLOUR COATING',
    blurb: 'Broccoli florets roasted with a spiced besan coating — crispy, flavourful, and surprisingly addictive!',
    readyMins: 20,
    baseServings: 2,
    heroEmoji: '🥦',
    ingredients: [
      { icon:'🥦', t:'frac',  q:400,  u:'g',    name:'broccoli, cut into small florets', sub:'',          cal:136, key:'broccoli' },
      { icon:'🟤', t:'frac',  q:4,    u:'tbsp', name:'besan (chickpea flour)',        sub:'',              cal:160, key:'besan' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'turmeric powder',              sub:'',              cal:4,   key:'turmeric' },
      { icon:'🌶️',t:'frac',  q:1,    u:'tsp',  name:'Kashmiri chili powder',        sub:'',              cal:6,   key:'red-chilli' },
      { icon:'🥄', t:'frac',  q:0.5,  u:'tsp',  name:'cumin powder',                 sub:'',              cal:4,   key:'cumin-seeds' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'amchur (dry mango powder)',    sub:'(or lemon)',    cal:3,   key:'amchur' },
      { icon:'🧄', t:'count', q:3,    u:'',     name:'garlic cloves, grated',        sub:'',              cal:12,  key:'garlic' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil',                          sub:'',              cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MAKE SPICED BESAN', body:'Mix besan with turmeric, chili powder, cumin, amchur, grated garlic, salt, and 1 tbsp oil. Add just enough water (2–3 tbsp) to make a thick paste — not runny.' },
      { title:'COAT',             body:'Toss broccoli florets in the besan paste until evenly coated. Don\'t add too much water — you want a dry coat, not a batter.' },
      { title:'ROAST',            body:'Spread in a single layer on a baking tray. Drizzle with remaining oil. Roast at 220°C for 18–20 minutes, flipping halfway, until besan crust is golden and crispy.' },
      { title:'SERVE',            body:'Serve hot immediately — the crispy besan coating softens as it cools. Squeeze lemon juice right before eating.' },
    ],
    goodness: ['High in protein (besan)','Rich in vitamin C','Fibre-rich','Gluten-free option'],
    serveWith: [{ icon:'🌿', label:'Mint Chutney' }, { icon:'🍋', label:'Lemon Wedge' }, { icon:'🥗', label:'As a Snack' }],
    tip: 'Preheat the oven well and use the top rack — besan needs high, dry heat to crisp up. A wet oven steams it instead of roasting.',
    tags: ['Vegan', 'Protein-rich', 'Gluten-free'],
  },

  /* ── Andhra classics ────────────────────────────── */
  {
    id: 'pesarattu',
    title: 'Pesarattu',
    script: 'Crispy & Protein-Packed',
    badge: 'ANDHRA GREEN MOONG CREPE',
    blurb: 'Thin, crispy crepes made from whole green moong — no fermentation needed, and ready in minutes!',
    readyMins: 20,
    baseServings: 2,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'💚', t:'frac',  q:1,    u:'cup',   name:'whole green moong dal',       sub:'(soaked 4–6 hrs)', cal:350, key:'moong-dal' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies',              sub:'',                 cal:8,   key:'green-chilli' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch',  name:'ginger',                      sub:'',                 cal:5,   key:'ginger' },
      { icon:'🟡', t:'frac',  q:0.25, u:'tsp',   name:'cumin seeds',                 sub:'',                 cal:2,   key:'cumin-seeds' },
      { icon:'🧅', t:'frac',  q:0.5,  u:'medium',name:'onion, finely chopped',       sub:'(for topping)',    cal:22,  key:'onion' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp',  name:'fresh coriander, chopped',    sub:'(for topping)',    cal:1,   key:'coriander' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp',  name:'oil',                         sub:'(for cooking)',    cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'GRIND',           body:'Drain soaked moong. Blend with green chillies, ginger, cumin, and salt using just enough water to make a smooth, thick batter — thicker than dosa batter.' },
      { title:'HEAT THE TAWA',   body:'Heat a flat pan on high until very hot. Sprinkle a few drops of water — they should evaporate instantly. Reduce to medium-high.' },
      { title:'POUR & SPREAD',   body:'Pour a ladle of batter and spread thin in circular motions, just like dosa. The key is spreading while the pan is hot.' },
      { title:'ADD TOPPINGS',    body:'Scatter a pinch of chopped onion and coriander over the surface. Press lightly.' },
      { title:'COOK & FOLD',     body:'Drizzle oil around the edges and in the centre. Cook until edges crisp and turn golden. Fold and serve immediately.' },
    ],
    goodness: ['Very high in protein','No fermentation needed','Gluten-free','Low glycemic index'],
    serveWith: [{ icon:'🫙', label:'Allam Chutney' }, { icon:'🥥', label:'Coconut Chutney' }, { icon:'☕', label:'Filter Coffee' }],
    tip: 'The batter must be thick — it should not flow on its own when poured. Add water sparingly. A thin batter gives a flat, soft pesarattu.',
    tags: ['Vegan', 'Gluten-free', 'High-protein', 'Diabetic-friendly'],
  },
  {
    id: 'gongura-chicken',
    title: 'Gongura Chicken',
    script: 'Bold, Tangy & Fiery',
    badge: 'ANDHRA SORREL CHICKEN',
    blurb: 'Tender chicken slow-cooked in tangy gongura leaves and fiery spices — the crown jewel of Andhra cuisine!',
    readyMins: 55,
    baseServings: 4,
    heroEmoji: '🍗',
    ingredients: [
      { icon:'🍗', t:'frac',  q:800,  u:'g',    name:'chicken (bone-in pieces)',    sub:'',                cal:1200, key:'chicken' },
      { icon:'🌱', t:'frac',  q:200,  u:'g',    name:'gongura leaves (red sorrel)', sub:'(stalks removed)', cal:50,  key:'gongura' },
      { icon:'🧅', t:'count', q:3,    u:'',     name:'onions, sliced',              sub:'',                cal:132,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, chopped',           sub:'',                cal:44,   key:'tomato' },
      { icon:'🧄', t:'count', q:8,    u:'',     name:'garlic cloves',               sub:'',                cal:32,   key:'garlic' },
      { icon:'🫚', t:'frac',  q:1.5,  u:'inch', name:'ginger',                      sub:'',                cal:8,    key:'ginger' },
      { icon:'🌶️',t:'frac',  q:6,    u:'',     name:'dried red chillies',          sub:'(Guntur preferred)', cal:18, key:'red-chilli' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',  name:'mustard seeds',               sub:'',                cal:8,    key:'mustard-seeds' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',  name:'cumin seeds',                 sub:'',                cal:4,    key:'cumin-seeds' },
      { icon:'✨', t:'frac',  q:1.5,  u:'tsp',  name:'garam masala',                sub:'',                cal:12,   key:'garam-masala' },
      { icon:'🫗', t:'frac',  q:4,    u:'tbsp', name:'oil',                         sub:'',                cal:480,  key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK GONGURA',    body:'Heat 2 tbsp oil. Fry dried red chillies briefly, then add gongura leaves. Cook until completely wilted and soft, about 8 minutes. Cool and blend to a paste.' },
      { title:'BROWN THE CHICKEN', body:'In a heavy kadhai, heat remaining oil. Add chicken pieces and fry on high heat until golden on all sides. Remove and set aside.' },
      { title:'BUILD THE MASALA',body:'In the same oil, temper mustard and cumin. Add onions and fry until deep golden. Add ginger-garlic and cook 2 minutes. Add tomatoes and cook until oil separates.' },
      { title:'ADD GONGURA',     body:'Add the blended gongura paste and garam masala. Cook the combined masala for 5 minutes — the colour will deepen to a rich red-green.' },
      { title:'SLOW COOK',       body:'Return the chicken. Add salt and ¼ cup water. Cover and cook on low for 20–25 minutes until chicken is tender and oil surfaces. Do not rush this step.' },
    ],
    goodness: ['Very high in protein','Antioxidant-rich gongura','Authentic Andhra flavour','Iron-rich combination'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫓', label:'Roti' }, { icon:'🧅', label:'Raw Onion' }],
    tip: 'Use Guntur red chillies if you can find them — they give gongura chicken its signature deep red colour and fruity heat. Regular chillies work but the flavour differs.',
    tags: ['High-protein', 'Gluten-free'],
  },
  {
    id: 'natu-kodi-pulusu',
    title: 'Natu Kodi Pulusu',
    script: 'Deep, Rustic & Slow-Cooked',
    badge: 'COUNTRY CHICKEN CURRY',
    blurb: 'Free-range country chicken slow-cooked in a thick tamarind gravy — an Andhra village classic unlike any other!',
    readyMins: 70,
    baseServings: 4,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🍗', t:'frac',  q:800,  u:'g',    name:'country chicken (natu kodi)', sub:'(bone-in, curry cut)', cal:1000, key:'chicken' },
      { icon:'🟤', t:'frac',  q:3,    u:'tbsp', name:'tamarind paste',              sub:'',                     cal:25,   key:'tamarind' },
      { icon:'🧅', t:'count', q:3,    u:'',     name:'onions, finely chopped',      sub:'',                     cal:132,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, chopped',           sub:'',                     cal:44,   key:'tomato' },
      { icon:'🧄', t:'count', q:8,    u:'',     name:'garlic cloves',               sub:'',                     cal:32,   key:'garlic' },
      { icon:'🫚', t:'frac',  q:2,    u:'inch', name:'ginger',                      sub:'',                     cal:10,   key:'ginger' },
      { icon:'🌶️',t:'frac',  q:2,    u:'tsp',  name:'red chilli powder',           sub:'',                     cal:12,   key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',  name:'turmeric powder',             sub:'',                     cal:8,    key:'turmeric' },
      { icon:'🟤', t:'frac',  q:2,    u:'tsp',  name:'coriander powder',            sub:'',                     cal:12,   key:'coriander' },
      { icon:'✨', t:'frac',  q:2,    u:'tsp',  name:'garam masala',                sub:'',                     cal:16,   key:'garam-masala' },
      { icon:'🌿', t:'range', low:10, high:12, u:'', name:'curry leaves',           sub:'',                     cal:2,    key:'curry-leaves' },
      { icon:'🫗', t:'frac',  q:4,    u:'tbsp', name:'oil',                         sub:'',                     cal:480,  key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'FRY THE CHICKEN', body:'Heat oil in a wide heavy pot. Fry chicken pieces on high heat until golden and slightly crisped on the outside. Remove and set aside. This step is essential — it adds depth.' },
      { title:'COOK THE BASE',   body:'In the same oil, fry onions until deep brown (not golden — deep brown). Add ginger-garlic and cook 3 minutes. Add tomatoes and all dry spices. Cook until oil separates.' },
      { title:'ADD TAMARIND',    body:'Add tamarind paste and 1 cup water. Bring to a boil. The gravy will turn a deep mahogany colour.' },
      { title:'SLOW COOK',       body:'Return the chicken and add curry leaves. Cover and simmer on very low heat for 35–40 minutes, stirring occasionally. Country chicken needs time — don\'t rush it.' },
      { title:'REDUCE & FINISH', body:'Uncover for the final 10 minutes to reduce the gravy to a thick, clinging consistency. Taste and adjust salt and tamarind.' },
    ],
    goodness: ['Very high in protein','Country chicken is leaner','Deep authentic flavour','Collagen-rich from bone-in cooking'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫓', label:'Jowar Roti' }, { icon:'🧅', label:'Raw Onion & Lemon' }],
    tip: 'Country chicken (natu kodi) is tougher than broiler — that\'s why the long slow cook is non-negotiable. Pressure cooking defeats the purpose; the slow simmer builds a depth that can\'t be rushed.',
    tags: ['High-protein', 'Gluten-free'],
  },
  {
    id: 'gutti-vankaya',
    title: 'Gutti Vankaya',
    script: 'Stuffed & Spectacular',
    badge: 'ANDHRA STUFFED BRINJAL',
    blurb: 'Small brinjals stuffed with a peanut-sesame masala and slow-cooked — rich, nutty and deeply Andhra!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🍆',
    ingredients: [
      { icon:'🍆', t:'count', q:8,    u:'',     name:'small brinjals (eggplant)',   sub:'(kept whole with stem)', cal:160, key:'brinjal' },
      { icon:'🥜', t:'frac',  q:3,    u:'tbsp', name:'peanuts, roasted',            sub:'',                      cal:150,  key:'peanuts' },
      { icon:'⬜', t:'frac',  q:2,    u:'tbsp', name:'white sesame seeds, roasted', sub:'',                      cal:100,  key:'sesame' },
      { icon:'🥥', t:'frac',  q:2,    u:'tbsp', name:'desiccated coconut, roasted', sub:'',                      cal:70,   key:'coconut' },
      { icon:'🌶️',t:'frac',  q:1.5,  u:'tsp',  name:'red chilli powder',           sub:'',                      cal:9,    key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',  name:'coriander powder',            sub:'',                      cal:6,    key:'coriander' },
      { icon:'✨', t:'frac',  q:0.5,  u:'tsp',  name:'garam masala',                sub:'',                      cal:4,    key:'garam-masala' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'turmeric powder',             sub:'',                      cal:4,    key:'turmeric' },
      { icon:'🫗', t:'frac',  q:4,    u:'tbsp', name:'oil',                         sub:'',                      cal:480,  key:'oil' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',  name:'tamarind paste',              sub:'',                      cal:5,    key:'tamarind' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MAKE THE FILLING', body:'Blend roasted peanuts, sesame, coconut, chilli powder, coriander, garam masala, turmeric, tamarind, and salt into a coarse paste — not too smooth. Taste and adjust.' },
      { title:'STUFF THE BRINJALS', body:'Make two deep cross-cuts from the base of each brinjal (keeping the stem intact). Gently stuff the masala paste into each opening, pressing firmly.' },
      { title:'SHALLOW FRY',     body:'Heat oil in a wide pan. Place stuffed brinjals gently. Cook on medium-low with a lid on, turning every few minutes, for 15–18 minutes total.' },
      { title:'FINISH',          body:'Once brinjals are completely tender (press with a spoon — they should yield), increase heat briefly to caramelise the outside. Serve hot.' },
    ],
    goodness: ['Peanuts add protein','Rich in fibre','Sesame calcium boost','Vegan & gluten-free'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫙', label:'Ghee' }, { icon:'🟡', label:'Pappu' }],
    tip: 'Choose brinjals of uniform small size — they cook evenly. If the filling falls out while cooking, just pile it alongside the brinjals in the pan.',
    tags: ['Vegan', 'Gluten-free', 'High-fibre'],
  },
  {
    id: 'egg-curry',
    title: 'Egg Curry',
    script: 'Simple & Satisfying',
    badge: 'ANDHRA STYLE',
    blurb: 'Hard-boiled eggs in a bold, spiced onion-tomato gravy — a quick, protein-rich meal that never disappoints!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥚',
    ingredients: [
      { icon:'🥚', t:'count', q:6,    u:'',     name:'eggs, hard-boiled & peeled',  sub:'',                cal:468,  key:'eggs' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',      sub:'',                cal:88,   key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, pureed',            sub:'',                cal:44,   key:'tomato' },
      { icon:'🧄', t:'count', q:5,    u:'',     name:'garlic cloves, minced',       sub:'',                cal:20,   key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch', name:'ginger, grated',              sub:'',                cal:5,    key:'ginger' },
      { icon:'🌶️',t:'frac',  q:1.5,  u:'tsp',  name:'red chilli powder',           sub:'',                cal:9,    key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:0.5,  u:'tsp',  name:'turmeric powder',             sub:'',                cal:4,    key:'turmeric' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',  name:'coriander powder',            sub:'',                cal:6,    key:'coriander' },
      { icon:'✨', t:'frac',  q:1,    u:'tsp',  name:'garam masala',                sub:'',                cal:8,    key:'garam-masala' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                         sub:'',                cal:360,  key:'oil' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',            sub:'',                cal:2,    key:'curry-leaves' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander',             sub:'',                cal:1,    key:'coriander' },
    ],
    method: [
      { title:'FRY THE EGGS',    body:'Score the hard-boiled eggs with shallow cuts or prick with a fork. Shallow fry in hot oil for 2–3 minutes until lightly golden. This gives them flavour and texture. Remove and set aside.' },
      { title:'BUILD THE MASALA',body:'In the same oil, add onions and fry until deep golden. Add ginger-garlic and cook 2 minutes. Add tomato puree, all dry spices, and salt.' },
      { title:'COOK THE GRAVY',  body:'Cook the masala until oil separates, about 8–10 minutes. Add ½ cup water and curry leaves. Simmer 3 minutes.' },
      { title:'ADD EGGS',        body:'Slide in the fried eggs. Coat gently in the gravy. Simmer on low for 5 minutes so the eggs absorb the flavour.' },
      { title:'FINISH',          body:'Sprinkle garam masala and fresh coriander. Serve hot.' },
    ],
    goodness: ['Complete protein','Quick to make','Budget-friendly','Rich in B12 & choline'],
    serveWith: [{ icon:'🍚', label:'Hot Rice' }, { icon:'🫓', label:'Roti' }, { icon:'🥗', label:'Onion Salad' }],
    tip: 'Frying the boiled eggs before adding to the gravy is the most important step — it creates a golden skin that soaks up the masala without becoming rubbery.',
    tags: ['High-protein', 'Gluten-free'],
  },

  /* ── More Rasoi Magic ───────────────────────────── */
  {
    id: 'rasoi-dal-makhani',
    title: 'Rasoi Magic Dal Makhani',
    script: 'Creamy, Smoky & Rich',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'The legendary dal makhani made easy — whole black lentils slow-cooked with butter and cream from a single packet!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🫕',
    ingredients: [
      { icon:'⚫', t:'frac',  q:1,    u:'cup',  name:'whole black urad dal',        sub:'(soaked overnight)', cal:380, key:'urad-dal' },
      { icon:'🫘', t:'frac',  q:0.25, u:'cup',  name:'rajma (kidney beans)',         sub:'(soaked overnight)', cal:112, key:'rajma' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Dal Makhani packet', sub:'(50g)',           cal:60,  key:'masala' },
      { icon:'🧈', t:'frac',  q:3,    u:'tbsp', name:'butter',                       sub:'',                  cal:300, key:'butter' },
      { icon:'🥛', t:'frac',  q:75,   u:'ml',   name:'heavy cream',                  sub:'',                  cal:260, key:'cream' },
      { icon:'🍅', t:'frac',  q:2,    u:'tbsp', name:'tomato paste',                 sub:'',                  cal:20,  key:'tomato' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRESSURE COOK',   body:'Pressure cook soaked dal and rajma together with 3 cups water for 6–7 whistles until completely soft. The dal should mash between fingers easily.' },
      { title:'COOK THE BASE',   body:'Melt butter in a thick pot. Add tomato paste and the full Rasoi Magic packet. Stir and cook on medium heat for 4 minutes.' },
      { title:'COMBINE & SIMMER', body:'Add the cooked dal and rajma. Stir well. Simmer on low heat for 20 minutes minimum — the longer it simmers, the richer it gets. Add water if too thick.' },
      { title:'FINISH',          body:'Stir in cream. Simmer 3 more minutes. Dal makhani is done when it\'s deep brown, creamy, and the butter glistens on top.' },
    ],
    goodness: ['High in protein','Rich in iron','Prebiotic dal','Deeply satisfying'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Pickled Onion' }],
    tip: 'The minimum simmer is 20 minutes — every extra 10 minutes makes it richer. Restaurant dal makhani simmers for hours. Patience is the upgrade.',
    tags: ['Vegetarian', 'High-protein', 'High-fibre'],
  },
  {
    id: 'rasoi-pav-bhaji',
    title: 'Rasoi Magic Pav Bhaji',
    script: 'Mumbai Street Magic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Buttery mashed vegetable curry with toasted pav — Mumbai\'s iconic street food made in your own kitchen!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🍞',
    ingredients: [
      { icon:'🥔', t:'frac',  q:400,  u:'g',    name:'potatoes, boiled & mashed',   sub:'',                cal:308, key:'potato' },
      { icon:'🥦', t:'frac',  q:1,    u:'cup',  name:'mixed vegetables, boiled',    sub:'(peas, carrot, cauliflower)', cal:80, key:'carrot' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Pav Bhaji packet', sub:'(50g)',           cal:60,  key:'masala' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',      sub:'(½ for bhaji, ½ for serving)', cal:88, key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, finely chopped',    sub:'',                cal:66,  key:'tomato' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'butter',                      sub:'(divided)',        cal:400, key:'butter' },
      { icon:'🫗', t:'frac',  q:1,    u:'tbsp', name:'oil',                         sub:'',                cal:120, key:'oil' },
      { icon:'🍞', t:'count', q:8,    u:'',     name:'pav (dinner rolls)',           sub:'',                cal:560, key:'bread' },
      { icon:'🍋', t:'frac',  q:1,    u:'',     name:'lemon, cut into wedges',      sub:'',                cal:5,   key:'lemon' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE BHAJI',  body:'Heat butter + oil in a thick pan. Sauté onions until golden. Add tomatoes and cook until soft. Add the Rasoi Magic packet and cook 3 minutes.' },
      { title:'MASH IT IN',      body:'Add mashed potatoes and mixed vegetables. Using a potato masher, mash everything together in the pan. Add ½ cup water. Stir vigorously.' },
      { title:'SIMMER & TASTE',  body:'Simmer on medium heat, mashing and stirring, for 8–10 minutes until the bhaji is thick and glossy. Add salt and a knob of butter.' },
      { title:'TOAST THE PAV',   body:'Slice pav. Butter both cut sides generously. Toast on a hot tawa until golden and slightly crisp at the edges.' },
      { title:'SERVE',           body:'Serve bhaji in a bowl with a knob of butter melting on top, chopped onion, and lemon wedge. Toasted pav on the side.' },
    ],
    goodness: ['Packed with vegetables','Energy-rich','Quick weeknight dish','Kid-friendly'],
    serveWith: [{ icon:'🧅', label:'Raw Onion' }, { icon:'🍋', label:'Lemon Wedge' }, { icon:'🌿', label:'Coriander' }],
    tip: 'The bhaji should be mashed until almost smooth — no big chunks. And don\'t skip toasting the pav in butter. A cold pav is a tragedy.',
    tags: ['Vegetarian', 'High-carb'],
  },
  {
    id: 'rasoi-kadai-paneer',
    title: 'Rasoi Magic Kadai Paneer',
    script: 'Smoky & Restaurant-Style',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Chunky paneer and peppers tossed in a bold kadhai masala — restaurant quality from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🍢',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',               sub:'',                cal:816, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Kadai Paneer packet', sub:'(50g)',        cal:60,  key:'masala' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'green capsicum, cubed',        sub:'',                cal:25,  key:'capsicum' },
      { icon:'🔴', t:'count', q:1,    u:'',     name:'red capsicum, cubed',          sub:'',                cal:30,  key:'capsicum' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions — 1 chopped, 1 cubed',  sub:'',                cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, chopped',            sub:'',                cal:66,  key:'tomato' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',                cal:360, key:'oil' },
      { icon:'🥛', t:'frac',  q:50,   u:'ml',   name:'cream',                        sub:'(optional)',      cal:173, key:'cream' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE GRAVY',  body:'Heat oil. Sauté the chopped onion until golden. Add tomatoes and cook until soft. Add the full Rasoi Magic packet. Cook 4 minutes until fragrant.' },
      { title:'ADD PEPPERS',     body:'Add the cubed capsicum and cubed onion. Toss on high heat for 3 minutes — keep them slightly crunchy.' },
      { title:'ADD PANEER',      body:'Add paneer cubes. Toss gently to coat in the masala. Cook on medium heat 5 minutes.' },
      { title:'FINISH',          body:'Stir in cream if using. Simmer 2 minutes. Serve sizzling hot — kadai paneer is best straight from the pan.' },
    ],
    goodness: ['High in protein','Vitamin C from peppers','Quick to make','Calcium-rich paneer'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'Keep the capsicum slightly crunchy — overcooked peppers turn limp and lose the texture contrast that defines kadai paneer.',
    tags: ['Vegetarian', 'Protein-rich'],
  },
  {
    id: 'rasoi-paneer-bhurji',
    title: 'Rasoi Magic Paneer Bhurji',
    script: 'Crumbled, Spiced & Quick',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Crumbled paneer tossed with onion, tomato and aromatic spices — a protein-packed scramble ready in minutes!',
    readyMins: 20,
    baseServings: 3,
    heroEmoji: '🍳',
    ingredients: [
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, grated or crumbled',   sub:'',          cal:680, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Paneer Bhurji packet', sub:'(30g)', cal:36,  key:'masala' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, finely chopped',        sub:'',          cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, finely chopped',     sub:'',          cal:44,  key:'tomato' },
      { icon:'🫑', t:'frac',  q:0.5,  u:'',     name:'capsicum, finely chopped',     sub:'(optional)',cal:12,  key:'capsicum' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil',                          sub:'',          cal:240, key:'oil' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'SAUTÉ THE ONION', body:'Heat oil in a pan. Add the chopped onion and sauté until soft and translucent, about 3 minutes.' },
      { title:'COOK THE BASE',   body:'Add tomatoes and capsicum. Cook until the tomatoes turn pulpy. Add the full Rasoi Magic packet and cook 2–3 minutes until fragrant.' },
      { title:'ADD THE PANEER',  body:'Add the crumbled paneer. Toss gently to coat evenly in the masala. Cook on medium heat for 3–4 minutes — do not overcook or the paneer turns rubbery.' },
      { title:'FINISH & SERVE',  body:'Adjust salt. Garnish with fresh coriander. Serve hot — paneer bhurji is best straight off the stove with hot rotis.' },
    ],
    goodness: ['High in protein','Calcium-rich','Quick & filling','Low-carb friendly'],
    serveWith: [{ icon:'🫓', label:'Phulka Roti' }, { icon:'🍞', label:'Pav' }, { icon:'🧅', label:'Sliced Onion' }],
    tip: 'Crumble the paneer fresh and add it last — the less you cook paneer, the softer it stays. A squeeze of lemon at the end lifts everything.',
    tags: ['Vegetarian', 'High-protein', 'Low-carb'],
  },
  {
    id: 'rasoi-paneer-tawa-masala',
    title: 'Rasoi Magic Paneer Tawa Masala',
    script: 'Bold, Spicy & Tangy',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Paneer cubes simmered in a spicy tomato-onion gravy with a tawa-fried finish — restaurant flavour from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',                sub:'',          cal:816, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Paneer Tawa Masala packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',       sub:'',          cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, finely chopped',     sub:'',          cal:66,  key:'tomato' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'capsicum, cubed',              sub:'',          cal:25,  key:'capsicum' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'TAWA-FRY THE PANEER', body:'Heat 1 tbsp oil on a tawa or pan. Lightly fry the paneer cubes until golden on the edges. Remove and keep aside.' },
      { title:'COOK THE GRAVY',  body:'In the same pan, heat remaining oil. Sauté onions until golden. Add tomatoes and capsicum and cook until soft and pulpy.' },
      { title:'ADD THE MASALA',  body:'Add the full Rasoi Magic packet. Cook on medium heat for 4 minutes until the oil separates and the gravy turns glossy. Add ½ cup water for a saucier finish.' },
      { title:'COMBINE & SIMMER',body:'Add the fried paneer. Toss to coat and simmer 5 minutes so the paneer soaks up the masala. Adjust salt.' },
      { title:'FINISH',          body:'Garnish with fresh coriander. Serve hot — the spicy tomato-onion gravy is made for naan or jeera rice.' },
    ],
    goodness: ['High in protein','Calcium-rich','Vitamin C from peppers','Restaurant-style at home'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'Tawa-frying the paneer first gives it a golden crust that holds up in the gravy — skip it and the cubes go soft and lose their bite.',
    tags: ['Vegetarian', 'High-protein', 'Spicy'],
  },
  {
    id: 'rasoi-paneer-makhanwala',
    title: 'Rasoi Magic Paneer Makhanwala',
    script: 'Creamy, Buttery & Mild',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer in a velvety, buttery tomato gravy — the crowd-pleasing makhani classic from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🍛',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',                sub:'',          cal:816, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Paneer Makhanwala packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🍅', t:'count', q:4,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:88,  key:'tomato' },
      { icon:'🧈', t:'frac',  q:3,    u:'tbsp', name:'butter',                       sub:'',          cal:300, key:'butter' },
      { icon:'🥛', t:'frac',  q:75,   u:'ml',   name:'fresh cream',                  sub:'',          cal:260, key:'cream' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, finely chopped',        sub:'',          cal:44,  key:'onion' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE BASE',   body:'Melt butter in a pan. Add the chopped onion and sauté until soft. Add the tomato purée and cook on medium heat until it thickens and the butter separates, about 6 minutes.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3–4 minutes until fragrant. Add ½ cup water to reach a smooth, pourable gravy.' },
      { title:'ADD THE PANEER',  body:'Add the paneer cubes. Simmer gently on low heat for 5 minutes so they soften and absorb the gravy.' },
      { title:'FINISH',          body:'Stir in the cream and simmer 2 more minutes. Paneer makhanwala is done when it\'s rich, glossy and pale orange. Top with a knob of butter.' },
    ],
    goodness: ['High in protein','Calcium-rich','Comforting & mild','Kid-friendly'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Saffron Rice' }, { icon:'🧅', label:'Pickled Onion' }],
    tip: 'Keep the heat low once the cream goes in — boiling cream can split the gravy. A pinch of sugar balances the tomato\'s tang beautifully.',
    tags: ['Vegetarian', 'High-protein', 'Mild'],
  },
  {
    id: 'rasoi-veg-kadhai',
    title: 'Rasoi Magic Veg Kadhai',
    script: 'No Onion, No Garlic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Mixed vegetables in a bold aromatic masala — completely no onion, no garlic, and full of flavour from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥘',
    ingredients: [
      { icon:'🥦', t:'frac',  q:3,    u:'cups', name:'mixed vegetables',            sub:'(cauliflower, carrot, beans, peas)', cal:150, key:'carrot' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Veg Kadhai packet', sub:'(30g, no onion no garlic)', cal:36, key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'capsicum, cubed',              sub:'',          cal:25,  key:'capsicum' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
      { icon:'🥛', t:'frac',  q:2,    u:'tbsp', name:'cream',                        sub:'(optional)',cal:60,  key:'cream' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PARBOIL THE VEG', body:'Boil or steam the mixed vegetables until just tender but still firm. Drain and keep aside.' },
      { title:'COOK THE GRAVY',  body:'Heat oil in a kadhai. Add the tomato purée and cook on medium heat until it thickens and the oil separates, about 5 minutes. (No onion or garlic needed.)' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3 minutes until fragrant. Add ½ cup water for a glossy gravy.' },
      { title:'ADD THE VEG',     body:'Add the parboiled vegetables and cubed capsicum. Toss to coat and simmer 6–8 minutes so they soak up the masala.' },
      { title:'FINISH',          body:'Stir in cream if using. Garnish with coriander. A satvik kadhai that\'s big on flavour without any onion or garlic.' },
    ],
    goodness: ['Onion & garlic free','Vegan-friendly (skip cream)','Rich in fibre','Vitamin-packed'],
    serveWith: [{ icon:'🫓', label:'Tawa Roti' }, { icon:'🍚', label:'Steamed Rice' }, { icon:'🥗', label:'Cucumber Raita' }],
    tip: 'Keep the vegetables firm — parboil only until just tender. This dish proves you don\'t need onion or garlic for a deeply flavourful kadhai.',
    tags: ['Vegetarian', 'NONG', 'High-fibre'],
  },
  {
    id: 'rasoi-shahi-paneer',
    title: 'Rasoi Magic Shahi Paneer',
    script: 'Royal, Creamy & Mild',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer in a rich, mildly sweet cashew-cream curry — the royal Mughlai classic from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🤴',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',                sub:'',          cal:816, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Shahi Paneer packet', sub:'(50g)',  cal:60,  key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, finely chopped',        sub:'',          cal:44,  key:'onion' },
      { icon:'🥜', t:'frac',  q:10,   u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:90, key:'cashew' },
      { icon:'🥛', t:'frac',  q:75,   u:'ml',   name:'fresh cream',                  sub:'',          cal:260, key:'cream' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil or ghee',                  sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE BASE',   body:'Heat oil or ghee. Sauté the onion until soft and pale gold. Add the tomato purée and cook until it thickens and the oil separates, about 6 minutes.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet and the cashew paste. Cook 3 minutes. Add ½ cup water to reach a smooth, silky gravy.' },
      { title:'ADD THE PANEER',  body:'Add the paneer cubes. Simmer gently on low heat for 5 minutes so they soften and soak up the gravy.' },
      { title:'FINISH',          body:'Stir in the cream and simmer 2 minutes. Shahi paneer is done when it\'s pale, glossy and luxuriously rich. A pinch of sugar rounds it off.' },
    ],
    goodness: ['High in protein','Calcium-rich','Mild & kid-friendly','Restaurant-style at home'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Saffron Rice' }, { icon:'🧅', label:'Pickled Onion' }],
    tip: 'The cashew paste is what makes it shahi (royal) — it thickens the gravy and adds a gentle sweetness no cream alone can match.',
    tags: ['Vegetarian', 'High-protein', 'Mild'],
  },
  {
    id: 'rasoi-paneer-deewani-handi',
    title: 'Rasoi Magic Paneer Deewani Handi',
    script: 'Aromatic & Handi-Style',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Paneer and capsicum simmered handi-style in a bold aromatic masala — semi-thick, vibrant and full of flavour!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🧀', t:'frac',  q:300,  u:'g',    name:'paneer, cubed',                sub:'',          cal:816, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Paneer Deewani Handi packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'capsicum, cubed',              sub:'',          cal:25,  key:'capsicum' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',       sub:'',          cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
      { icon:'🥛', t:'frac',  q:50,   u:'ml',   name:'cream',                        sub:'(optional)',cal:173, key:'cream' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE GRAVY',  body:'Heat oil in a handi or thick pan. Sauté onions until golden. Add the tomato purée and cook until soft and the oil separates, about 5 minutes.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3–4 minutes until fragrant. Add ½ cup water for a semi-thick gravy.' },
      { title:'ADD PEPPERS & PANEER', body:'Add the cubed capsicum and paneer. Toss to coat and simmer 6 minutes — keep the capsicum slightly crunchy.' },
      { title:'FINISH',          body:'Stir in cream if using. Garnish with coriander. Serve sizzling — handi dishes are best straight from the pot.' },
    ],
    goodness: ['High in protein','Vitamin C from peppers','Calcium-rich','Quick to make'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'A handi traps steam and concentrates the masala — use a deep, heavy pot and keep the lid on between stirs for that authentic depth.',
    tags: ['Vegetarian', 'High-protein'],
  },
  {
    id: 'rasoi-methi-mutter-malai',
    title: 'Rasoi Magic Methi Mutter Malai',
    script: 'Creamy White Gravy',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Fenugreek leaves and green peas in a luscious creamy white gravy — mildly sweet, slightly bitter, beautifully balanced!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🌿', t:'frac',  q:2,    u:'cups', name:'fresh methi leaves, chopped',  sub:'(fenugreek)', cal:50,  key:'methi' },
      { icon:'🟢', t:'frac',  q:1,    u:'cup',  name:'green peas',                   sub:'(fresh or frozen)', cal:120, key:'peas' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Methi Mutter Malai packet', sub:'(50g)', cal:60, key:'masala' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, finely chopped',        sub:'',          cal:44,  key:'onion' },
      { icon:'🥜', t:'frac',  q:10,   u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:90, key:'cashew' },
      { icon:'🥛', t:'frac',  q:100,  u:'ml',   name:'fresh cream or malai',         sub:'',          cal:340, key:'cream' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil or ghee',                  sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PREP THE METHI',  body:'Wash the chopped methi well. Sprinkle with a little salt, rest 10 minutes, then squeeze out the bitter juices. This keeps the dish mild, not bitter.' },
      { title:'COOK THE BASE',   body:'Heat oil or ghee. Sauté the onion until soft and pale — do not brown it, the gravy stays white. Add the cashew paste and cook 2 minutes.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Add ¾ cup water and simmer into a smooth white gravy, about 4 minutes.' },
      { title:'ADD METHI & PEAS',body:'Add the methi and green peas. Simmer on low heat 6–8 minutes until the peas are tender.' },
      { title:'FINISH',          body:'Stir in the cream and simmer 2 minutes. Methi mutter malai is done when it\'s pale, creamy and the methi\'s edge is just a whisper.' },
    ],
    goodness: ['Iron-rich methi','Fibre from peas','Calcium from cream','Mild & comforting'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🫓', label:'Phulka Roti' }, { icon:'🍚', label:'Jeera Rice' }],
    tip: 'Salting and squeezing the methi first is the trick — raw fenugreek can turn the whole gravy bitter. Don\'t skip it.',
    tags: ['Vegetarian', 'Iron-rich', 'Mild'],
  },
  {
    id: 'rasoi-sambar',
    title: 'Rasoi Magic Sambar',
    script: 'Tangy South Indian Classic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Toor dal and mixed vegetables in a tangy, aromatic tamarind broth — the soul of South Indian meals from a single packet!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🥘',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',  name:'toor dal (split pigeon peas)', sub:'',          cal:680, key:'toor-dal' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Sambar packet',    sub:'(50g)',     cal:60,  key:'masala' },
      { icon:'🥦', t:'frac',  q:2,    u:'cups', name:'mixed vegetables',             sub:'(drumstick, pumpkin, carrot, brinjal)', cal:100, key:'carrot' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, chopped',            sub:'',          cal:44,  key:'tomato' },
      { icon:'🟤', t:'frac',  q:1,    u:'tbsp', name:'tamarind pulp',                sub:'',          cal:14,  key:'tamarind' },
      { icon:'🟤', t:'frac',  q:1,    u:'tsp',  name:'mustard seeds',                sub:'(for tempering)', cal:8, key:'mustard-seeds' },
      { icon:'🌿', t:'range', low:8, high:10, u:'', name:'curry leaves',             sub:'',          cal:2,   key:'curry-leaves' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil',                          sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE DAL',    body:'Pressure cook toor dal with 3 cups water and a pinch of turmeric for 4–5 whistles until soft. Mash smooth and keep aside.' },
      { title:'BOIL THE VEG',    body:'In a pot, boil the mixed vegetables and tomatoes with the tamarind pulp and 2 cups water until the veg is tender.' },
      { title:'ADD THE MASALA',  body:'Add the mashed dal and the full Rasoi Magic packet. Simmer on medium heat for 10 minutes so the flavours meld. Add water to reach a pourable consistency.' },
      { title:'TEMPER & SERVE',  body:'Heat oil, splutter the mustard seeds, add curry leaves, and pour this tempering over the sambar. Cover for a minute to trap the aroma, then serve hot.' },
    ],
    goodness: ['High in plant protein','Rich in fibre','Vegan-friendly','Loaded with vegetables'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🥞', label:'Idli' }, { icon:'🫓', label:'Dosa' }],
    tip: 'Sambar tastes better after it rests — make it 30 minutes ahead and the tamarind, dal and spices settle into something deeper.',
    tags: ['Vegan', 'High-protein', 'High-fibre'],
  },
  {
    id: 'rasoi-palak-paneer',
    title: 'Rasoi Magic Palak Paneer',
    script: 'Spinach & Paneer Classic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer in a vibrant green spinach gravy — wholesome, iron-rich and restaurant-smooth from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥬',
    ingredients: [
      { icon:'🥬', t:'frac',  q:400,  u:'g',    name:'fresh spinach (palak)',        sub:'(blanched & pureed)', cal:92, key:'spinach' },
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, cubed',                sub:'',          cal:680, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Palak Paneer packet', sub:'(50g)',  cal:60,  key:'masala' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, finely chopped',        sub:'',          cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',     name:'tomato, chopped',              sub:'',          cal:22,  key:'tomato' },
      { icon:'🥛', t:'frac',  q:50,   u:'ml',   name:'cream',                        sub:'(optional)',cal:173, key:'cream' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil or ghee',                  sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'BLANCH THE PALAK', body:'Drop the spinach into boiling water for 2 minutes, then into ice water. Drain and blend to a smooth purée — the ice bath keeps it bright green.' },
      { title:'COOK THE BASE',   body:'Heat oil or ghee. Sauté onion until soft. Add tomato and cook until pulpy. Add the full Rasoi Magic packet and cook 3 minutes.' },
      { title:'ADD THE PALAK',   body:'Pour in the spinach purée. Simmer on low heat for 5 minutes — do not overcook or the green dulls. Add a splash of water if thick.' },
      { title:'ADD PANEER & FINISH', body:'Add the paneer cubes and simmer 3 minutes. Stir in cream if using. Serve hot with a swirl of cream on top.' },
    ],
    goodness: ['Iron-rich spinach','High in protein','Calcium-rich','Loaded with vitamins'],
    serveWith: [{ icon:'🫓', label:'Tawa Roti' }, { icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }],
    tip: 'Blanch and shock the spinach in ice water — it locks in the bright green colour that turns muddy if you boil it down directly.',
    tags: ['Vegetarian', 'High-protein', 'Iron-rich'],
  },
  {
    id: 'chings-paneer-chilli',
    title: "Ching's Secret Paneer Chilli",
    script: 'Desi Chinese Street Style',
    badge: "CHING'S SECRET SERIES",
    blurb: 'Crispy paneer tossed with peppers and onion in a fiery, glossy Indo-Chinese sauce — desi Chinese done right!',
    readyMins: 25,
    baseServings: 3,
    heroEmoji: '🌶️',
    ingredients: [
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, cubed',                sub:'',          cal:680, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:"Ching's Secret Paneer Chilli masala mix", sub:'(50g)', cal:60, key:'masala' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'capsicum, cubed',              sub:'',          cal:25,  key:'capsicum' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, cut into petals',       sub:'',          cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',     name:'green chillies, slit',         sub:'',          cal:8,   key:'green-chilli' },
      { icon:'🌽', t:'frac',  q:3,    u:'tbsp', name:'cornflour',                    sub:'(for coating paneer)', cal:90, key:'cornflour' },
      { icon:'🧅', t:'frac',  q:2,    u:'tbsp', name:'spring onion, chopped',        sub:'(for garnish)', cal:6, key:'spring-onion' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
    ],
    method: [
      { title:'COAT & FRY PANEER', body:'Toss the paneer cubes in cornflour with a pinch of salt. Shallow-fry in hot oil until golden and crisp on all sides. Remove and keep aside.' },
      { title:'STIR-FRY THE VEG', body:'In the same pan, heat 1 tbsp oil on high. Add onion petals, capsicum and green chillies. Stir-fry 2 minutes — keep them crunchy.' },
      { title:'ADD THE MIX',     body:"Dissolve the Ching's masala mix in ½ cup water. Pour into the pan and cook on high until the sauce thickens and turns glossy, about 2 minutes." },
      { title:'TOSS & SERVE',    body:'Add the fried paneer and toss to coat in the sauce. Garnish with spring onion. Serve immediately while crisp and sizzling.' },
    ],
    goodness: ['High in protein','Quick stir-fry','Bold & spicy','Calcium-rich paneer'],
    serveWith: [{ icon:'🍜', label:'Hakka Noodles' }, { icon:'🍚', label:'Fried Rice' }, { icon:'🥢', label:'On its own' }],
    tip: 'Cook the sauce on the highest heat and toss fast — Indo-Chinese is all about the wok-breath char and keeping the paneer crisp.',
    tags: ['Vegetarian', 'High-protein', 'Spicy'],
  },
  {
    id: 'chings-chicken-chilli',
    title: "Ching's Secret Chicken Chilli",
    script: 'Desi Chinese Street Style',
    badge: "CHING'S SECRET SERIES",
    blurb: 'Crispy chicken tossed with peppers and onion in a fiery, glossy Indo-Chinese sauce — the takeaway favourite at home!',
    readyMins: 30,
    baseServings: 3,
    heroEmoji: '🍗',
    ingredients: [
      { icon:'🍗', t:'frac',  q:400,  u:'g',    name:'boneless chicken, cubed',      sub:'',          cal:440, key:'chicken' },
      { icon:'📦', t:'count', q:1,    u:'',     name:"Ching's Secret Chicken Chilli masala mix", sub:'(50g)', cal:60, key:'masala' },
      { icon:'🫑', t:'count', q:1,    u:'',     name:'capsicum, cubed',              sub:'',          cal:25,  key:'capsicum' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, cut into petals',       sub:'',          cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',     name:'green chillies, slit',         sub:'',          cal:8,   key:'green-chilli' },
      { icon:'🌽', t:'frac',  q:4,    u:'tbsp', name:'cornflour',                    sub:'(for coating chicken)', cal:120, key:'cornflour' },
      { icon:'🧅', t:'frac',  q:2,    u:'tbsp', name:'spring onion, chopped',        sub:'(for garnish)', cal:6, key:'spring-onion' },
      { icon:'🫗', t:'frac',  q:4,    u:'tbsp', name:'oil',                          sub:'',          cal:480, key:'oil' },
    ],
    method: [
      { title:'COAT & FRY CHICKEN', body:'Toss the chicken cubes in cornflour with a pinch of salt. Deep- or shallow-fry in hot oil until golden, crisp and cooked through. Remove and keep aside.' },
      { title:'STIR-FRY THE VEG', body:'In a wok, heat 1 tbsp oil on high. Add onion petals, capsicum and green chillies. Stir-fry 2 minutes — keep them crunchy.' },
      { title:'ADD THE MIX',     body:"Dissolve the Ching's masala mix in ½ cup water. Pour into the wok and cook on high until the sauce thickens and turns glossy, about 2 minutes." },
      { title:'TOSS & SERVE',    body:'Add the fried chicken and toss to coat in the sauce. Garnish with spring onion. Serve immediately while crisp and hot.' },
    ],
    goodness: ['High in protein','Quick stir-fry','Bold & spicy','Takeaway favourite'],
    serveWith: [{ icon:'🍜', label:'Hakka Noodles' }, { icon:'🍚', label:'Fried Rice' }, { icon:'🥢', label:'On its own' }],
    tip: 'Double-fry the chicken for extra crunch — fry once, rest, then a quick second fry locks in a crust that survives the sauce.',
    tags: ['Non-vegetarian', 'High-protein', 'Spicy'],
  },
  {
    id: 'rasoi-veg-kolhapuri',
    title: 'Rasoi Magic Veg Kolhapuri',
    script: 'Fiery Maharashtrian Heat',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Mixed vegetables in a bold, fiery Kolhapuri masala — hot, spicy and completely no onion, no garlic from a single packet!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🥘',
    ingredients: [
      { icon:'🥦', t:'frac',  q:3,    u:'cups', name:'mixed vegetables',            sub:'(cauliflower, carrot, beans, peas, potato)', cal:170, key:'carrot' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Veg Kolhapuri packet', sub:'(50g, no onion no garlic)', cal:60, key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🥥', t:'frac',  q:3,    u:'tbsp', name:'dry coconut, grated',          sub:'(for the kolhapuri paste)', cal:120, key:'coconut' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PARBOIL THE VEG', body:'Boil or steam the mixed vegetables until just tender but still firm. Drain and keep aside.' },
      { title:'ROAST THE COCONUT', body:'Dry-roast the grated coconut in a pan until golden and fragrant. This deep, nutty base is the soul of a Kolhapuri masala.' },
      { title:'COOK THE GRAVY',  body:'Heat oil. Add the tomato purée and roasted coconut. Cook on medium until the oil separates, about 6 minutes. (No onion or garlic needed.)' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3 minutes until fiery and fragrant. Add ¾ cup water for a glossy gravy.' },
      { title:'SIMMER & SERVE',  body:'Add the parboiled vegetables. Simmer 8 minutes so they soak up the heat. Garnish with coriander. Serve hot — this one packs a punch.' },
    ],
    goodness: ['Onion & garlic free','Vegan-friendly','Rich in fibre','Bold & spicy'],
    serveWith: [{ icon:'🫓', label:'Jowar Bhakri' }, { icon:'🫓', label:'Tawa Roti' }, { icon:'🍚', label:'Steamed Rice' }],
    tip: 'Roasting the coconut until deep golden is non-negotiable — it gives Kolhapuri its signature smoky, nutty depth under all that heat.',
    tags: ['Vegetarian', 'NONG', 'Spicy'],
  },
  {
    id: 'rasoi-mutter-paneer',
    title: 'Rasoi Magic Mutter Paneer',
    script: 'Paneer & Peas, No Onion No Garlic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer and sweet green peas in a satvik tomato gravy — comforting, mild and completely no onion, no garlic!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🧀',
    ingredients: [
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, cubed',                sub:'',          cal:680, key:'paneer' },
      { icon:'🟢', t:'frac',  q:1,    u:'cup',  name:'green peas',                   sub:'(fresh or frozen)', cal:120, key:'peas' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Mutter Paneer packet', sub:'(50g, no onion no garlic)', cal:60, key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🥜', t:'frac',  q:8,    u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:70, key:'cashew' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil or ghee',                  sub:'',          cal:240, key:'oil' },
      { icon:'🥛', t:'frac',  q:50,   u:'ml',   name:'cream',                        sub:'(optional)',cal:173, key:'cream' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE BASE',   body:'Heat oil or ghee. Add the tomato purée and cashew paste. Cook on medium heat until it thickens and the oil separates, about 6 minutes. (No onion or garlic needed.)' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3 minutes. Add ¾ cup water to reach a smooth, pourable gravy.' },
      { title:'ADD PEAS',        body:'Add the green peas and simmer 5 minutes until tender.' },
      { title:'ADD PANEER & FINISH', body:'Add the paneer cubes. Simmer gently 4 minutes. Stir in cream if using. Serve hot — a satvik classic that needs no onion or garlic.' },
    ],
    goodness: ['Onion & garlic free','High in protein','Fibre from peas','Calcium-rich'],
    serveWith: [{ icon:'🫓', label:'Phulka Roti' }, { icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }],
    tip: 'The cashew paste replaces the body that onion usually gives — it thickens the gravy and keeps it rich without breaking the no-onion rule.',
    tags: ['Vegetarian', 'NONG', 'Jain', 'High-protein'],
  },
  {
    id: 'rasoi-veg-biryani',
    title: 'Rasoi Magic Veg Biryani',
    script: 'Fragrant Spiced Rice',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Fluffy basmati layered with spiced vegetables and crunchy nuts — a one-pot biryani feast from a single packet!',
    readyMins: 45,
    baseServings: 4,
    heroEmoji: '🍚',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,    u:'cups', name:'basmati rice',                 sub:'(soaked 30 min)', cal:680, key:'basmati' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Veg Biryani packet', sub:'(50g)',         cal:60,  key:'masala' },
      { icon:'🥦', t:'frac',  q:2,    u:'cups', name:'mixed vegetables',             sub:'(carrot, beans, peas, cauliflower)', cal:120, key:'carrot' },
      { icon:'🧅', t:'count', q:1,    u:'',     name:'onion, thinly sliced',         sub:'',          cal:44,  key:'onion' },
      { icon:'🥛', t:'frac',  q:0.5,  u:'cup',  name:'yogurt',                       sub:'',          cal:75,  key:'yogurt' },
      { icon:'🥜', t:'frac',  q:3,    u:'tbsp', name:'mixed nuts',                   sub:'(cashews, almonds)', cal:150, key:'cashew' },
      { icon:'🫙', t:'frac',  q:3,    u:'tbsp', name:'ghee',                         sub:'',          cal:360, key:'ghee' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh mint & coriander',       sub:'',          cal:2,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PARBOIL THE RICE', body:'Boil the soaked rice in salted water until 70% cooked — the grains should still have a bite. Drain and keep aside.' },
      { title:'FRY THE NUTS & ONION', body:'Heat ghee. Fry the nuts until golden and remove. In the same ghee, fry the sliced onion until crisp and brown (birista).' },
      { title:'COOK THE VEG',    body:'Add the mixed vegetables and the full Rasoi Magic packet. Stir in the yogurt and cook 5 minutes until the veg is coated and half-tender.' },
      { title:'LAYER',           body:'Layer the parboiled rice over the vegetables. Scatter the fried nuts, birista, mint and coriander on top. Drizzle with a little ghee.' },
      { title:'DUM & SERVE',     body:'Cover tightly and cook on the lowest heat for 15 minutes (dum). Turn off and rest 5 minutes. Fluff gently and serve with raita.' },
    ],
    goodness: ['One-pot meal','Energy-rich','Loaded with vegetables','Festive & filling'],
    serveWith: [{ icon:'🥗', label:'Cucumber Raita' }, { icon:'🧅', label:'Mirchi ka Salan' }, { icon:'🥚', label:'Boiled Egg' }],
    tip: 'Parboil the rice to only 70% — it finishes cooking on dum. Fully-cooked rice before layering turns the biryani into a mushy pulao.',
    tags: ['Vegetarian', 'High-carb', 'Festive'],
  },
  {
    id: 'rasoi-egg-curry',
    title: 'Rasoi Magic Egg Curry',
    script: 'Homestyle & Hearty',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Boiled eggs simmered in a spiced onion-tomato gravy — the ultimate homestyle comfort curry from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥚',
    ingredients: [
      { icon:'🥚', t:'count', q:6,    u:'',     name:'eggs, hard-boiled & peeled',   sub:'',          cal:420, key:'egg' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Egg Curry packet', sub:'(50g)',     cal:60,  key:'masala' },
      { icon:'🧅', t:'count', q:2,    u:'',     name:'onions, finely chopped',       sub:'',          cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'',          cal:360, key:'oil' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'FRY THE EGGS',    body:'Heat 1 tbsp oil. Lightly fry the boiled eggs with a pinch of salt and turmeric until golden-speckled. Score them shallowly first so they soak up the gravy. Remove and keep aside.' },
      { title:'COOK THE GRAVY',  body:'In the same pan, heat remaining oil. Sauté onions until golden brown. Add the tomato purée and cook until the oil separates, about 6 minutes.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3–4 minutes until fragrant. Add 1 cup water and bring to a simmer.' },
      { title:'SIMMER & SERVE',  body:'Slide in the fried eggs. Simmer gently 5 minutes so they absorb the masala. Garnish with coriander. Serve hot with rice or roti.' },
    ],
    goodness: ['High in protein','Rich in vitamin B12','Quick & hearty','Homestyle comfort'],
    serveWith: [{ icon:'🍚', label:'Steamed Rice' }, { icon:'🫓', label:'Tawa Roti' }, { icon:'🧅', label:'Sliced Onion' }],
    tip: 'Score the boiled eggs before frying — the shallow slits let the gravy seep in so every bite is seasoned, not just the surface.',
    tags: ['Non-vegetarian', 'High-protein'],
  },
  {
    id: 'rasoi-malai-kofta',
    title: 'Rasoi Magic Malai Kofta',
    script: 'Soft Koftas, Creamy Curry',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer-potato dumplings in a rich, creamy curry — the showstopper vegetarian classic from a single packet!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🟤',
    ingredients: [
      { icon:'🥔', t:'frac',  q:3,    u:'',     name:'potatoes, boiled & mashed',    sub:'',          cal:230, key:'potato' },
      { icon:'🧀', t:'frac',  q:150,  u:'g',    name:'paneer, grated',               sub:'',          cal:408, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Malai Kofta packet', sub:'(50g)',   cal:60,  key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🥜', t:'frac',  q:10,   u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:90, key:'cashew' },
      { icon:'🥛', t:'frac',  q:100,  u:'ml',   name:'fresh cream',                  sub:'',          cal:340, key:'cream' },
      { icon:'🌽', t:'frac',  q:3,    u:'tbsp', name:'cornflour',                    sub:'(to bind koftas)', cal:90, key:'cornflour' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'(plus more to fry)', cal:360, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'MAKE THE KOFTAS', body:'Mix the mashed potato, grated paneer, cornflour and a pinch of salt into a smooth dough. Roll into smooth balls — make sure there are no cracks or they\'ll break while frying.' },
      { title:'FRY THE KOFTAS',  body:'Deep-fry the koftas in hot oil until golden brown all over. Drain on paper and keep aside. Do not add them to the gravy until serving.' },
      { title:'COOK THE GRAVY',  body:'Heat 3 tbsp oil. Add the tomato purée and cashew paste. Cook until thick and the oil separates, about 6 minutes. Stir in the full Rasoi Magic packet and cook 3 minutes.' },
      { title:'FINISH THE GRAVY',body:'Add 1 cup water and the cream. Simmer 5 minutes into a smooth, rich, pale-orange gravy. Adjust salt and add a pinch of sugar.' },
      { title:'ASSEMBLE & SERVE',body:'Place the koftas in a serving dish and pour the hot gravy over them just before serving — this keeps the koftas soft outside but intact. Garnish with cream and coriander.' },
    ],
    goodness: ['Rich & indulgent','Protein from paneer','Crowd-pleaser','Restaurant-style at home'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🧅', label:'Laccha Onion' }],
    tip: 'Add the koftas to the gravy only at serving time — soak them too early and they dissolve. Smooth, crack-free balls are the key to frying them whole.',
    tags: ['Vegetarian', 'Rich', 'Festive'],
  },
  {
    id: 'rasoi-dum-aloo',
    title: 'Rasoi Magic Dum Aloo',
    script: 'Baby Potatoes, Rich Gravy',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Baby potatoes slow-simmered in a rich, spiced gravy — the regal Kashmiri-style classic from a single packet!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🥔',
    ingredients: [
      { icon:'🥔', t:'frac',  q:500,  u:'g',    name:'baby potatoes',                sub:'(boiled & peeled)', cal:385, key:'potato' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Dum Aloo packet',  sub:'(50g)',     cal:60,  key:'masala' },
      { icon:'🍅', t:'count', q:3,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:66,  key:'tomato' },
      { icon:'🥛', t:'frac',  q:0.5,  u:'cup',  name:'yogurt, whisked',              sub:'',          cal:75,  key:'yogurt' },
      { icon:'🥜', t:'frac',  q:8,    u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:70, key:'cashew' },
      { icon:'🫗', t:'frac',  q:3,    u:'tbsp', name:'oil',                          sub:'(plus more to fry)', cal:360, key:'oil' },
      { icon:'🌱', t:'frac',  q:2,    u:'tbsp', name:'fresh coriander, chopped',     sub:'',          cal:1,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PRICK & FRY THE ALOO', body:'Prick the boiled baby potatoes all over with a fork. Shallow-fry in hot oil until golden and crisp-skinned. Remove and keep aside.' },
      { title:'COOK THE GRAVY',  body:'Heat 3 tbsp oil. Add the tomato purée and cashew paste. Cook until thick and the oil separates, about 6 minutes. Lower the heat and whisk in the yogurt slowly so it doesn\'t split.' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3 minutes. Add 1 cup water and bring to a gentle simmer.' },
      { title:'DUM & SERVE',     body:'Add the fried potatoes. Cover and simmer on the lowest heat (dum) for 10 minutes so they drink in the gravy. Garnish with coriander and serve hot.' },
    ],
    goodness: ['Comforting & rich','Energy-dense','Crowd-pleaser','Restaurant-style at home'],
    serveWith: [{ icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }, { icon:'🫓', label:'Phulka Roti' }],
    tip: 'Prick the potatoes before frying — the holes let the gravy soak deep into each one during the slow dum, which is what dum aloo is all about.',
    tags: ['Vegetarian', 'Rich'],
  },
  {
    id: 'rasoi-palak-paneer-nong',
    title: 'Rasoi Magic Palak Paneer',
    script: 'No Onion No Garlic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Soft paneer in a vibrant green spinach gravy — wholesome, iron-rich and completely no onion, no garlic from a single packet!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥬',
    ingredients: [
      { icon:'🥬', t:'frac',  q:400,  u:'g',    name:'fresh spinach (palak)',        sub:'(blanched & pureed)', cal:92, key:'spinach' },
      { icon:'🧀', t:'frac',  q:250,  u:'g',    name:'paneer, cubed',                sub:'',          cal:680, key:'paneer' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Palak Paneer packet', sub:'(50g, no onion no garlic)', cal:60, key:'masala' },
      { icon:'🍅', t:'count', q:2,    u:'',     name:'tomatoes, pureed',             sub:'',          cal:44,  key:'tomato' },
      { icon:'🥜', t:'frac',  q:8,    u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:70, key:'cashew' },
      { icon:'🥛', t:'frac',  q:50,   u:'ml',   name:'cream',                        sub:'(optional)',cal:173, key:'cream' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'oil or ghee',                  sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'BLANCH THE PALAK', body:'Drop the spinach into boiling water for 2 minutes, then into ice water. Drain and blend to a smooth purée — the ice bath keeps it bright green.' },
      { title:'COOK THE BASE',   body:'Heat oil or ghee. Add the tomato purée and cashew paste. Cook on medium heat until it thickens and the oil separates, about 6 minutes. (No onion or garlic needed.)' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet. Cook 3 minutes. Pour in the spinach purée and simmer on low for 5 minutes — do not overcook or the green dulls.' },
      { title:'ADD PANEER & FINISH', body:'Add the paneer cubes and simmer 3 minutes. Stir in cream if using. A satvik palak paneer that needs no onion or garlic.' },
    ],
    goodness: ['Onion & garlic free','Iron-rich spinach','High in protein','Calcium-rich'],
    serveWith: [{ icon:'🫓', label:'Tawa Roti' }, { icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }],
    tip: 'No onion or garlic means the spinach flavour shines — a pinch of asafoetida (hing) in the oil gives the savoury depth they usually provide.',
    tags: ['Vegetarian', 'NONG', 'Jain', 'Iron-rich'],
  },
  {
    id: 'rasoi-methi-matar-malai-jain',
    title: 'Rasoi Magic Methi Matar Malai',
    script: 'Jain · Creamy White Gravy',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Fenugreek leaves and green peas in a creamy white gravy — Jain-friendly, mild and rich, with no onion, garlic or root vegetables!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🌿', t:'frac',  q:2,    u:'cups', name:'fresh methi leaves, chopped',  sub:'(fenugreek)', cal:50,  key:'methi' },
      { icon:'🟢', t:'frac',  q:1,    u:'cup',  name:'green peas',                   sub:'(fresh or frozen)', cal:120, key:'peas' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Jain Methi Matar Malai packet', sub:'(50g, no onion no garlic)', cal:60, key:'masala' },
      { icon:'🥜', t:'frac',  q:10,   u:'',     name:'cashews',                      sub:'(soaked & ground to paste)', cal:90, key:'cashew' },
      { icon:'🥛', t:'frac',  q:100,  u:'ml',   name:'fresh cream or malai',         sub:'',          cal:340, key:'cream' },
      { icon:'🥛', t:'frac',  q:0.25, u:'cup',  name:'milk',                         sub:'',          cal:40,  key:'milk' },
      { icon:'🫗', t:'frac',  q:2,    u:'tbsp', name:'ghee',                         sub:'',          cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'PREP THE METHI',  body:'Wash the chopped methi well. Sprinkle with a little salt, rest 10 minutes, then squeeze out the bitter juices to keep the dish mild, not bitter.' },
      { title:'MAKE THE WHITE BASE', body:'Heat ghee on low. Add the cashew paste and cook gently 2 minutes without browning — the gravy must stay pale. (No onion, garlic or ginger.)' },
      { title:'ADD THE MASALA',  body:'Stir in the full Rasoi Magic packet, the milk and ½ cup water. Simmer into a smooth white gravy, about 4 minutes.' },
      { title:'ADD METHI & PEAS',body:'Add the methi and green peas. Simmer on low 6–8 minutes until the peas are tender.' },
      { title:'FINISH',          body:'Stir in the cream and simmer 2 minutes. A pure Jain malai gravy — rich and pale, with no root vegetables at all.' },
    ],
    goodness: ['Jain-friendly','Onion & garlic free','Iron-rich methi','Mild & comforting'],
    serveWith: [{ icon:'🫓', label:'Phulka Roti' }, { icon:'🫓', label:'Butter Naan' }, { icon:'🍚', label:'Jeera Rice' }],
    tip: 'Keep the heat low and never brown the cashew paste — a true malai gravy is ivory-white, getting all its body from cashew and cream, not from onions.',
    tags: ['Vegetarian', 'NONG', 'Jain', 'Mild'],
  },
  {
    id: 'rasoi-pav-bhaji-nong',
    title: 'Rasoi Magic Pav Bhaji',
    script: 'No Onion No Garlic',
    badge: 'RASOI MAGIC SERIES',
    blurb: 'Buttery mashed vegetable curry with toasted pav — Mumbai\'s street classic, made completely no onion, no garlic!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🍞',
    ingredients: [
      { icon:'🥔', t:'frac',  q:400,  u:'g',    name:'potatoes, boiled & mashed',   sub:'',          cal:308, key:'potato' },
      { icon:'🥦', t:'frac',  q:1,    u:'cup',  name:'mixed vegetables, boiled',    sub:'(peas, carrot, cauliflower)', cal:80, key:'carrot' },
      { icon:'📦', t:'count', q:1,    u:'',     name:'Rasoi Magic Pav Bhaji packet', sub:'(50g, no onion no garlic)', cal:60, key:'masala' },
      { icon:'🍅', t:'count', q:4,    u:'',     name:'tomatoes, finely chopped',    sub:'',          cal:88,  key:'tomato' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'butter',                      sub:'(divided)', cal:400, key:'butter' },
      { icon:'🍞', t:'count', q:8,    u:'',     name:'pav (dinner rolls)',          sub:'',          cal:560, key:'bread' },
      { icon:'🍋', t:'frac',  q:1,    u:'',     name:'lemon, cut into wedges',      sub:'',          cal:5,   key:'lemon' },
      { icon:'🧂', t:'taste', text:'', name:'salt, to taste', sub:'', cal:0, key:'salt' },
    ],
    method: [
      { title:'COOK THE BHAJI',  body:'Heat 2 tbsp butter in a thick pan. Add the chopped tomatoes and cook until completely soft and pulpy. Add the Rasoi Magic packet and cook 3 minutes. (No onion or garlic needed — a pinch of hing adds depth.)' },
      { title:'MASH IT IN',      body:'Add the mashed potatoes and boiled vegetables. Using a potato masher, mash everything together in the pan with ½ cup water. Stir vigorously.' },
      { title:'SIMMER & TASTE',  body:'Simmer on medium, mashing and stirring, for 8–10 minutes until thick and glossy. Add salt and a knob of butter.' },
      { title:'TOAST THE PAV',   body:'Slice the pav, butter both cut sides generously, and toast on a hot tawa until golden and crisp at the edges.' },
      { title:'SERVE',           body:'Serve the bhaji with a knob of butter melting on top and a lemon wedge. Toasted pav on the side.' },
    ],
    goodness: ['Onion & garlic free','Packed with vegetables','Kid-friendly','Energy-rich'],
    serveWith: [{ icon:'🍋', label:'Lemon Wedge' }, { icon:'🧈', label:'Extra Butter' }, { icon:'🌿', label:'Coriander' }],
    tip: 'Without onion, a generous pinch of asafoetida (hing) bloomed in the butter brings the savoury base note that makes pav bhaji taste complete.',
    tags: ['Vegetarian', 'NONG', 'High-carb'],
  },
  {
    id: 'hummus',
    title: 'Hummus',
    script: 'Creamy Chickpea & Tahini Dip',
    badge: 'A MIDDLE EASTERN CLASSIC',
    blurb: 'A silky purée of chickpeas and tahini brightened with lemon and garlic — a beloved dip and spread across Greece and the Middle East!',
    readyMins: 10,
    baseServings: 6,
    heroEmoji: '🥣',
    ingredients: [
      { icon:'🧄', t:'count', q:2,    u:'',     name:'garlic cloves, roughly chopped', sub:'',        cal:8,   key:'garlic' },
      { icon:'🍋', t:'frac',  q:0.25, u:'cup',  name:'lemon juice',                 sub:'',           cal:15,  key:'lemon' },
      { icon:'💧', t:'frac',  q:5,    u:'tbsp', name:'water',                       sub:'(⅓ cup)',    cal:0,   key:'water' },
      { icon:'🫘', t:'frac',  q:400,  u:'g',    name:'canned chickpeas',            sub:'(14 oz, rinsed & drained)', cal:600, key:'chickpeas' },
      { icon:'🥜', t:'frac',  q:0.5,  u:'cup',  name:'tahini',                      sub:'(sesame seed paste)', cal:710, key:'tahini' },
      { icon:'🧂', t:'frac',  q:1,    u:'tsp',  name:'salt',                        sub:'',           cal:0,   key:'salt' },
      { icon:'🫒', t:'frac',  q:1,    u:'tbsp', name:'extra virgin olive oil',      sub:'(optional, to drizzle)', cal:120, key:'olive-oil' },
      { icon:'🌶️',t:'taste', text:'',           name:'paprika, to sprinkle',        sub:'(optional)', cal:2,   key:'paprika' },
    ],
    method: [
      { title:'COMBINE',       body:'Place the garlic, lemon juice, water, drained chickpeas, tahini and salt in a food processor or blender.' },
      { title:'BLEND SMOOTH',  body:'Process until completely smooth, stopping to scrape down the sides occasionally. Add a splash more water if you prefer a lighter, softer texture.' },
      { title:'GARNISH & SERVE', body:'Spoon into a bowl, drizzle with extra virgin olive oil and dust with a little paprika. Serve with warm pita or veggie sticks.' },
    ],
    goodness: ['Plant-based protein','Rich in fibre','No cooking required','Great for dipping & spreading'],
    serveWith: [{ icon:'🫓', label:'Warm Pita' }, { icon:'🥕', label:'Veggie Sticks' }, { icon:'🫒', label:'Olive Oil' }],
    tip: 'For a spicier hummus, blend in a small chopped red chilli or a pinch of cayenne — or a little cumin for a warmer, more exotic flavour.',
    tags: ['Vegan', 'Gluten-free', 'High-protein', 'No-cook'],
  },
  {
    id: 'green-moong-soup',
    title: 'Green Moong Soup',
    script: 'Light, Wholesome & Nourishing',
    badge: 'A HEALING BOWL OF GOODNESS',
    blurb: 'Earthy whole green moong simmered soft and spiced gently — a light, protein-rich soup that soothes and satisfies.',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🍲',
    ingredients: [
      { icon:'🟢', t:'frac',  q:1,    u:'cup',    name:'whole green moong, soaked',   sub:'soak 4–6 hours', cal:280, key:'green-moong' },
      { icon:'🧅', t:'frac',  q:1,    u:'medium', name:'onion, finely chopped',        sub:'',               cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',       name:'tomato, chopped',              sub:'',               cal:22,  key:'tomato' },
      { icon:'🧄', t:'count', q:3,    u:'',       name:'garlic cloves, crushed',       sub:'',               cal:13,  key:'garlic' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch',   name:'ginger, grated',               sub:'',               cal:5,   key:'ginger' },
      { icon:'🌶️',t:'count', q:1,    u:'',       name:'green chilli, slit',           sub:'',               cal:4,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',    name:'turmeric powder',              sub:'',               cal:8,   key:'turmeric' },
      { icon:'🥄', t:'count', q:1,    u:'tsp',    name:'cumin seeds',                  sub:'',               cal:8,   key:'cumin' },
      { icon:'🧈', t:'count', q:1,    u:'tbsp',   name:'ghee or oil',                  sub:'',               cal:120, key:'ghee' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',               sub:'',               cal:0,   key:'salt' },
      { icon:'🌿', t:'taste', text:'',            name:'coriander, to garnish',        sub:'',               cal:2,   key:'coriander' },
    ],
    method: [
      { title:'SOAK & BOIL',        body:'Rinse the soaked green moong well. Pressure cook with turmeric, a little salt and 3 cups water for 4–5 whistles until soft but still holding shape.' },
      { title:'TEMPER',             body:'Heat ghee in a pan, add cumin seeds and let them splutter. Add crushed garlic, ginger and slit green chilli; saute until fragrant.' },
      { title:'SAUTE AROMATICS',    body:'Add the chopped onion and cook until soft and golden. Stir in the tomato and cook until it turns mushy and the oil separates.' },
      { title:'COMBINE',            body:'Pour in the cooked moong along with its liquid. Add more hot water to reach a soupy consistency and adjust salt.' },
      { title:'SIMMER',             body:'Let it simmer gently for 8–10 minutes so the flavours meld and the soup thickens slightly.' },
      { title:'GARNISH & SERVE',    body:'Finish with fresh coriander and a squeeze of lemon. Serve hot as a light meal or starter.' },
    ],
    goodness: ['High in plant protein','Rich in fibre','Light & easy to digest','Naturally low-fat'],
    serveWith: [{ icon:'🍋', label:'Lemon Wedge' }, { icon:'🍞', label:'Toasted Bread' }, { icon:'🍚', label:'Steamed Rice' }],
    tip: 'Don\'t over-cook the moong to a paste — you want the grains soft yet whole so every spoonful has a gentle bite.',
    tags: ['Vegan', 'Gluten-free', 'Light'],
  },
  {
    id: 'tomato-onion-curry',
    title: 'Tomato Onion Curry',
    script: 'Tangy, Spicy & Simple',
    badge: 'ANDHRA ULLI KARAM STYLE',
    blurb: 'A punchy tomato-onion gravy fired up with garlic and red chilli — the perfect fiery companion for dosa, idli or hot rice.',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🍅',
    ingredients: [
      { icon:'🧅', t:'count', q:3,    u:'',       name:'onions, sliced',               sub:'',               cal:132, key:'onion' },
      { icon:'🍅', t:'count', q:4,    u:'',       name:'tomatoes, chopped',            sub:'ripe',           cal:88,  key:'tomato' },
      { icon:'🧄', t:'count', q:6,    u:'',       name:'garlic cloves',                sub:'',               cal:26,  key:'garlic' },
      { icon:'🌶️',t:'range', low:3, high:4, u:'',name:'dried red chillies',           sub:'to taste',       cal:12,  key:'red-chilli' },
      { icon:'🌱', t:'count', q:1,    u:'tsp',    name:'mustard seeds',                sub:'',               cal:15,  key:'mustard' },
      { icon:'🥄', t:'count', q:1,    u:'tsp',    name:'cumin seeds',                  sub:'',               cal:8,   key:'cumin' },
      { icon:'🍃', t:'count', q:1,    u:'sprig',  name:'curry leaves',                 sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',    name:'turmeric powder',              sub:'',               cal:8,   key:'turmeric' },
      { icon:'🛢️',t:'count', q:2,    u:'tbsp',   name:'oil',                          sub:'',               cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',               sub:'',               cal:0,   key:'salt' },
    ],
    method: [
      { title:'TEMPER',            body:'Heat oil in a pan and add mustard seeds. When they splutter, add cumin, dried red chillies and curry leaves; let them crackle.' },
      { title:'FRY THE ONIONS',    body:'Add the sliced onions and crushed garlic. Saute on medium heat until the onions turn soft and deep golden.' },
      { title:'COOK TOMATOES',     body:'Add the chopped tomatoes, turmeric and salt. Cook covered until the tomatoes break down into a thick pulp.' },
      { title:'MASH & THICKEN',    body:'Mash the mixture roughly with the back of the spoon and cook until the oil separates at the edges.' },
      { title:'SIMMER',            body:'Add a splash of water if too dry and simmer 5 minutes to bring the gravy together into a spicy, tangy karam.' },
      { title:'REST & SERVE',      body:'Let it rest a few minutes off the heat so the flavours settle. Serve warm.' },
    ],
    goodness: ['Rich in antioxidants','No fancy ingredients','Naturally vegan','Big flavour, few steps'],
    serveWith: [{ icon:'🥞', label:'Dosa' }, { icon:'🍚', label:'Hot Rice' }, { icon:'⚪', label:'Idli' }],
    tip: 'Cook the onions low and slow until truly golden — that deep caramelised base is what gives ulli karam its signature sweetness under the heat.',
    tags: ['Vegan', 'Gluten-free', 'Spicy'],
  },
  {
    id: 'pitla',
    title: 'Pitla',
    script: 'Rustic, Quick & Comforting',
    badge: 'MAHARASHTRIAN COMFORT FOOD',
    blurb: 'A rustic gram-flour curry that comes together in minutes — soft, tangy and garlicky, made to be scooped up with hot bhakri or rice.',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥣',
    ingredients: [
      { icon:'🟡', t:'frac',  q:1,    u:'cup',    name:'besan (gram flour)',           sub:'',               cal:360, key:'besan' },
      { icon:'🧅', t:'count', q:2,    u:'',       name:'onions, finely chopped',       sub:'',               cal:88,  key:'onion' },
      { icon:'🧄', t:'count', q:5,    u:'',       name:'garlic cloves, crushed',       sub:'',               cal:22,  key:'garlic' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies, chopped',      sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🌱', t:'count', q:1,    u:'tsp',    name:'mustard seeds',                sub:'',               cal:15,  key:'mustard' },
      { icon:'🥄', t:'count', q:1,    u:'tsp',    name:'cumin seeds',                  sub:'',               cal:8,   key:'cumin' },
      { icon:'🍃', t:'count', q:1,    u:'sprig',  name:'curry leaves',                 sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',    name:'turmeric powder',              sub:'',               cal:8,   key:'turmeric' },
      { icon:'🛢️',t:'count', q:2,    u:'tbsp',   name:'oil',                          sub:'',               cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',               sub:'',               cal:0,   key:'salt' },
      { icon:'🌿', t:'taste', text:'',            name:'coriander, to garnish',        sub:'',               cal:2,   key:'coriander' },
    ],
    method: [
      { title:'MAKE THE SLURRY',   body:'Whisk the besan with about 2 cups water and the turmeric until completely smooth with no lumps. Set aside.' },
      { title:'TEMPER',            body:'Heat oil, add mustard and cumin seeds. When they splutter, add crushed garlic, green chillies and curry leaves.' },
      { title:'SAUTE ONIONS',      body:'Add the chopped onions and saute until soft and translucent, then season with salt.' },
      { title:'ADD THE SLURRY',    body:'Lower the heat and pour in the besan slurry slowly, stirring constantly to keep it lump-free.' },
      { title:'COOK & THICKEN',    body:'Simmer on low, stirring often, for 8–10 minutes until the raw besan smell disappears and it thickens to a soft, spoonable curry.' },
      { title:'GARNISH & SERVE',   body:'Top with fresh coriander and a drizzle of hot oil. Serve immediately while soft.' },
    ],
    goodness: ['Ready in minutes','Good plant protein','Budget-friendly','Naturally vegan'],
    serveWith: [{ icon:'🫓', label:'Bhakri' }, { icon:'🍚', label:'Steamed Rice' }, { icon:'🧅', label:'Raw Onion' }],
    tip: 'Add the slurry off high heat and keep whisking — pouring cold besan water into a roaring pan is what causes stubborn lumps.',
    tags: ['Vegan', 'Gluten-free', 'Quick'],
  },
  {
    id: 'bombay-puri-curry',
    title: 'Bombay Puri Curry',
    script: 'Thin, Spiced & Soul-Warming',
    badge: 'BOMBAY-STYLE PURI BHAJI',
    blurb: 'A thin, spiced potato rassa lightly thickened with besan — the classic soupy Bombay curry made to be dunked with hot puris.',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🥔',
    ingredients: [
      { icon:'🥔', t:'count', q:4,    u:'',       name:'potatoes, boiled & cubed',     sub:'',               cal:440, key:'potato' },
      { icon:'🟡', t:'range', low:2, high:3, u:'tbsp', name:'besan (gram flour)',      sub:'',               cal:100, key:'besan' },
      { icon:'🧅', t:'count', q:2,    u:'',       name:'onions, finely chopped',       sub:'',               cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:1,    u:'',       name:'tomato, chopped',              sub:'',               cal:22,  key:'tomato' },
      { icon:'🌶️',t:'count', q:2,    u:'',       name:'green chillies, slit',         sub:'',               cal:8,   key:'green-chilli' },
      { icon:'🫚', t:'frac',  q:1,    u:'inch',   name:'ginger, grated',               sub:'',               cal:5,   key:'ginger' },
      { icon:'🌱', t:'count', q:1,    u:'tsp',    name:'mustard seeds',                sub:'',               cal:15,  key:'mustard' },
      { icon:'🍃', t:'count', q:1,    u:'sprig',  name:'curry leaves',                 sub:'',               cal:2,   key:'curry-leaves' },
      { icon:'🟡', t:'frac',  q:1,    u:'tsp',    name:'turmeric powder',              sub:'',               cal:8,   key:'turmeric' },
      { icon:'🛢️',t:'count', q:2,    u:'tbsp',   name:'oil',                          sub:'',               cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',               sub:'',               cal:0,   key:'salt' },
    ],
    method: [
      { title:'MASH THE POTATOES', body:'Roughly mash half the boiled potatoes and keep the rest cubed — the mash thickens the curry while the cubes give body.' },
      { title:'TEMPER',            body:'Heat oil, add mustard seeds and curry leaves. When they splutter, add slit green chillies and grated ginger.' },
      { title:'SAUTE AROMATICS',   body:'Add the chopped onions and cook until soft, then add the tomato and turmeric and cook until pulpy.' },
      { title:'BESAN SLURRY',      body:'Whisk the besan into 1 cup water until smooth, then pour into the pan slowly, stirring so it stays lump-free.' },
      { title:'SIMMER THIN',       body:'Add the potatoes, salt and 2–3 cups water to make it thin and soupy. Simmer 10 minutes until lightly thickened and glossy.' },
      { title:'FINISH & SERVE',    body:'Adjust consistency with hot water — it should stay pourable — and serve steaming hot with puris.' },
    ],
    goodness: ['Comforting & filling','Perfect puri partner','Simple pantry staples','Naturally vegan'],
    serveWith: [{ icon:'🫓', label:'Hot Puri' }, { icon:'🍋', label:'Lemon Wedge' }, { icon:'🧅', label:'Sliced Onion' }],
    tip: 'Keep this curry deliberately thin — it should be almost pourable, because it thickens as it sits and is meant to soak into every puri.',
    tags: ['Vegan', 'Spicy', 'Comfort Food'],
  },
  {
    id: 'chole-bhature',
    title: 'Chole Bhature',
    script: 'Fluffy, Spiced & Indulgent',
    badge: 'PUNJABI STREET CLASSIC',
    blurb: 'Pillowy deep-fried bhature paired with a rich, tangy chickpea chole — the ultimate indulgent North Indian feast on a plate.',
    readyMins: 60,
    baseServings: 4,
    heroEmoji: '🍛',
    ingredients: [
      { icon:'🫘', t:'frac',  q:2,    u:'cups',   name:'chickpeas, boiled',            sub:'soaked overnight', cal:540, key:'chickpeas' },
      { icon:'🌾', t:'count', q:2,    u:'cups',   name:'maida (all-purpose flour)',    sub:'for bhature',    cal:800, key:'maida' },
      { icon:'🥛', t:'range', low:3, high:4, u:'tbsp', name:'yogurt',                  sub:'for the dough',  cal:60,  key:'yogurt' },
      { icon:'🧅', t:'count', q:2,    u:'',       name:'onions, finely chopped',       sub:'',               cal:88,  key:'onion' },
      { icon:'🍅', t:'count', q:3,    u:'',       name:'tomatoes, pureed',             sub:'',               cal:66,  key:'tomato' },
      { icon:'🫚', t:'count', q:1,    u:'tbsp',   name:'ginger-garlic paste',          sub:'',               cal:20,  key:'ginger-garlic' },
      { icon:'🟤', t:'count', q:2,    u:'tsp',    name:'chole masala',                 sub:'',               cal:16,  key:'chole-masala' },
      { icon:'🌶️',t:'count', q:1,    u:'tsp',    name:'red chilli powder',            sub:'',               cal:8,   key:'red-chilli' },
      { icon:'🥄', t:'frac',  q:1,    u:'tsp',    name:'baking soda',                  sub:'for bhature',    cal:0,   key:'baking-soda' },
      { icon:'🛢️',t:'count', q:2,    u:'cups',   name:'oil, for deep frying',         sub:'',               cal:600, key:'oil' },
      { icon:'🧂', t:'taste', text:'',            name:'salt, to taste',               sub:'',               cal:0,   key:'salt' },
    ],
    method: [
      { title:'KNEAD THE DOUGH',   body:'Mix maida, yogurt, baking soda, a pinch of salt and a little oil. Knead with warm water into a soft, smooth dough. Cover and rest 2–3 hours to ferment.' },
      { title:'QUICK CHOLE BASE',  body:'Heat oil, saute onions until golden, add ginger-garlic paste and cook off the raw smell. Add tomato puree, chole masala, chilli powder and salt; cook until oil separates.' },
      { title:'SIMMER THE CHOLE',  body:'Add the boiled chickpeas with a cup of their water. Lightly mash a few to thicken, then simmer 15 minutes until rich and glossy.' },
      { title:'ROLL THE BHATURE',  body:'Divide the rested dough into balls and roll each into an oval about 5 inches wide, not too thin.' },
      { title:'FRY TILL PUFFED',   body:'Heat oil until shimmering-hot. Slide in one bhatura, press gently with a slotted spoon so it puffs, then flip and fry until golden on both sides.' },
      { title:'SERVE HOT',         body:'Serve the puffed bhature immediately with the hot chole, sliced onions and a wedge of lemon.' },
    ],
    goodness: ['Protein-rich chickpeas','A satisfying feast','Restaurant-style at home','Perfect for gatherings'],
    serveWith: [{ icon:'🧅', label:'Sliced Onion' }, { icon:'🥒', label:'Pickle' }, { icon:'🍋', label:'Lemon Wedge' }],
    tip: 'Fry bhature only when the oil is properly hot and press them down gently as they hit the oil — that quick pressure traps steam inside and makes them balloon up light and fluffy.',
    tags: ['Vegetarian', 'Spicy', 'Indulgent'],
  },
  {
    id: 'puri',
    title: 'Puri',
    script: 'Golden, Puffed & Irresistible',
    badge: 'THE FESTIVE DEEP-FRIED PUFF',
    blurb: 'Crisp on the outside, pillowy within — golden wheat rounds that puff up like balloons in hot oil!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,   u:'cups', name:'whole wheat flour', sub:'(atta)',         cal:800,  key:'atta' },
      { icon:'🌾', t:'frac',  q:2,   u:'tbsp', name:'fine semolina',      sub:'(sooji, for crunch)', cal:75, key:'sooji' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',    sub:'',               cal:0,    key:'salt' },
      { icon:'🫗', t:'frac',  q:2,   u:'tsp',  name:'oil',                sub:'(for the dough)', cal:80,   key:'dough-oil' },
      { icon:'💧', t:'frac',  q:0.75,u:'cup',  name:'water',              sub:'(to knead)',     cal:0,    key:'water' },
      { icon:'🛢️', t:'frac',  q:3,   u:'cups', name:'oil',                sub:'(for deep frying)', cal:600, key:'frying-oil' },
    ],
    method: [
      { title:'MAKE A STIFF DOUGH', body:'Mix atta, semolina and salt. Rub in 2 tsp oil, then add water little by little and knead into a firm, tight dough — stiffer than chapathi dough. Rest 15 minutes under a damp cloth.' },
      { title:'ROLL SMALL ROUNDS', body:'Divide into small balls. Roll each into a 4-inch round of even thickness. Don\'t dust with too much flour — brush lightly with oil instead so the puris don\'t burn in the oil.' },
      { title:'HEAT THE OIL', body:'Heat oil in a deep kadai until shimmering hot (a pinch of dough should rise up at once). Keep the flame on medium-high.' },
      { title:'FRY TILL PUFFED', body:'Slide in one puri and gently press it under the oil with a slotted spoon — it will balloon up. Flip once, fry till pale golden on both sides, then lift out.' },
      { title:'DRAIN & SERVE', body:'Drain on paper towels and serve hot and puffed. Puris deflate as they cool, so eat them fresh.' },
    ],
    goodness: ['Festive favorite','Puffs up beautifully','Kid-approved','Best served piping hot'],
    serveWith: [{ icon:'🥔', label:'Aloo Sabzi' }, { icon:'🍮', label:'Shrikhand' }, { icon:'🍛', label:'Chana Masala' }],
    tip: 'Keep the dough stiff and the oil properly hot — a soft dough soaks up oil, and cool oil stops the puri from puffing.',
    tags: ['Vegetarian', 'Vegan'],
  },
  {
    id: 'chapathi',
    title: 'Chapathi',
    script: 'Soft, Warm & Everyday',
    badge: 'THE EVERYDAY INDIAN BREAD',
    blurb: 'Soft, supple whole-wheat flatbread with gentle brown spots — the comforting heart of every Indian meal!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2.5, u:'cups', name:'whole wheat flour', sub:'(atta)',        cal:1000, key:'atta' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',   sub:'',              cal:0,    key:'salt' },
      { icon:'🫗', t:'frac',  q:1,   u:'tbsp', name:'oil',               sub:'(for the dough)', cal:120,  key:'oil' },
      { icon:'💧', t:'frac',  q:1,   u:'cup',  name:'water',             sub:'(warm, to knead)', cal:0,   key:'water' },
      { icon:'🧈', t:'frac',  q:2,   u:'tbsp', name:'ghee or butter',    sub:'(to brush)',    cal:240,  key:'ghee' },
    ],
    method: [
      { title:'KNEAD A SOFT DOUGH', body:'Mix atta and salt. Drizzle in oil, then add warm water gradually and knead 5–7 minutes into a soft, smooth, pliable dough. Rest at least 20 minutes under a damp cloth.' },
      { title:'DIVIDE & ROLL', body:'Divide into equal balls. Dust lightly with flour and roll each into a thin, even round, rotating as you go to keep it circular.' },
      { title:'COOK ON TAWA', body:'Heat a tawa till hot. Lay on a chapathi and cook until tiny bubbles appear, then flip. Cook the second side till brown spots form.' },
      { title:'PUFF & FINISH', body:'Press the edges gently with a cloth or flip onto a low direct flame for a few seconds to help it puff. Remove once done.' },
      { title:'BRUSH & STACK', body:'Brush with ghee or butter and stack in a covered casserole to keep them soft and warm.' },
    ],
    goodness: ['Soft & pliable','Wholesome whole-grain','Pairs with everything','Made fresh daily'],
    serveWith: [{ icon:'🍛', label:'Any Curry' }, { icon:'🥣', label:'Dal' }, { icon:'🥗', label:'Sabzi' }],
    tip: 'Rest the dough at least 20 minutes and knead it soft — relaxed gluten is what lets chapathi roll thin and stay tender.',
    tags: ['Vegetarian', 'Vegan'],
  },
  {
    id: 'roti',
    title: 'Roti / Phulka',
    script: 'Plain, Puffed & Wholesome',
    badge: 'THE FLAME-PUFFED DAILY BREAD',
    blurb: 'Thin, plain whole-wheat rounds that balloon up over an open flame — light, soft and oil-free!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🔥',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2.5, u:'cups', name:'whole wheat flour', sub:'(atta)',        cal:1000, key:'atta' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',   sub:'(optional)',    cal:0,    key:'salt' },
      { icon:'💧', t:'frac',  q:1,   u:'cup',  name:'water',             sub:'(to knead)',    cal:0,    key:'water' },
      { icon:'🌾', t:'frac',  q:0.25,u:'cup',  name:'dry flour',         sub:'(for dusting)', cal:100,  key:'dusting-flour' },
    ],
    method: [
      { title:'KNEAD THE DOUGH', body:'Mix atta and salt. Add water little by little and knead 5 minutes into a soft, smooth dough. Rest 20 minutes under a damp cloth — no oil is added.' },
      { title:'ROLL THIN ROUNDS', body:'Pinch off small balls, dust with dry flour and roll into thin, even rounds. Even thickness is key so they puff without tearing.' },
      { title:'START ON THE TAWA', body:'Heat a tawa till very hot. Place a roti on and cook until the surface changes color and small bubbles rise, then flip and cook the other side briefly.' },
      { title:'PUFF ON THE FLAME', body:'Using tongs, lift the roti and place it directly over a medium open flame. It will balloon up within seconds — flip once so both sides catch a little char.' },
      { title:'SERVE SOFT', body:'Stack in a covered container, optionally brushing with a touch of ghee, and serve warm.' },
    ],
    goodness: ['Oil-free & light','Puffs on open flame','Everyday whole-grain','Quick to make'],
    serveWith: [{ icon:'🍛', label:'Any Curry' }, { icon:'🥣', label:'Dal' }, { icon:'🫙', label:'Pickle' }],
    tip: 'Roll evenly and get the tawa properly hot before the flame — a well-cooked base and even thickness are what make the phulka puff into a perfect balloon.',
    tags: ['Vegetarian', 'Vegan'],
  },
  {
    id: 'naan',
    title: 'Naan',
    script: 'Fluffy, Chewy & Golden',
    badge: 'THE TANDOORI CLASSIC',
    blurb: 'Soft, chewy leavened flatbread blistered with char and brushed with butter — a tandoori legend!',
    readyMins: 150,
    baseServings: 4,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2.5, u:'cups', name:'all-purpose flour', sub:'(maida)',        cal:1140, key:'maida' },
      { icon:'🫗', t:'frac',  q:1,   u:'tsp',  name:'active dry yeast',  sub:'',               cal:10,   key:'yeast' },
      { icon:'🍚', t:'frac',  q:1,   u:'tsp',  name:'sugar',             sub:'',               cal:16,   key:'sugar' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',   sub:'',               cal:0,    key:'salt' },
      { icon:'🥛', t:'frac',  q:0.33,u:'cup',  name:'plain yogurt',      sub:'(dahi)',         cal:60,   key:'yogurt' },
      { icon:'💧', t:'frac',  q:0.5, u:'cup',  name:'warm water',        sub:'(to knead)',     cal:0,    key:'water' },
      { icon:'🧈', t:'frac',  q:3,   u:'tbsp', name:'ghee or butter',    sub:'(to brush)',     cal:360,  key:'ghee' },
    ],
    method: [
      { title:'ACTIVATE THE YEAST', body:'Stir yeast and sugar into warm water and let it sit 10 minutes until frothy. This is what leavens the naan and gives it a chewy lift.' },
      { title:'MAKE THE DOUGH', body:'Mix maida and salt, then add the yeast mixture and yogurt. Knead 8–10 minutes into a soft, elastic dough, adding a little water if needed.' },
      { title:'LET IT RISE', body:'Cover and let the dough rise in a warm spot for about 1.5–2 hours, until doubled in size.' },
      { title:'SHAPE THE NAAN', body:'Knock back the dough and divide into balls. Roll or stretch each into a teardrop shape, slightly thicker than a roti.' },
      { title:'COOK ON HIGH HEAT', body:'Cook on a very hot cast-iron tawa or under a broiler until big bubbles char and blister on both sides.' },
      { title:'BUTTER & SERVE', body:'Brush generously with ghee or butter and serve hot, sprinkled with coriander or garlic if you like.' },
    ],
    goodness: ['Soft & chewy','Yeast-leavened','Tandoori restaurant favorite','Perfect for scooping'],
    serveWith: [{ icon:'🍗', label:'Butter Chicken' }, { icon:'🧀', label:'Paneer Tikka' }, { icon:'🍛', label:'Dal Makhani' }],
    tip: 'Use a screaming-hot tawa and don\'t skip the yogurt — the acidity tenderizes the dough while the high heat gives naan its signature char and bubbles.',
    tags: ['Vegetarian'],
  },
  {
    id: 'rumali-roti',
    title: 'Rumali Roti',
    script: 'Paper-Thin & Silky',
    badge: 'THE HANDKERCHIEF BREAD',
    blurb: 'Featherlight, translucent flatbread stretched thin as a handkerchief and folded soft — pure artistry!',
    readyMins: 60,
    baseServings: 4,
    heroEmoji: '🧣',
    ingredients: [
      { icon:'🌾', t:'frac',  q:1.5, u:'cups', name:'all-purpose flour', sub:'(maida)',        cal:684,  key:'maida' },
      { icon:'🌾', t:'frac',  q:1,   u:'cup',  name:'whole wheat flour', sub:'(atta)',         cal:400,  key:'atta' },
      { icon:'🧂', t:'taste', text:'',          name:'salt, to taste',   sub:'',               cal:0,    key:'salt' },
      { icon:'🥛', t:'frac',  q:2,   u:'tbsp', name:'milk',              sub:'(for softness)', cal:20,   key:'milk' },
      { icon:'🫗', t:'frac',  q:1,   u:'tbsp', name:'oil',               sub:'(for the dough)', cal:120,  key:'oil' },
      { icon:'💧', t:'frac',  q:0.75,u:'cup',  name:'water',             sub:'(to knead)',     cal:0,    key:'water' },
    ],
    method: [
      { title:'KNEAD A SILKY DOUGH', body:'Mix both flours and salt. Add milk and oil, then water gradually, kneading 8–10 minutes into a very soft, stretchy, smooth dough. Rest 30 minutes under a damp cloth.' },
      { title:'REST & DIVIDE', body:'Knead once more, then divide into large balls. The dough must be well-rested and elastic so it can be stretched paper-thin.' },
      { title:'ROLL & STRETCH', body:'Roll each ball as thin as possible, then lift and gently stretch it over your knuckles, turning, until it is translucent and handkerchief-thin.' },
      { title:'COOK ON INVERTED TAWA', body:'Drape the sheet over a hot inverted tawa or kadai. It cooks in seconds — just a few light spots, no browning.' },
      { title:'FOLD LIKE A CLOTH', body:'Lift off and fold into a soft square like a handkerchief. Serve immediately while silky and warm.' },
    ],
    goodness: ['Paper-thin & silky','Restaurant-style skill','Folds like cloth','Melts in the mouth'],
    serveWith: [{ icon:'🍗', label:'Rogan Josh' }, { icon:'🍢', label:'Seekh Kebab' }, { icon:'🍛', label:'Nihari' }],
    tip: 'Knead the dough extra soft and let it rest well — a slack, elastic dough is the only way to stretch rumali roti thin enough to see through.',
    tags: ['Vegetarian', 'Vegan'],
  },
  {
    id: 'methi-paratha',
    title: 'Methi Paratha',
    script: 'Fresh Fenugreek Flatbread',
    badge: 'NORTH INDIAN WINTER FAVOURITE',
    blurb: 'Soft dough-mixed flatbreads speckled with fragrant fenugreek leaves and gentle spice — wholesome comfort on a plate!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',          cal:800, key:'atta' },
      { icon:'🌿', t:'frac',  q:2,    u:'cups', name:'fresh methi leaves, chopped', sub:'(fenugreek)',   cal:100, key:'methi' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',    sub:'',                cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger-garlic paste',       sub:'',                cal:15,  key:'ginger-garlic' },
      { icon:'🌈', t:'frac',  q:1,    u:'tsp',  name:'turmeric & red chilli powder', sub:'(mixed)',      cal:12,  key:'spice-mix' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',            sub:'',                cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                      sub:'(to cook)',       cal:480, key:'ghee' },
    ],
    method: [
      { title:'PREP THE METHI',  body:'Pluck, wash and finely chop the fresh methi leaves. Sprinkle with a little salt, rest 10 minutes, then squeeze out the bitter moisture.' },
      { title:'MAKE THE DOUGH',  body:'Combine the atta, methi, green chillies, ginger-garlic paste, turmeric-chilli mix and salt. Knead with water into a soft, pliable dough.' },
      { title:'REST THE DOUGH',  body:'Cover with a damp cloth and rest for 20 minutes so the dough relaxes and the flavours mingle.' },
      { title:'ROLL IT OUT',     body:'Divide into balls. Dust with flour and roll each into a round paratha of even thickness.' },
      { title:'COOK ON THE TAWA',body:'Cook on a hot tawa, flipping and smearing with ghee, until golden-brown spots appear on both sides.' },
    ],
    goodness: ['Iron-rich greens','Wholesome & filling','Great for lunchboxes','Warming in winter'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧈', label:'White Butter' }],
    tip: 'Squeezing salted methi before kneading removes the bitterness and keeps the dough from turning soggy.',
    tags: ['Vegetarian'],
  },
  {
    id: 'methi-thepla',
    title: 'Methi Thepla',
    script: 'Gujarati Spiced Flatbread',
    badge: 'GUJARATI TRAVEL STAPLE',
    blurb: 'Thin, soft and lightly spiced flatbreads with methi and besan — the beloved lunchbox and journey companion!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🫓',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',         sub:'(atta)',         cal:800, key:'atta' },
      { icon:'🫘', t:'frac',  q:3,    u:'tbsp', name:'gram flour',                sub:'(besan)',        cal:120, key:'besan' },
      { icon:'🌿', t:'frac',  q:1,    u:'cup',  name:'fresh methi leaves, chopped', sub:'(fenugreek)',  cal:50,  key:'methi' },
      { icon:'🥛', t:'frac',  q:3,    u:'tbsp', name:'yogurt',                    sub:'',               cal:30,  key:'yogurt' },
      { icon:'🌈', t:'frac',  q:1,    u:'tsp',  name:'turmeric, red chilli & cumin', sub:'(mixed)',     cal:12,  key:'spice-mix' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger-garlic paste',       sub:'',               cal:15,  key:'ginger-garlic' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',            sub:'',               cal:0,   key:'salt' },
      { icon:'🛢️',t:'frac',  q:4,    u:'tbsp', name:'oil',                       sub:'(to cook)',      cal:480, key:'oil' },
    ],
    method: [
      { title:'MIX THE DOUGH',   body:'Combine atta, besan, chopped methi, yogurt, spice mix, ginger-garlic paste and salt in a bowl.' },
      { title:'KNEAD SOFT',      body:'Add a little water and knead into a smooth, soft dough. Drizzle a teaspoon of oil and rest 15 minutes.' },
      { title:'ROLL THIN',       body:'Divide into small balls and roll each out thin — theplas should be noticeably thinner than a paratha.' },
      { title:'COOK ON THE TAWA',body:'Cook on a hot tawa, smearing a little oil on each side, until tiny golden spots appear.' },
      { title:'COOL & STACK',    body:'Cool the theplas fully before stacking so they stay soft and travel well for days.' },
    ],
    goodness: ['Travel-friendly','Stays soft for days','Protein from besan','Light & digestible'],
    serveWith: [{ icon:'🫙', label:'Pickle' }, { icon:'🥭', label:'Chundo' }, { icon:'🍵', label:'Masala Chai' }],
    tip: 'Cool theplas completely before stacking — trapped steam makes them soggy and they won\'t keep for travel.',
    tags: ['Vegetarian'],
  },
  {
    id: 'aloo-paratha',
    title: 'Aloo Paratha',
    script: 'Stuffed Spiced Potato Bread',
    badge: 'PUNJABI BREAKFAST CLASSIC',
    blurb: 'Golden parathas stuffed with soft spiced potato and cooked in ghee — the ultimate hearty Punjabi breakfast!',
    readyMins: 45,
    baseServings: 4,
    heroEmoji: '🥔',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',       sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🥔', t:'count', q:4,    u:'',      name:'potatoes, boiled',        sub:'',              cal:310, key:'potato' },
      { icon:'🧅', t:'count', q:1,    u:'',      name:'onion, finely chopped',   sub:'',              cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',  sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',          sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:2,    u:'tsp',  name:'garam masala & chilli powder', sub:'(mixed)',  cal:20,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',            cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',          sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                    sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with a little salt and water into a soft, smooth dough. Rest under a damp cloth for 20 minutes.' },
      { title:'MAKE THE FILLING', body:'Mash the boiled potatoes and mix with onion, green chilli, ginger, spices, coriander and salt until well combined.' },
      { title:'STUFF THE BALLS',  body:'Roll a dough ball into a small disc, place a spoon of filling in the centre, gather the edges and seal completely.' },
      { title:'ROLL GENTLY',      body:'Dust with flour and roll the stuffed ball out gently into a round paratha, keeping the filling even inside.' },
      { title:'COOK IN GHEE',     body:'Cook on a hot tawa, smearing ghee on each side, until deep golden and crisp-spotted all over.' },
    ],
    goodness: ['Hearty & filling','Comforting classic','Kid-friendly','Great for lunchboxes'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧈', label:'White Butter' }],
    tip: 'Let the mashed potato cool fully before stuffing — warm filling releases steam that tears the paratha.',
    tags: ['Vegetarian'],
  },
  {
    id: 'aloo-gobi-paratha',
    title: 'Aloo Gobi Paratha',
    script: 'Potato & Cauliflower Stuffed Bread',
    badge: 'HEARTY WINTER STUFFED PARATHA',
    blurb: 'Twice the comfort — spiced potato and grated cauliflower tucked into a golden paratha for a filling, flavour-packed meal!',
    readyMins: 50,
    baseServings: 4,
    heroEmoji: '🥔',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🥔', t:'count', q:2,    u:'',      name:'potatoes, boiled',         sub:'',              cal:155, key:'potato' },
      { icon:'🥦', t:'frac',  q:2,    u:'cups', name:'cauliflower, grated',      sub:'(gobi)',        cal:60,  key:'gobi' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',           sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:2,    u:'tsp',  name:'garam masala & chilli powder', sub:'(mixed)',   cal:20,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',             cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                     sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with salt and water into a soft dough. Cover and rest for 20 minutes.' },
      { title:'DRY THE GOBI',     body:'Grate the cauliflower, sprinkle with salt, rest 10 minutes, then squeeze out all the moisture firmly.' },
      { title:'MAKE THE FILLING', body:'Mash the boiled potatoes and mix with the squeezed cauliflower, green chilli, ginger, spices, coriander and salt.' },
      { title:'STUFF & SEAL',     body:'Roll a dough disc, add a spoon of filling, gather and pinch the edges shut so no filling peeks out.' },
      { title:'ROLL & COOK',      body:'Roll gently into a round, then cook on a hot tawa with ghee until golden and crisp on both sides.' },
    ],
    goodness: ['Extra filling','Sneaks in veggies','Warming in winter','Great for lunchboxes'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧈', label:'White Butter' }],
    tip: 'Squeeze the grated cauliflower really dry — excess water is the main reason stuffed parathas tear while rolling.',
    tags: ['Vegetarian'],
  },
  {
    id: 'mooli-paratha',
    title: 'Mooli Paratha',
    script: 'Stuffed Radish Flatbread',
    badge: 'PUNJABI WINTER SPECIAL',
    blurb: 'Peppery grated radish spiced and stuffed into soft parathas — a crisp, warming winter treat straight from the tawa!',
    readyMins: 45,
    baseServings: 4,
    heroEmoji: '🥬',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🥬', t:'frac',  q:2,    u:'cups', name:'white radish, grated',     sub:'(mooli)',       cal:40,  key:'mooli' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',           sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:1,    u:'tsp',  name:'ajwain & red chilli powder', sub:'(mixed)',     cal:10,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',             cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                     sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with salt and water into a soft, smooth dough. Cover and rest for 20 minutes.' },
      { title:'DRAIN THE MOOLI',  body:'Grate the radish, sprinkle generously with salt, rest 15 minutes, then squeeze out every bit of the watery liquid.' },
      { title:'MAKE THE FILLING', body:'Mix the squeezed radish with green chilli, ginger, ajwain-chilli mix, coriander and a little salt.' },
      { title:'STUFF & SEAL',     body:'Roll a dough disc, place the filling in the centre, gather the edges and seal tightly into a ball.' },
      { title:'ROLL & COOK',      body:'Roll gently into a round paratha, then cook on a hot tawa with ghee until golden and crisp-spotted.' },
    ],
    goodness: ['Light & digestive','Peppery & warming','Low in calories','Winter favourite'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧈', label:'White Butter' }],
    tip: 'Salt and squeeze the mooli hard before mixing — its water will otherwise seep out and make sealing impossible.',
    tags: ['Vegetarian'],
  },
  {
    id: 'gobi-paratha',
    title: 'Gobi Paratha',
    script: 'Stuffed Cauliflower Flatbread',
    badge: 'PUNJABI DHABA FAVOURITE',
    blurb: 'Fluffy parathas packed with spiced grated cauliflower and cooked crisp in ghee — a dhaba-style delight!',
    readyMins: 45,
    baseServings: 4,
    heroEmoji: '🥦',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🥦', t:'frac',  q:3,    u:'cups', name:'cauliflower, grated',      sub:'(gobi)',        cal:90,  key:'gobi' },
      { icon:'🧅', t:'count', q:1,    u:'',      name:'onion, finely chopped',    sub:'',              cal:44,  key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',           sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:2,    u:'tsp',  name:'garam masala & chilli powder', sub:'(mixed)',   cal:20,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',             cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                     sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with salt and water into a soft dough. Cover with a damp cloth and rest for 20 minutes.' },
      { title:'DRY THE GOBI',     body:'Grate the cauliflower fine, sprinkle with salt, rest 10 minutes, then squeeze out all the moisture thoroughly.' },
      { title:'MAKE THE FILLING', body:'Mix the squeezed cauliflower with onion, green chilli, ginger, spices, coriander and salt.' },
      { title:'STUFF & SEAL',     body:'Roll a dough disc, add a spoon of filling, gather and pinch the edges together so nothing escapes.' },
      { title:'ROLL & COOK',      body:'Roll gently into a round, then cook on a hot tawa with ghee until crisp and golden on both sides.' },
    ],
    goodness: ['Veggie-packed','Crisp & satisfying','Great for lunchboxes','Kid-friendly'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧈', label:'White Butter' }],
    tip: 'Grate the cauliflower as finely as possible so the filling spreads evenly and the paratha rolls without tearing.',
    tags: ['Vegetarian'],
  },
  {
    id: 'paneer-paratha',
    title: 'Paneer Paratha',
    script: 'Stuffed Cottage Cheese Bread',
    badge: 'PROTEIN-RICH PUNJABI TREAT',
    blurb: 'Soft parathas generously stuffed with spiced crumbled paneer — rich, filling and utterly satisfying!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🧀',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🧀', t:'frac',  q:2,    u:'cups', name:'paneer, grated',           sub:'(cottage cheese)', cal:640, key:'paneer' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',           sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:2,    u:'tsp',  name:'garam masala & chilli powder', sub:'(mixed)',   cal:20,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',             cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                     sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with salt and water into a soft, smooth dough. Cover and rest for 20 minutes.' },
      { title:'MAKE THE FILLING', body:'Grate the paneer and mix with green chilli, ginger, spices, coriander and salt until evenly combined.' },
      { title:'STUFF THE BALLS',  body:'Roll a dough disc, place a generous spoon of paneer filling in the centre, gather and seal the edges.' },
      { title:'ROLL GENTLY',      body:'Dust with flour and roll the stuffed ball out gently so the soft filling stays inside.' },
      { title:'COOK IN GHEE',     body:'Cook on a hot tawa, smearing ghee on each side, until golden and crisp-spotted all over.' },
    ],
    goodness: ['High in protein','Rich & filling','Kid-friendly','Great for lunchboxes'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🧅', label:'Onion Rings' }],
    tip: 'Grate the paneer fresh and don\'t over-mix the filling — a light hand keeps it soft rather than dense and crumbly.',
    tags: ['Vegetarian'],
  },
  {
    id: 'onion-paratha',
    title: 'Onion Paratha',
    script: 'Stuffed Spiced Onion Bread',
    badge: 'QUICK EVERYDAY STUFFED PARATHA',
    blurb: 'Crisp golden parathas filled with sweet-sharp spiced onions — a quick, flavourful favourite any time of day!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🧅',
    ingredients: [
      { icon:'🌾', t:'frac',  q:2,    u:'cups', name:'whole wheat flour',        sub:'(atta)',        cal:800, key:'atta' },
      { icon:'🧅', t:'count', q:3,    u:'',      name:'onions, finely chopped',   sub:'',              cal:132, key:'onion' },
      { icon:'🌶️',t:'count', q:2,    u:'',      name:'green chillies, minced',   sub:'',              cal:8,   key:'green-chilli' },
      { icon:'🧄', t:'frac',  q:1,    u:'tsp',  name:'ginger, grated',           sub:'',              cal:5,   key:'ginger' },
      { icon:'🌈', t:'frac',  q:2,    u:'tsp',  name:'chaat masala & red chilli', sub:'(mixed)',      cal:15,  key:'spice-mix' },
      { icon:'🌿', t:'frac',  q:2,    u:'tbsp', name:'coriander leaves, chopped', sub:'',             cal:5,   key:'coriander' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',              cal:0,   key:'salt' },
      { icon:'🧈', t:'frac',  q:4,    u:'tbsp', name:'ghee',                     sub:'(to cook)',     cal:480, key:'ghee' },
    ],
    method: [
      { title:'MAKE THE DOUGH',   body:'Knead the atta with salt and water into a soft, smooth dough. Cover and rest for 20 minutes.' },
      { title:'MAKE THE FILLING', body:'Mix the finely chopped onions with green chilli, ginger, chaat-chilli mix and coriander. Add salt only just before stuffing.' },
      { title:'STUFF & SEAL',     body:'Roll a dough disc, add the onion filling, gather the edges and seal tightly into a ball.' },
      { title:'ROLL GENTLY',      body:'Dust with flour and roll gently into a round paratha, keeping the filling evenly spread.' },
      { title:'COOK IN GHEE',     body:'Cook on a hot tawa, smearing ghee on each side, until crisp and golden-spotted.' },
    ],
    goodness: ['Quick to make','Crisp & flavourful','Everyday favourite','Great for lunchboxes'],
    serveWith: [{ icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }, { icon:'🍵', label:'Masala Chai' }],
    tip: 'Add salt to the onion filling only right before stuffing — salting early draws out water and makes the parathas soggy.',
    tags: ['Vegetarian'],
  },
  {
    id: 'tamarind-pulihora',
    title: 'Tamarind Pulihora',
    script: 'Tangy, Golden & Festive',
    badge: 'AN ANDHRA FESTIVE FAVOURITE',
    blurb: 'Sour, spicy & deeply aromatic — the temple-style tamarind rice Andhra homes make for every festival!',
    readyMins: 35,
    baseServings: 4,
    heroEmoji: '🍚',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,   u:'cups',   name:'raw rice, cooked & cooled', sub:'(fluffy, grains separate)', cal:820, key:'rice' },
      { icon:'🟤', t:'frac',  q:1,   u:'lime-size', name:'tamarind',              sub:'(soaked & pulped)',        cal:20,  key:'tamarind' },
      { icon:'🥜', t:'frac',  q:3,   u:'tbsp',   name:'peanuts',                  sub:'',                         cal:160, key:'peanuts' },
      { icon:'🫘', t:'frac',  q:2,   u:'tbsp',   name:'chana & urad dal',         sub:'(mixed)',                  cal:110, key:'dal' },
      { icon:'🌶️',t:'range', low:3, high:4, u:'', name:'dried red chillies',      sub:'',                         cal:15,  key:'red-chilli' },
      { icon:'🟡', t:'frac',  q:0.5, u:'tsp',    name:'turmeric powder',          sub:'',                         cal:4,   key:'turmeric' },
      { icon:'🌿', t:'count', q:2,   u:'sprigs', name:'curry leaves',             sub:'',                         cal:2,   key:'curry-leaves' },
      { icon:'🛢️',t:'frac',  q:3,   u:'tbsp',   name:'sesame oil',               sub:'',                         cal:360, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',           sub:'',                         cal:0,   key:'salt' },
    ],
    method: [
      { title:'PREP THE TAMARIND', body:'Soak tamarind in warm water for 15 minutes, then squeeze out a thick, smooth pulp and discard the fibres.' },
      { title:'TEMPER THE SPICES', body:'Heat sesame oil and add mustard seeds. Once they splutter, add peanuts, chana dal, urad dal, red chillies & curry leaves. Fry until golden.' },
      { title:'COOK THE PULP',     body:'Pour in the tamarind pulp with turmeric and salt. Simmer 8–10 minutes until the raw smell goes and the oil separates.' },
      { title:'MIX THE RICE',      body:'Add the cooked, cooled rice and gently fold so every grain is coated in the tangy golden paste. Don\'t mash it.' },
      { title:'REST & SERVE',      body:'Cover and rest for 20 minutes so the flavours soak in. Pulihora always tastes better after resting!' },
    ],
    goodness: ['Naturally vegan','Rich in healthy fats','Travels & keeps well','Bursting with tang'],
    serveWith: [{ icon:'🥔', label:'Potato Fry' }, { icon:'🥣', label:'Curd' }, { icon:'🍤', label:'Fryums' }],
    tip: 'Always cool the rice completely before mixing — warm rice turns sticky and clumps instead of staying separate.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'lemon-rice',
    title: 'Lemon Rice',
    script: 'Zesty, Bright & Quick',
    badge: 'A SOUTH INDIAN STAPLE',
    blurb: 'Fresh, lemony & crunchy — the sunny chitrannam that turns leftover rice into a joyful meal in minutes!',
    readyMins: 20,
    baseServings: 4,
    heroEmoji: '🍋',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,   u:'cups',   name:'cooked rice, cooled',   sub:'(grains separate)', cal:820, key:'rice' },
      { icon:'🍋', t:'count', q:2,   u:'',       name:'lemons, juiced',        sub:'',                  cal:16,  key:'lemon' },
      { icon:'🥜', t:'frac',  q:3,   u:'tbsp',   name:'peanuts',               sub:'',                  cal:160, key:'peanuts' },
      { icon:'🫘', t:'frac',  q:2,   u:'tbsp',   name:'chana & urad dal',      sub:'(mixed)',           cal:110, key:'dal' },
      { icon:'🌶️',t:'count', q:2,   u:'',       name:'green chillies, slit',  sub:'',                  cal:8,   key:'green-chilli' },
      { icon:'🟡', t:'frac',  q:0.5, u:'tsp',    name:'turmeric powder',       sub:'',                  cal:4,   key:'turmeric' },
      { icon:'🌿', t:'count', q:2,   u:'sprigs', name:'curry leaves',          sub:'',                  cal:2,   key:'curry-leaves' },
      { icon:'🛢️',t:'frac',  q:2,   u:'tbsp',   name:'oil',                   sub:'',                  cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',        sub:'',                  cal:0,   key:'salt' },
    ],
    method: [
      { title:'TEMPER THE SPICES', body:'Heat oil and add mustard seeds. When they splutter, add peanuts, chana dal, urad dal, green chillies & curry leaves. Fry until golden.' },
      { title:'ADD TURMERIC',      body:'Lower the heat and stir in the turmeric powder for a few seconds so it blooms without burning.' },
      { title:'FOLD IN THE RICE',  body:'Add the cooled rice and salt. Gently toss until every grain glows an even yellow.' },
      { title:'SQUEEZE THE LEMON', body:'Turn off the heat first, then pour in the fresh lemon juice and mix. Adding it off the flame keeps it bright, never bitter.' },
      { title:'REST & SERVE',      body:'Cover for 5 minutes to let the tang settle in, then serve warm or pack it for lunch.' },
    ],
    goodness: ['Naturally vegan','Ready in minutes','Great for lunchboxes','Refreshingly light'],
    serveWith: [{ icon:'🍤', label:'Fryums' }, { icon:'🥣', label:'Curd' }, { icon:'🫙', label:'Pickle' }],
    tip: 'Never add lemon juice while the pan is hot — heat makes it turn bitter. Always squeeze it in off the flame.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'palak-rice',
    title: 'Palak Rice',
    script: 'Green, Wholesome & Mild',
    badge: 'A NOURISHING GREEN ONE-POT',
    blurb: 'Silky spinach, gentle spices & fluffy rice — a sneaky-healthy meal even the fussiest eaters love!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🥬',
    ingredients: [
      { icon:'🍚', t:'frac',  q:1.5, u:'cups',   name:'basmati rice',            sub:'(rinsed)',        cal:540, key:'rice' },
      { icon:'🥬', t:'count', q:1,   u:'bunch',  name:'spinach, blanched',       sub:'(pureed)',        cal:40,  key:'spinach' },
      { icon:'🧅', t:'count', q:1,   u:'',       name:'onion, sliced',           sub:'',                cal:44,  key:'onion' },
      { icon:'🍅', t:'count', q:1,   u:'',       name:'tomato, chopped',         sub:'',                cal:22,  key:'tomato' },
      { icon:'🧄', t:'frac',  q:1,   u:'tbsp',   name:'ginger-garlic paste',     sub:'',                cal:20,  key:'ginger-garlic' },
      { icon:'🌶️',t:'count', q:2,   u:'',       name:'green chillies, slit',    sub:'',                cal:8,   key:'green-chilli' },
      { icon:'🌰', t:'frac',  q:1,   u:'tbsp',   name:'whole garam spices',      sub:'(bay, clove, cardamom)', cal:10, key:'whole-spices' },
      { icon:'🛢️',t:'frac',  q:2,   u:'tbsp',   name:'oil or ghee',             sub:'',                cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',          sub:'',                cal:0,   key:'salt' },
    ],
    method: [
      { title:'BLANCH THE SPINACH', body:'Dip washed spinach in boiling water for 2 minutes, then into cold water. Blend into a smooth, bright-green puree.' },
      { title:'SOAK THE RICE',      body:'Rinse the basmati until the water runs clear and soak for 20 minutes, then drain.' },
      { title:'BUILD THE BASE',     body:'Heat oil and crackle the whole garam spices. Add onion, green chillies & ginger-garlic paste; saute until golden. Add tomato and cook till soft.' },
      { title:'ADD THE PUREE',      body:'Pour in the spinach puree with salt and simmer for 3 minutes until it thickens slightly and the raw smell goes.' },
      { title:'COOK THE RICE',      body:'Add the drained rice and 3 cups water. Bring to a boil, then cover and cook on low until fluffy.' },
      { title:'FLUFF & REST',       body:'Rest 5 minutes, then fluff gently with a fork so the grains stay separate and green.' },
    ],
    goodness: ['Loaded with iron','Kid-friendly greens','Wholesome one-pot','Naturally colourful'],
    serveWith: [{ icon:'🥣', label:'Raita' }, { icon:'🥔', label:'Aloo Fry' }, { icon:'🫙', label:'Pickle' }],
    tip: 'Shock the blanched spinach in cold water at once — it locks in that vivid green so the rice never turns dull or khaki.',
    tags: ['Vegetarian', 'Gluten-free'],
  },
  {
    id: 'mint-rice',
    title: 'Mint Rice',
    script: 'Cool, Fragrant & Fresh',
    badge: 'A FRESH PUDINA ONE-POT',
    blurb: 'Cooling mint, warm spices & fluffy rice — a fragrant pudina pulao that\'s a lunchbox hero!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🌿',
    ingredients: [
      { icon:'🍚', t:'frac',  q:1.5, u:'cups',   name:'basmati rice',           sub:'(rinsed)',   cal:540, key:'rice' },
      { icon:'🌿', t:'count', q:1,   u:'cup',    name:'fresh mint leaves',      sub:'(packed)',   cal:15,  key:'mint' },
      { icon:'🍃', t:'frac',  q:0.5, u:'cup',    name:'coriander leaves',       sub:'',           cal:8,   key:'coriander' },
      { icon:'🧅', t:'count', q:1,   u:'',       name:'onion, sliced',          sub:'',           cal:44,  key:'onion' },
      { icon:'🧄', t:'frac',  q:1,   u:'tbsp',   name:'ginger-garlic paste',    sub:'',           cal:20,  key:'ginger-garlic' },
      { icon:'🌶️',t:'count', q:3,   u:'',       name:'green chillies',         sub:'',           cal:12,  key:'green-chilli' },
      { icon:'🌰', t:'frac',  q:1,   u:'tbsp',   name:'whole garam spices',     sub:'(bay, clove, cardamom)', cal:10, key:'whole-spices' },
      { icon:'🛢️',t:'frac',  q:2,   u:'tbsp',   name:'oil or ghee',            sub:'',           cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',         sub:'',           cal:0,   key:'salt' },
    ],
    method: [
      { title:'GRIND THE MINT', body:'Blend mint, coriander, green chillies & ginger-garlic paste with a splash of water into a smooth green paste.' },
      { title:'SOAK THE RICE',  body:'Rinse the basmati until clear and soak for 20 minutes, then drain well.' },
      { title:'TEMPER & SAUTE', body:'Heat oil and crackle the whole garam spices. Add the sliced onion and fry until soft and golden.' },
      { title:'COOK THE PASTE', body:'Add the green mint paste and saute 3–4 minutes until the raw smell disappears and the oil peeks through.' },
      { title:'ADD THE RICE',   body:'Stir in the drained rice and salt, then pour in 3 cups water. Boil, cover and cook on low until done.' },
      { title:'FLUFF & REST',   body:'Rest 5 minutes, then fluff gently so every grain stays fragrant and separate.' },
    ],
    goodness: ['Cooling & fragrant','Aids digestion','Great for lunchboxes','Naturally vegan'],
    serveWith: [{ icon:'🥣', label:'Raita' }, { icon:'🧅', label:'Onion Salad' }, { icon:'🍟', label:'Papad' }],
    tip: 'Use only the leaves, never the stalks — mint stems turn the rice bitter. Pluck them off before grinding.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'coconut-rice',
    title: 'Coconut Rice',
    script: 'Nutty, Creamy & Comforting',
    badge: 'A TEMPLE-STYLE THENGAI SADAM',
    blurb: 'Fresh coconut, toasted dals & mild spice — the soft, nutty thengai sadam of South Indian kitchens!',
    readyMins: 25,
    baseServings: 4,
    heroEmoji: '🥥',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,   u:'cups',   name:'cooked rice, cooled',   sub:'(grains separate)', cal:820, key:'rice' },
      { icon:'🥥', t:'count', q:1,   u:'cup',    name:'fresh grated coconut',  sub:'',                  cal:280, key:'coconut' },
      { icon:'🥜', t:'frac',  q:2,   u:'tbsp',   name:'cashews',               sub:'',                  cal:130, key:'cashews' },
      { icon:'🫘', t:'frac',  q:2,   u:'tbsp',   name:'chana & urad dal',      sub:'(mixed)',           cal:110, key:'dal' },
      { icon:'🌶️',t:'range', low:2, high:3, u:'', name:'dried red chillies',   sub:'',                  cal:12,  key:'red-chilli' },
      { icon:'🫚', t:'frac',  q:1,   u:'inch',   name:'ginger, grated',        sub:'',                  cal:5,   key:'ginger' },
      { icon:'🌿', t:'count', q:2,   u:'sprigs', name:'curry leaves',          sub:'',                  cal:2,   key:'curry-leaves' },
      { icon:'🛢️',t:'frac',  q:2,   u:'tbsp',   name:'coconut oil',           sub:'',                  cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',        sub:'',                  cal:0,   key:'salt' },
    ],
    method: [
      { title:'TEMPER THE SPICES', body:'Heat coconut oil and add mustard seeds. When they splutter, add cashews, chana dal, urad dal, red chillies & curry leaves. Fry until golden.' },
      { title:'ADD THE GINGER',    body:'Stir in the grated ginger and saute a few seconds until fragrant.' },
      { title:'TOAST THE COCONUT', body:'Add the grated coconut and roast on low heat, stirring, until it turns light golden and smells nutty. Don\'t let it brown too far.' },
      { title:'FOLD IN THE RICE',  body:'Add the cooled rice and salt. Gently toss until the coconut coats every grain evenly.' },
      { title:'REST & SERVE',      body:'Cover and rest 5 minutes so the flavours mingle, then serve warm.' },
    ],
    goodness: ['Naturally vegan','Soothing & mild','Great for kids','Gluten-free comfort'],
    serveWith: [{ icon:'🫙', label:'Pickle' }, { icon:'🍟', label:'Papad' }, { icon:'🥔', label:'Potato Fry' }],
    tip: 'Roast the coconut only until pale gold — take it too dark and it turns dry and bitter instead of soft and nutty.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'tomato-rice',
    title: 'Tomato Rice',
    script: 'Tangy, Spicy & Comforting',
    badge: 'A ZESTY THAKKALI SADAM',
    blurb: 'Ripe tomatoes, warm spices & fluffy rice — the tangy thakkali sadam that\'s pure lunchbox comfort!',
    readyMins: 30,
    baseServings: 4,
    heroEmoji: '🍅',
    ingredients: [
      { icon:'🍚', t:'frac',  q:1.5, u:'cups',   name:'rice, cooked & cooled', sub:'(grains separate)', cal:615, key:'rice' },
      { icon:'🍅', t:'count', q:4,   u:'',       name:'ripe tomatoes, pureed', sub:'',                  cal:88,  key:'tomato' },
      { icon:'🧅', t:'count', q:1,   u:'',       name:'onion, chopped',        sub:'',                  cal:44,  key:'onion' },
      { icon:'🧄', t:'frac',  q:1,   u:'tbsp',   name:'ginger-garlic paste',   sub:'',                  cal:20,  key:'ginger-garlic' },
      { icon:'🌶️',t:'frac',  q:1,   u:'tbsp',   name:'red chilli powder',     sub:'',                  cal:16,  key:'chilli-powder' },
      { icon:'🟡', t:'frac',  q:0.5, u:'tsp',    name:'turmeric powder',       sub:'',                  cal:4,   key:'turmeric' },
      { icon:'🌿', t:'count', q:2,   u:'sprigs', name:'curry leaves',          sub:'',                  cal:2,   key:'curry-leaves' },
      { icon:'🛢️',t:'frac',  q:2,   u:'tbsp',   name:'oil',                   sub:'',                  cal:240, key:'oil' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',        sub:'',                  cal:0,   key:'salt' },
    ],
    method: [
      { title:'TEMPER THE SPICES', body:'Heat oil and add mustard seeds. When they splutter, add curry leaves and the chopped onion. Saute until the onion turns soft and golden.' },
      { title:'ADD AROMATICS',     body:'Stir in the ginger-garlic paste and cook until the raw smell goes.' },
      { title:'COOK THE TOMATO',   body:'Add the tomato puree, chilli powder, turmeric & salt. Simmer 8–10 minutes until it thickens and the oil separates.' },
      { title:'FOLD IN THE RICE',  body:'Add the cooled rice and gently toss until every grain is coated in the deep red masala.' },
      { title:'REST & SERVE',      body:'Cover and rest 5 minutes so the flavours soak in, then serve warm.' },
    ],
    goodness: ['Naturally vegan','Rich in lycopene','Great for lunchboxes','Comforting & tangy'],
    serveWith: [{ icon:'🥣', label:'Raita' }, { icon:'🍟', label:'Papad' }, { icon:'🥔', label:'Potato Fry' }],
    tip: 'Cook the tomato base until the oil floats to the top — that\'s the sign the raw tang is gone and the rice won\'t taste sharp.',
    tags: ['Vegan', 'Gluten-free'],
  },
  {
    id: 'kushka',
    title: 'Kushka',
    script: 'Fragrant, Fluffy & Rich',
    badge: 'A DHABA-STYLE PLAIN BIRYANI',
    blurb: 'All the aroma of biryani, none of the fuss — soft, fragrant rice cooked in whole spices & ghee!',
    readyMins: 40,
    baseServings: 4,
    heroEmoji: '🍚',
    ingredients: [
      { icon:'🍚', t:'frac',  q:2,   u:'cups',   name:'basmati rice',         sub:'(rinsed & soaked)', cal:720, key:'rice' },
      { icon:'🧅', t:'count', q:2,   u:'',       name:'onions, sliced',       sub:'',                  cal:88,  key:'onion' },
      { icon:'🧄', t:'frac',  q:1.5, u:'tbsp',   name:'ginger-garlic paste',  sub:'',                  cal:30,  key:'ginger-garlic' },
      { icon:'🌶️',t:'count', q:3,   u:'',       name:'green chillies, slit',  sub:'',                  cal:12,  key:'green-chilli' },
      { icon:'🌰', t:'frac',  q:1,   u:'tbsp',   name:'whole garam spices',   sub:'(bay, clove, cardamom, cinnamon)', cal:12, key:'whole-spices' },
      { icon:'🥛', t:'frac',  q:0.5, u:'cup',    name:'yogurt',               sub:'(whisked)',         cal:75,  key:'yogurt' },
      { icon:'🌿', t:'frac',  q:0.25,u:'cup',    name:'mint & coriander',     sub:'(chopped)',         cal:6,   key:'herbs' },
      { icon:'🧈', t:'frac',  q:3,   u:'tbsp',   name:'ghee',                 sub:'',                  cal:340, key:'ghee' },
      { icon:'🧂', t:'taste', text:'',           name:'salt, to taste',       sub:'',                  cal:0,   key:'salt' },
    ],
    method: [
      { title:'SOAK THE RICE',   body:'Rinse the basmati until the water runs clear and soak for 30 minutes, then drain.' },
      { title:'TEMPER THE SPICES', body:'Heat ghee and crackle the whole garam spices. Add the sliced onions and fry until deep golden.' },
      { title:'BUILD THE BASE',  body:'Add ginger-garlic paste and green chillies; saute until the raw smell goes. Stir in the whisked yogurt, mint & coriander and cook 2 minutes.' },
      { title:'ADD WATER & RICE', body:'Pour in 3.5 cups water with salt and bring to a rolling boil. Add the drained rice and stir once gently.' },
      { title:'DUM COOK',        body:'Cover tightly and cook on the lowest heat for 12–15 minutes until the water is absorbed and the grains are tender.' },
      { title:'REST & FLUFF',    body:'Rest 10 minutes off the heat, then fluff gently with a fork so the grains stay long and separate.' },
    ],
    goodness: ['Fragrant & festive','Pairs with any curry','Lighter than biryani','Rich yet fluffy'],
    serveWith: [{ icon:'🍛', label:'Salna' }, { icon:'🥣', label:'Raita' }, { icon:'🥚', label:'Boiled Egg' }],
    tip: 'Keep the lid sealed through the whole dum — every peek lets the steam escape and leaves the rice half-cooked in patches.',
    tags: ['Vegetarian'],
  },
];

/* ── Global state ───────────────────────────────────────────────── */
let currentIdx = 0;
let adults     = 2;
let children   = 0;

try {
  const saved = JSON.parse(localStorage.getItem('paka.servings') || 'null');
  if (saved && Number.isFinite(saved.adults) && Number.isFinite(saved.children)) {
    adults = saved.adults; children = saved.children;
  }
} catch (e) {}

function saveServings() {
  try { localStorage.setItem('paka.servings', JSON.stringify({ adults, children })); } catch (e) {}
}

/* ── Reaction storage helpers ───────────────────────────────────── */
function loadStats() {
  try { return JSON.parse(localStorage.getItem('paka.stats') || '{}'); } catch(e) { return {}; }
}
function saveStats(stats) {
  try { localStorage.setItem('paka.stats', JSON.stringify(stats)); } catch(e) {}
}
function getRecipeStats(id) {
  const s = loadStats();
  return s[id] || { likes: 0, loves: 0, saves: 0 };
}
function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch(e) { return new Set(); }
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch(e) {}
}

/* ── Admin mode (add ?admin=1 to URL) ──────────────────────────── */
const isAdmin = new URLSearchParams(location.search).get('admin') === '1';
if (isAdmin) {
  const banner = document.getElementById('adminBanner');
  if (banner) banner.style.display = 'block';
}

/* ── Admin photo upload ─────────────────────────────────────────── */
function attachAdminUpload(recipe) {
  const inp = document.getElementById('adminFileInput');
  if (!inp) return;
  inp.addEventListener('change', () => {
    const file = inp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try { localStorage.setItem('paka.photo.' + recipe.id, e.target.result); } catch(err) {}
      renderFlyer(recipes.indexOf(recipe), false);
    };
    reader.readAsDataURL(file);
  });
}

/* ── QR code modal ──────────────────────────────────────────────── */
const qrOverlay  = document.getElementById('qrOverlay');
const qrModalBox = document.getElementById('qrModalBox');
const qrClose    = document.getElementById('qrClose');
const qrCanvas   = document.getElementById('qrCanvas');

function showQr(recipe) {
  const subject = encodeURIComponent('I cooked ' + recipe.title + ' from Pāka!');
  const body    = encodeURIComponent('Here is my photo of ' + recipe.title + ':');
  const link    = 'mailto:prasanthiml@gmail.com?subject=' + subject + '&body=' + body;
  document.getElementById('qrRecipeName').textContent = recipe.title;
  QRCode.toCanvas(qrCanvas, link, { width: 200, color: { dark:'#1f5a22', light:'#fbf3d3' } });
  qrOverlay.classList.add('open');
}

if (qrClose)   qrClose.addEventListener('click',  () => qrOverlay.classList.remove('open'));
if (qrOverlay) qrOverlay.addEventListener('click', e => { if (e.target === qrOverlay) qrOverlay.classList.remove('open'); });

/* ── Suggest a recipe modal ─────────────────────────────────────── */
const suggestOverlay = document.getElementById('suggestOverlay');
const suggestClose   = document.getElementById('suggestClose');
const suggestSubmit  = document.getElementById('suggestSubmit');
const suggestInput   = document.getElementById('suggestInput');
const suggestBtn     = document.getElementById('suggestBtn');

if (suggestBtn)     suggestBtn.addEventListener('click',  () => suggestOverlay.classList.add('open'));
if (suggestClose)   suggestClose.addEventListener('click', () => suggestOverlay.classList.remove('open'));
if (suggestOverlay) suggestOverlay.addEventListener('click', e => { if (e.target === suggestOverlay) suggestOverlay.classList.remove('open'); });
if (suggestSubmit) {
  suggestSubmit.addEventListener('click', () => {
    const text = suggestInput ? suggestInput.value.trim() : '';
    if (!text) return;
    const subject = encodeURIComponent('Recipe Suggestion for Pāka');
    const body    = encodeURIComponent(text);
    window.location.href = 'mailto:prasanthiml@gmail.com?subject=' + subject + '&body=' + body;
    suggestOverlay.classList.remove('open');
    if (suggestInput) suggestInput.value = '';
  });
}

/* ── Tag category helper ────────────────────────────────────────── */
const DIET_TAGS    = new Set(['Vegan','Vegetarian']);
const HEALTH_TAGS  = new Set(['Gluten-free','Diabetic-friendly','Low-calorie','Light']);
function tagCat(t) {
  if (DIET_TAGS.has(t))   return 'diet';
  if (HEALTH_TAGS.has(t)) return 'health';
  return 'nutrition';
}

/* ── Build flyer HTML ───────────────────────────────────────────── */
function buildFlyer(recipe) {
  const { ingredients, totalCal, perServing, servesLabel } = computeServings(recipe, adults, children);

  const ingRows = ingredients.map((ing, i) => `
    <li class="ing-item">
      <span class="ing-icon">${ing.icon}</span>
      <span class="ing-text">
        <b id="iq-${i}">${ing.qty || ''}</b>${ing.qty ? ' ' : ''}${ing.name}
        ${ing.sub ? `<span class="ing-sub">${ing.sub}</span>` : ''}
      </span>
      <span class="ing-cal" id="ic-${i}">${ing.cal > 0 ? ing.cal + ' cal' : ''}</span>
    </li>`).join('');

  const methodSteps = recipe.method.map((s, i) => `
    <li class="method-item">
      <span class="step-num">${i + 1}</span>
      <div class="step-body">
        <div class="step-title">${s.title}</div>
        <p>${s.body}</p>
      </div>
    </li>`).join('');

  const serveItems = recipe.serveWith.map((s, i) => `
    ${i > 0 ? '<div class="serve-divider"></div>' : ''}
    <div class="serve-item">
      <span class="serve-item-icon">${s.icon}</span>
      <span class="serve-item-label">${s.label}</span>
    </div>`).join('');

  const goodItems = recipe.goodness.map(g =>
    `<div class="goodness-item"><span class="goodness-check">✓</span>${g}</div>`
  ).join('');

  const tagHtml = (recipe.tags || []).map(t =>
    `<span class="diet-tag" data-cat="${tagCat(t)}">${t}</span>`
  ).join('');

  const storedPhoto = (() => { try { return localStorage.getItem('paka.photo.' + recipe.id); } catch(e) { return null; } })();
  const twemojiUrl  = (() => {
    const cp = [...recipe.heroEmoji].map(c => c.codePointAt(0).toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`;
  })();
  const heroSrc   = storedPhoto || twemojiUrl;
  const heroMedia = `<img class="hero-img${storedPhoto ? '' : ' hero-emoji'}" src="${heroSrc}" alt="${recipe.title}">`;

  const rStats  = getRecipeStats(recipe.id);
  const myLikes = loadSet('paka.myLikes');
  const myLoves = loadSet('paka.myLoves');
  const mySaves = loadSet('paka.mySaves');
  const likePanelHtml = `
    <div class="like-panel">
      <button class="like-btn${myLikes.has(recipe.id) ? ' active' : ''}" id="likeBtn">
        👍 <span id="likeCnt">${rStats.likes}</span>
      </button>
      <button class="like-btn${myLoves.has(recipe.id) ? ' active' : ''}" id="loveBtn">
        ❤️ <span id="loveCnt">${rStats.loves}</span>
      </button>
      <button class="like-btn save-btn${mySaves.has(recipe.id) ? ' active' : ''}" id="saveBtn">
        🔖 ${mySaves.has(recipe.id) ? 'Saved!' : 'Save'}
      </button>
    </div>`;

  return `
    <div class="leaf leaf1">🌿</div>
    <div class="leaf leaf2">🌿</div>
    <div class="leaf leaf3">🌿</div>

    <div class="flyer-header">
      <div class="title-col">
        <div class="recipe-script">${recipe.script}</div>
        <div class="title-wrap">
          <div class="title-blob"></div>
          <h1 class="recipe-title">${recipe.title}</h1>
        </div>
        <div class="badge-wrap">
          <span class="brush-banner green-banner">${recipe.badge}</span>
        </div>
        <p class="recipe-blurb">${recipe.blurb}</p>
        ${tagHtml ? `<div class="diet-tags">${tagHtml}</div>` : ''}
      </div>
      <div class="hero-col">
        ${heroMedia}
        ${isAdmin ? `<label class="admin-upload-btn" title="Upload recipe photo">📷 Upload Photo<input id="adminFileInput" type="file" accept="image/*"></label>` : ''}
        <button class="qr-btn" id="qrBtn">📲 Cooked it?</button>
        <div class="ready-badge">
          <span class="ready-top">Ready in</span>
          <span class="ready-num">${recipe.readyMins}</span>
          <span class="ready-bot">Mins!</span>
        </div>
      </div>
    </div>

    ${likePanelHtml}

    <div class="calc-box">
      <div class="cooking-for">Cooking<br>for?</div>

      <div class="stepper-group">
        <span class="stepper-label">🧑 Adults</span>
        <div class="stepper-row">
          <button class="step-btn" id="decAdult">−</button>
          <input class="step-input" id="inAdults" type="number" min="0" max="30" value="${adults}">
          <button class="step-btn" id="incAdult">+</button>
        </div>
      </div>

      <div class="stepper-group">
        <span class="stepper-label">🧒 Children</span>
        <div class="stepper-row">
          <button class="step-btn" id="decChild">−</button>
          <input class="step-input" id="inChildren" type="number" min="0" max="30" value="${children}">
          <button class="step-btn" id="incChild">+</button>
        </div>
      </div>

      <div class="cal-summary">
        <div class="cal-total"><span class="cal-approx">≈</span> <span id="totalCal">${totalCal}</span> <span class="cal-unit">calories</span></div>
        <div class="cal-sub">whole ${recipe.title} · <b id="perServing">${perServing}</b> cal per serving</div>
      </div>

      <div class="calc-note">Measurements & calories scale automatically · each child counts as ½ an adult portion.</div>
      <div class="cal-disclaimer">Calorie figures are an approximate guide — a ballpark estimate summed from raw ingredients, not exact or lab-measured. Actual values vary with brand, portion size &amp; how it's cooked.</div>
    </div>

    <div class="flyer-body">
      <div class="ing-col">
        <div class="section-head">
          <span class="brush-banner green-banner section-banner">INGREDIENTS <span class="serves-tag" id="servesLabel">${servesLabel}</span></span>
        </div>
        <ul class="ing-list">${ingRows}</ul>
        <div class="goodness-box">
          <div class="goodness-title">Goodness in every bite!</div>
          <div class="goodness-items">${goodItems}</div>
        </div>
      </div>

      <div class="method-col">
        <div class="section-head">
          <span class="brush-banner yellow-banner">METHOD</span>
        </div>
        <ol class="method-list">${methodSteps}</ol>
        ${recipe.tip ? `<div class="tip-box"><span class="tip-label">Tip · </span><span class="tip-text">${recipe.tip}</span></div>` : ''}
      </div>
    </div>

    ${recipe.serveWith.length ? `
    <div class="serve-section">
      <span class="brush-banner yellow-banner">SERVE IT WITH</span>
      <div class="serve-items">${serveItems}</div>
    </div>` : ''}

    <div class="flyer-footer">
      <div class="footer-left">Simple ingredients.<br>Amazing taste.</div>
      <div class="footer-right">Good Food,<br>Good Mood! 🙂</div>
    </div>
    <div class="footer-stripe"></div>`;
}

/* ── Update dynamic values without re-rendering ─────────────────── */
function updateScaling(recipe) {
  const { ingredients, totalCal, perServing, servesLabel } = computeServings(recipe, adults, children);

  const totalEl = document.getElementById('totalCal');
  const perEl   = document.getElementById('perServing');
  const srvEl   = document.getElementById('servesLabel');
  if (totalEl) totalEl.textContent = totalCal;
  if (perEl)   perEl.textContent   = perServing;
  if (srvEl)   srvEl.textContent   = servesLabel;

  ingredients.forEach((ing, i) => {
    const iqEl = document.getElementById(`iq-${i}`);
    const icEl = document.getElementById(`ic-${i}`);
    if (iqEl) iqEl.textContent = ing.qty || '';
    if (icEl) icEl.textContent = ing.cal > 0 ? ing.cal + ' cal' : '';
  });

  document.getElementById('inAdults').value   = adults;
  document.getElementById('inChildren').value = children;
}

/* ── Attach calculator listeners ────────────────────────────────── */
function attachCalcListeners(recipe) {
  const clamp = v => Math.max(0, Math.min(30, v));

  function change() { saveServings(); updateScaling(recipe); }

  document.getElementById('incAdult').onclick = () => { adults = clamp(adults + 1); change(); };
  document.getElementById('decAdult').onclick = () => { adults = clamp(adults - 1); change(); };
  document.getElementById('incChild').onclick = () => { children = clamp(children + 1); change(); };
  document.getElementById('decChild').onclick = () => { children = clamp(children - 1); change(); };

  document.getElementById('inAdults').onchange = e => {
    const v = parseInt(e.target.value, 10);
    adults = clamp(Number.isNaN(v) ? 0 : v);
    change();
  };
  document.getElementById('inChildren').onchange = e => {
    const v = parseInt(e.target.value, 10);
    children = clamp(Number.isNaN(v) ? 0 : v);
    change();
  };

  attachAdminUpload(recipe);
  attachLikeListeners(recipe);

  const qrBtn = document.getElementById('qrBtn');
  if (qrBtn) qrBtn.addEventListener('click', () => showQr(recipe));
}

/* ── Like / Love / Save listeners ───────────────────────────────── */
function toggleReaction(field, setKey, countId, btn, recipe) {
  const set   = loadSet(setKey);
  const stats = loadStats();
  if (!stats[recipe.id]) stats[recipe.id] = { likes: 0, loves: 0, saves: 0 };

  if (set.has(recipe.id)) {
    set.delete(recipe.id);
    stats[recipe.id][field] = Math.max(0, (stats[recipe.id][field] || 0) - 1);
    btn.classList.remove('active');
  } else {
    set.add(recipe.id);
    stats[recipe.id][field] = (stats[recipe.id][field] || 0) + 1;
    btn.classList.add('active');
  }
  saveSet(setKey, set);
  saveStats(stats);
  const el = document.getElementById(countId);
  if (el) el.textContent = stats[recipe.id][field];
  renderTrending();
}

function toggleSave(recipe, btn) {
  const set   = loadSet('paka.mySaves');
  const stats = loadStats();
  if (!stats[recipe.id]) stats[recipe.id] = { likes: 0, loves: 0, saves: 0 };

  if (set.has(recipe.id)) {
    set.delete(recipe.id);
    stats[recipe.id].saves = Math.max(0, (stats[recipe.id].saves || 0) - 1);
    btn.classList.remove('active');
    btn.textContent = '🔖 Save';
  } else {
    set.add(recipe.id);
    stats[recipe.id].saves = (stats[recipe.id].saves || 0) + 1;
    btn.classList.add('active');
    btn.textContent = '🔖 Saved!';
  }
  saveSet('paka.mySaves', set);
  saveStats(stats);
  renderSaved();
  renderTrending();
}

function attachLikeListeners(recipe) {
  const likeBtn = document.getElementById('likeBtn');
  const loveBtn = document.getElementById('loveBtn');
  const saveBtn = document.getElementById('saveBtn');
  if (likeBtn) likeBtn.onclick = () => toggleReaction('likes', 'paka.myLikes', 'likeCnt', likeBtn, recipe);
  if (loveBtn) loveBtn.onclick = () => toggleReaction('loves', 'paka.myLoves', 'loveCnt', loveBtn, recipe);
  if (saveBtn) saveBtn.onclick = () => toggleSave(recipe, saveBtn);
}

/* ── Render flyer into DOM ──────────────────────────────────────── */
const flyerCard = document.getElementById('flyerCard');

function renderFlyer(idx, animate) {
  const recipe = recipes[idx];

  if (animate) {
    flyerCard.style.opacity = '0';
    flyerCard.style.transform = 'translateY(10px)';
  }

  const doRender = () => {
    flyerCard.innerHTML = buildFlyer(recipe);
    attachCalcListeners(recipe);
    sizeTitleBlob();

    if (animate) {
      requestAnimationFrame(() => {
        flyerCard.style.opacity = '1';
        flyerCard.style.transform = 'translateY(0)';
      });
    }

    document.getElementById('recipeCounter').textContent =
      (idx + 1) + ' / ' + recipes.length;
    document.getElementById('prevBtn').disabled = idx === 0;
    document.getElementById('nextBtn').disabled = idx === recipes.length - 1;
  };

  if (animate) {
    setTimeout(doRender, 220);
  } else {
    doRender();
  }
}

function sizeTitleBlob() {
  const title = flyerCard.querySelector('.recipe-title');
  const blob  = flyerCard.querySelector('.title-blob');
  if (title && blob) {
    blob.style.width = Math.max(140, title.scrollWidth * 0.88) + 'px';
  }
}

/* ── Navigation ─────────────────────────────────────────────────── */
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIdx > 0) { currentIdx--; renderFlyer(currentIdx, true); resetAuto(); }
});
document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIdx < recipes.length - 1) { currentIdx++; renderFlyer(currentIdx, true); resetAuto(); }
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft'  && currentIdx > 0)                  { currentIdx--; renderFlyer(currentIdx, true); resetAuto(); }
  if (e.key === 'ArrowRight' && currentIdx < recipes.length - 1) { currentIdx++; renderFlyer(currentIdx, true); resetAuto(); }
});

/* touch swipe */
let swipeX = 0;
flyerCard.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
flyerCard.addEventListener('touchend',   e => {
  const dx = swipeX - e.changedTouches[0].clientX;
  if (Math.abs(dx) < 50) return;
  if (dx > 0 && currentIdx < recipes.length - 1) { currentIdx++; renderFlyer(currentIdx, true); resetAuto(); }
  if (dx < 0 && currentIdx > 0)                  { currentIdx--; renderFlyer(currentIdx, true); resetAuto(); }
});

/* ── AI Assistant ───────────────────────────────────────────────── */
const PANTRY = new Set(['salt', 'oil', 'water', 'sugar', 'garam-masala']);

function matchRecipes(userText) {
  const tokens = userText.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 2);

  return recipes.map(r => {
    const required = r.ingredients
      .map(i => i.key)
      .filter(k => k && !PANTRY.has(k));

    const have    = required.filter(k => tokens.some(t => k.includes(t) || t.includes(k.replace(/-/g,''))));
    const missing = required.filter(k => !have.includes(k)).map(k => k.replace(/-/g, ' '));

    return { recipe: r, haveCount: have.length, total: required.length, missing,
             coverage: required.length ? have.length / required.length : 0 };
  }).filter(m => m.haveCount > 0).sort((a, b) => b.coverage - a.coverage);
}

function appendBubble(text, role) {
  const chat = document.getElementById('aiChat');
  const div  = document.createElement('div');
  div.className = `ai-bubble ai-bubble--${role}`;
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function handleAiSend() {
  const input = document.getElementById('aiInput');
  const text  = input.value.trim();
  if (!text) return;

  appendBubble(text, 'user');
  input.value = '';

  const matches = matchRecipes(text);

  if (!matches.length) {
    appendBubble("Hmm, I don't see any of our recipes matching what you have. Try listing more ingredients!", 'bot');
    return;
  }

  const top = matches.slice(0, 3);
  let reply = 'Here\'s what you can cook:<br><br>';

  top.forEach(m => {
    const pct = Math.round(m.coverage * 100);
    reply += `<b>${m.recipe.title}</b> (${pct}% match)`;
    if (m.missing.length) {
      reply += `<br><span style="color:#7a8456">Missing: ${m.missing.join(', ')}</span>`;
    } else {
      reply += `<br><span style="color:#2f6e2e">✓ You have everything!</span>`;
    }
    reply += `<br><span class="recipe-suggest-btn" data-id="${m.recipe.id}">👀 Show recipe →</span><br><br>`;
  });

  appendBubble(reply, 'bot');

  document.querySelectorAll('.recipe-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.id;
      const idx = recipes.findIndex(r => r.id === id);
      if (idx >= 0) { currentIdx = idx; renderFlyer(currentIdx, true); resetAuto(); closeDrawer(); }
    });
  });
}

function openDrawer() {
  document.getElementById('aiDrawer').classList.add('open');
  document.getElementById('aiOverlay').classList.add('open');
  document.getElementById('aiInput').focus();
}
function closeDrawer() {
  document.getElementById('aiDrawer').classList.remove('open');
  document.getElementById('aiOverlay').classList.remove('open');
}

document.getElementById('aiBtn').addEventListener('click', openDrawer);
document.getElementById('aiClose').addEventListener('click', closeDrawer);
document.getElementById('aiOverlay').addEventListener('click', closeDrawer);
document.getElementById('aiSend').addEventListener('click', handleAiSend);
document.getElementById('aiInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleAiSend();
});

/* ── Recipe search ──────────────────────────────────────────────── */
const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function scoreRecipe(recipe, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const haystack = [
    recipe.title,
    recipe.script,
    recipe.badge,
    recipe.blurb,
    ...(recipe.tags || []),
    ...recipe.ingredients.map(i => i.name + ' ' + (i.key || '')),
  ].join(' ').toLowerCase();
  const words = q.split(/\s+/);
  const matched = words.filter(w => haystack.includes(w)).length;
  return matched / words.length;
}

function renderSearchResults(query) {
  const q = query.trim();
  const scored = recipes
    .map((r, i) => ({ r, i, score: q ? scoreRecipe(r, q) : 1 }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    searchResults.innerHTML = `<div class="search-empty">No recipes found for "${q}"</div>`;
    return;
  }

  searchResults.innerHTML = scored.map(({ r, i }) => {
    const tagPills = (r.tags || []).map(t =>
      `<span class="diet-tag" data-cat="${tagCat(t)}">${t}</span>`
    ).join('');
    return `
      <div class="search-result-item" data-idx="${i}">
        <span class="search-result-emoji">${r.heroEmoji}</span>
        <div class="search-result-info">
          <div class="search-result-name">${r.title}</div>
          <div class="search-result-meta">${r.readyMins} min · ${r.badge}</div>
          ${tagPills ? `<div class="search-result-tags">${tagPills}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  searchResults.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      currentIndex = parseInt(el.dataset.idx, 10);
      renderFlyer(currentIndex, true);
      closeSearch();
    });
  });
}

function openSearch() {
  renderSearchResults(searchInput.value);
  searchResults.classList.add('open');
}

function closeSearch() {
  searchResults.classList.remove('open');
}

searchInput.addEventListener('focus', openSearch);
searchInput.addEventListener('input', () => { renderSearchResults(searchInput.value); searchResults.classList.add('open'); });
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearch(); searchInput.blur(); }
  if (e.key === 'Enter') {
    const first = searchResults.querySelector('.search-result-item');
    if (first) first.click();
  }
});
document.addEventListener('click', e => {
  if (!document.getElementById('headerSearchWrap').contains(e.target)) closeSearch();
});
document.addEventListener('keydown', e => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); searchInput.focus(); }
});

/* ── Typewriter placeholder ─────────────────────────────────────── */
const searchPhrases = [
  'Search something spicy…',
  'Search something quick & easy…',
  'Search a vegan meal…',
  'Search something for Sunday brunch…',
  'Search a high-protein dish…',
  'Search something diabetic-friendly…',
  'Search a South Indian classic…',
  'Search something under 20 minutes…',
  'Search a dal for tonight…',
  'Search something hearty & filling…',
  'Search a Rasoi Magic recipe…',
  'Search something gluten-free…',
  'Search a dish with paneer…',
  'Search something for the kids…',
  'Search a comfort bowl…',
  'Try something different today',
];

let phraseIdx  = 0;
let charIdx    = 0;
let twTimer    = null;
const TYPE_MS  = 62;
const PAUSE_MS = 1900;

function typeStep() {
  if (document.activeElement === searchInput || searchInput.value) return;
  const phrase = searchPhrases[phraseIdx];
  searchInput.placeholder = phrase.slice(0, charIdx);
  if (charIdx < phrase.length) {
    charIdx++;
    twTimer = setTimeout(typeStep, TYPE_MS);
  } else {
    twTimer = setTimeout(() => {
      phraseIdx = (phraseIdx + 1) % searchPhrases.length;
      charIdx   = 0;
      typeStep();
    }, PAUSE_MS);
  }
}

searchInput.addEventListener('focus', () => clearTimeout(twTimer));
searchInput.addEventListener('blur',  () => {
  if (!searchInput.value) { charIdx = 0; typeStep(); }
});

typeStep();

/* ── Trending & Saved panels ────────────────────────────────────── */
function renderTrending() {
  const list = document.getElementById('trendingList');
  if (!list) return;
  const stats = loadStats();
  const scored = recipes
    .map(r => ({ r, score: ((stats[r.id] || {}).likes || 0) + ((stats[r.id] || {}).loves || 0) * 2 + ((stats[r.id] || {}).saves || 0) * 3 }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  if (!scored.length) {
    list.innerHTML = '<li class="tile-empty">Like or save a recipe to see it here!</li>';
    return;
  }
  list.innerHTML = scored.map(({ r, score }) => {
    const idx = recipes.indexOf(r);
    return `<li class="tile-item" data-idx="${idx}">
      <span class="tile-emoji">${r.heroEmoji}</span>
      <span class="tile-name">${r.title}</span>
      <span class="tile-score">${score}</span>
    </li>`;
  }).join('');
  list.querySelectorAll('.tile-item').forEach(li => {
    li.addEventListener('click', () => { currentIdx = +li.dataset.idx; renderFlyer(currentIdx, true); resetAuto(); });
  });
}

function renderSaved() {
  const list = document.getElementById('savedList');
  if (!list) return;
  const mySaves = loadSet('paka.mySaves');
  const saved = recipes.filter(r => mySaves.has(r.id));

  if (!saved.length) {
    list.innerHTML = '<li class="tile-empty">Tap 🔖 on a recipe to save it here!</li>';
    return;
  }
  list.innerHTML = saved.map(r => {
    const idx = recipes.indexOf(r);
    return `<li class="tile-item" data-idx="${idx}">
      <span class="tile-emoji">${r.heroEmoji}</span>
      <span class="tile-name">${r.title}</span>
    </li>`;
  }).join('');
  list.querySelectorAll('.tile-item').forEach(li => {
    li.addEventListener('click', () => { currentIdx = +li.dataset.idx; renderFlyer(currentIdx, true); resetAuto(); });
  });
}

/* ── Next-arrow nudge — hint there's more, never auto-advance ────── */
let nudgeTimer = null;

function startAuto() {
  clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(function nudge() {
    const next = document.getElementById('nextBtn');
    if (next && !next.disabled) {
      next.classList.remove('nudge');
      void next.offsetWidth;        // reflow so the animation restarts
      next.classList.add('nudge');
    }
    nudgeTimer = setTimeout(nudge, 6000);
  }, 6000);
}

function resetAuto() {
  const next = document.getElementById('nextBtn');
  if (next) next.classList.remove('nudge');
  startAuto();
}

/* ── Init ───────────────────────────────────────────────────────── */
renderFlyer(0, false);
renderTrending();
renderSaved();
startAuto();
