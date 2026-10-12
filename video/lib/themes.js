// 配色プリセット。script.json の "theme" に名前を書くと、その配色で書き出す。
//   "theme": "neon"            … 指定のプリセット
//   "theme": "auto"（省略時）  … 動画の内容から自動で1つ選ぶ（同じ台本なら毎回同じ、別の台本なら別の色になりやすい）
//   "theme": "random"          … 書き出すたびにランダム
//   "theme": { "accent": "#f00" } または "themeOverrides": {...} … 個別の色を上書き
(() => {
  const dark = { panel: 'rgba(255,255,255,.045)', stroke: 'rgba(255,255,255,.10)', text: '#f5f3ee', muted: '#9aa0ad', good: '#3ddc84', bad: '#ff4d6d' };
  const light = { panel: 'rgba(0,0,0,.04)', stroke: 'rgba(0,0,0,.12)', text: '#1d1b17', muted: '#6d665a', good: '#1f9d55', bad: '#d63a5a' };
  const THEMES = {
    ember:  { ...dark, bg: '#0b0d12', bg2: '#141824', accent: '#ff6b2c', 'accent-hi': '#ffb347', accent2: '#4cc9ff', 'on-accent': '#1b0b03' },
    neon:   { ...dark, bg: '#0a0618', bg2: '#1a0f33', accent: '#ff3ea5', 'accent-hi': '#ff9ad2', accent2: '#3cf2e0', 'on-accent': '#2a0016', muted: '#a49cc0' },
    forest: { ...dark, bg: '#07130f', bg2: '#0f241c', accent: '#c8f560', 'accent-hi': '#f0ffa8', accent2: '#5fd3a1', 'on-accent': '#1a2400', muted: '#8fa89b' },
    ocean:  { ...dark, bg: '#061226', bg2: '#0b2346', accent: '#ffd23f', 'accent-hi': '#fff09a', accent2: '#4cc9ff', 'on-accent': '#2a2000', muted: '#93a5c2' },
    crimson:{ ...dark, bg: '#0d0d0d', bg2: '#1c1414', accent: '#ff2e2e', 'accent-hi': '#ff8a5c', accent2: '#ffd400', 'on-accent': '#fff', muted: '#a99a9a' },
    violet: { ...dark, bg: '#100b1f', bg2: '#21163f', accent: '#b98bff', 'accent-hi': '#e3d1ff', accent2: '#ffb86b', 'on-accent': '#1a0b36', muted: '#a49cc0' },
    paper:  { ...light, bg: '#f6f1e7', bg2: '#ece3d2', accent: '#e8452c', 'accent-hi': '#f59e3b', accent2: '#2b6cb0', 'on-accent': '#fff' },
    pop:    { ...light, bg: '#fff4d6', bg2: '#ffe3a0', accent: '#ff3d6e', 'accent-hi': '#ff9f43', accent2: '#2f6bff', 'on-accent': '#fff' },
    mint:   { ...light, bg: '#eefaf5', bg2: '#d6f1e6', accent: '#0f9d76', 'accent-hi': '#52d1a6', accent2: '#ff6b4a', 'on-accent': '#fff', muted: '#5b7068' },
    navy:   { ...dark, bg: '#0c1440', bg2: '#16226b', accent: '#3fa2ff', 'accent-hi': '#9fd6ff', accent2: '#7ee8ff', 'on-accent': '#06103a', muted: '#9aa6d6' },
    sky:    { ...light, bg: '#f7f9ff', bg2: '#e3ebff', text: '#16205a', muted: '#5d6890', accent: '#1f8fff', 'accent-hi': '#6cc4ff', accent2: '#00a9c9', 'on-accent': '#fff', stroke: 'rgba(22,32,90,.14)', panel: 'rgba(22,32,90,.04)' },
    orchard:{ ...light, bg: '#fbf9f3', bg2: '#efe7d4', text: '#2c4a26', muted: '#7a6a52', accent: '#c8352b', 'accent-hi': '#e8a33c', accent2: '#b5701f', 'on-accent': '#fff',
              leaf: '#6f9a5a', shadow: 'rgba(80,55,20,.14)', stroke: 'rgba(60,45,20,.14)', panel: 'rgba(255,255,255,.55)',
              head: '"Shippori Mincho B1", "Noto Sans JP", serif', head2: '"Shippori Mincho B1", "Noto Sans JP", serif' },
    clay:   { ...light, bg: '#faf9f5', bg2: '#f0ebe1', text: '#1a1918', muted: '#6b6560', accent: '#d97757', 'accent-hi': '#f0a67e', accent2: '#2f6fb0', 'on-accent': '#fff',
              shadow: 'rgba(90,50,30,.14)', stroke: 'rgba(40,30,20,.13)', panel: 'rgba(255,255,255,.6)' },
    mono:   { ...light, bg: '#ffffff', bg2: '#f5f2ef', text: '#181818', muted: '#6f6a66', accent: '#d4785a', 'accent-hi': '#eba387', accent2: '#a0604a', 'on-accent': '#fff',
              shadow: 'rgba(0,0,0,.10)', stroke: 'rgba(0,0,0,.12)', panel: 'rgba(0,0,0,.03)' },
    terra:  { ...dark, bg: '#1d1a19', bg2: '#2b2321', text: '#f6ece4', muted: '#b3a49a', accent: '#e2694c', 'accent-hi': '#f2a07f', accent2: '#f2c4a6', 'on-accent': '#fff' },
  };
  const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pick = (script) => {
    const names = Object.keys(THEMES);
    const t = script.theme ?? 'auto';
    if (typeof t === 'object') return { name: 'custom', vars: { ...THEMES.ember, ...t } };
    let name = t;
    if (t === 'random') name = names[Math.floor(Math.random() * names.length)];
    if (t === 'auto') name = names[hash(JSON.stringify(script.scenes ?? []) + (script.brand ?? '')) % names.length];
    if (!THEMES[name]) throw new Error(`unknown theme: ${t}（使えるのは ${names.join(', ')}, auto, random）`);
    return { name, vars: { ...THEMES[name], ...(script.themeOverrides ?? {}) } };
  };
  window.Themes = { THEMES, pick };
})();
