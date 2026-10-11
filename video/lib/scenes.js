// シーン部品。各関数は シーンの中身（HTML文字列）を返す。
// 文字列の書式: [[強調]] → オレンジ, {{強調}} → 青, ==マーカー== → 蛍光ペン, 改行 → <br>
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (s) => esc(s)
    .replace(/\[\[(.+?)\]\]/g, '<span class="em">$1</span>')
    .replace(/\{\{(.+?)\}\}/g, '<span class="em2">$1</span>')
    .replace(/==(.+?)==/g, '<span class="a mark" style="--d:var(--md,.8s)">$1</span>')
    .replace(/\n/g, '<br>');
  // アニメーション付きの要素
  const A = (cls, d, inner, { tag = 'div', style = '', extra = '' } = {}) =>
    `<${tag} class="a ${cls}" style="--d:${d}s;${style}" ${extra}>${inner}</${tag}>`;
  const tagLine = (t, d = 0) => (t ? A('tag left', d, fmt(t)) : '');
  const sub = (t, d) => (t ? A('sub up', d, fmt(t)) : '');

  const S = {};

  // 1. 大見出しドーン
  S.impact = (s) => `
    ${tagLine(s.tag)}
    ${A('h-xl slam', 0.15, fmt(s.title))}
    ${A('bar growx', 0.55, '')}
    ${sub(s.sub, 0.8)}`;

  // 2. キネティックタイポ（単語ごとに出る）
  S.kinetic = (s) => `
    ${tagLine(s.tag)}
    <div class="words">${s.words.map((w, i) => A('pop', 0.2 + i * (s.step ?? 0.28), fmt(w), { tag: 'span', style: '--len:.45s' })).join('')}</div>
    ${sub(s.sub, 0.4 + s.words.length * (s.step ?? 0.28))}`;

  // 3. 左右分割（主張｜要点）
  S.split = (s) => `
    <div class="l">${tagLine(s.tag)}${A('h-lg left', 0.1, fmt(s.title))}${sub(s.sub, 0.5)}</div>
    <div class="r card">${s.items.map((it, i) => A('item right', 0.5 + i * 0.35, `<b>${i + 1}</b><span>${fmt(it)}</span>`)).join('')}</div>`;

  // 4. 比較 VS
  S.versus = (s) => {
    const side = (o, cls, d, anim) => A(`side ${cls} ${anim}${s.win === cls[0] ? ' win' : ''}`, d,
      `<div class="k">${fmt(o.label)}</div><div class="v">${fmt(o.value)}</div><div class="n">${fmt(o.note)}</div>`);
    return `${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
      <div class="row">${side(s.a, 'a1', 0.3, 'left')}${A('vs pop', 0.75, 'VS')}${side(s.b, 'b1', 0.5, 'right')}</div>
      ${sub(s.note, 1.1)}`;
  };

  // 5. 数字カウントアップ
  S.counter = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="nums">${s.nums.map((n, i) => A('num up', 0.3 + i * 0.3, `
      <div class="label">${fmt(n.label)}</div>
      <div class="big" style="color:${n.color === 'blue' ? 'var(--accent2)' : n.color === 'white' ? 'var(--text)' : 'var(--accent)'}">
        ${n.prefix ? `<span class="unit">${esc(n.prefix)}</span>` : ''}
        <span class="a count" style="--d:${0.4 + i * 0.3}s;--to:${n.to};--from:${n.from ?? 0}"></span>
        <span class="unit">${esc(n.unit ?? '')}</span>
      </div>`)).join('')}</div>
    ${sub(s.note, 1.3)}`;

  // 6. 表の行を順に出す
  S.table = (s) => {
    const cell = (c) => (typeof c === 'object' && c !== null
      ? `<td class="${c.hi ? 'hi' : ''}">${fmt(c.v)}${c.s ? `<span class="s">${fmt(c.s)}</span>` : ''}</td>`
      : `<td>${fmt(c)}</td>`);
    return `${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
      <table class="tbl"><thead>${A('fade', 0.2, s.head.map((h) => `<th>${fmt(h)}</th>`).join(''), { tag: 'tr' })}</thead>
      <tbody>${s.rows.map((r, i) => A('left', 0.5 + i * 0.45, r.map(cell).join(''), { tag: 'tr' })).join('')}</tbody></table>
      ${sub(s.note, 0.7 + s.rows.length * 0.45)}`;
  };

  // 7. ランキング（下位から順に出す）
  S.ranking = (s) => {
    const n = s.items.length;
    return `${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.title))}
      <div class="list">${s.items.map((it, i) => A(`ri right${i === 0 ? ' top' : ''}`, 0.4 + (n - 1 - i) * 0.5,
        `<span class="no">${i + 1}位</span><span>${fmt(it)}</span>`)).join('')}</div>`;
  };

  // 8. Before → After
  S.beforeAfter = (s) => {
    const col = (o, cls, d, def) => A(`col ${cls} up`, d,
      `<div class="lab">${fmt(o.label ?? def)}</div>${o.lines.map((l) => `<div class="body">${fmt(l)}</div>`).join('')}`);
    return `${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.title))}
      <div class="row">${col(s.before, 'bf', 0.3, 'BEFORE')}${A('arrow pop', 0.8, '→')}${col(s.after, 'af', 1.0, 'AFTER')}</div>`;
  };

  // 9. チェックリスト
  S.checklist = (s) => `
    ${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.title))}
    <div class="list">${s.items.map((it, i) => A('ci up', 0.3 + i * 0.25,
      `<div class="box">${A('tick pop', 0.9 + i * 0.35, '✓')}</div><span>${fmt(it)}</span>`)).join('')}</div>`;

  // 10. チャット（質問と回答）
  S.chat = (s) => `
    ${tagLine(s.tag)}
    <div class="thread">${s.msgs.map((m, i) => A(`msg ${m.who === 'me' ? 'me right' : 'ai left'}`, 0.2 + i * (s.step ?? 0.9),
      `${m.name ? `<div class="who">${esc(m.name)}</div>` : ''}${fmt(m.text)}`)).join('')}</div>`;

  // 11. コード・ターミナル画面
  S.code = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    ${A('win2 up', 0.2, `<div class="bar2"><i></i><i></i><i></i><span>${esc(s.file ?? '')}</span></div>
      <pre>${s.lines.map((l, i) => A('ln type', 0.5 + i * 0.5,
        esc(l).replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>').replace(/(--.*|#.*|\/\/.*)$/, '<span class="cm">$1</span>'),
        { tag: 'span', style: `--steps:${Math.max(8, l.length)};--len:.45s` })).join('')}</pre>`)}
    ${sub(s.note, 0.8 + s.lines.length * 0.5)}`;

  // 12. 引用カード
  S.quote = (s) => `
    ${tagLine(s.tag)}
    ${A('qm pop', 0.1, '“')}
    ${A('qt wipe', 0.3, fmt(s.text), { style: '--len:1.1s' })}
    ${s.by ? A('by up', 1.2, '— ' + fmt(s.by)) : ''}`;

  // 13. タイムライン
  S.timeline = (s) => `
    ${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.title))}
    <div class="track">${A('line growx', 0.3, '', { style: '--len:1.2s' })}
      ${s.points.map((p, i) => A('pt up', 0.5 + i * 0.35,
        `<div class="dot">${i + 1}</div><div class="t">${fmt(p.t)}</div><div class="s2">${fmt(p.s)}</div>`)).join('')}</div>`;

  // 14. マーカー強調
  S.marker = (s) => `
    ${tagLine(s.tag)}
    ${A('txt up', 0.1, fmt(s.text), { style: '--md:.9s' })}
    ${sub(s.sub, 1.6)}`;

  // 15. ズームイン（一覧から1つに寄る）
  S.zoom = (s) => {
    const cols = 3, f = s.focus ?? 4;
    const ox = ((f % cols) + 0.5) / cols * 100, oy = (Math.floor(f / cols) + 0.5) / Math.ceil(s.cells.length / cols) * 100;
    return `${tagLine(s.tag)}
      ${A('stage', s.at ?? 1.4, `<div class="grid3">${s.cells.map((c, i) =>
        i === f ? `<div class="cell focus">${fmt(c)}</div>` : A('cell dim', s.at ?? 1.4, fmt(c))).join('')}</div>`,
        { style: `--ox:${ox}%;--oy:${oy}%;--zs:${s.scale ?? 2.1}` })}
      ${sub(s.caption, (s.at ?? 1.4) + 1.2)}`;
  };

  // 16. 横スクロールのカード送り
  S.carousel = (s) => {
    const shift = -(660 * Math.max(0, s.cards.length - 2.5));
    return `${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
      ${A('belt', 0.6, s.cards.map((c, i) => `<div class="cc"><div class="no">${esc(c.no ?? String(i + 1).padStart(2, '0'))}</div>
        <div class="t">${fmt(c.t)}</div><div class="s2">${fmt(c.s)}</div></div>`).join(''),
        { style: `--shift:${shift}px;--len:${Math.max(1.5, s.dur - 1.6)}s` })}`;
  };

  // 17. ローワーサード（下部の名札テロップ）
  S.lowerThird = (s) => `
    ${tagLine(s.tag)}${A('h-lg up', 0.1, fmt(s.title))}${sub(s.body, 0.5)}
    <div class="lower">${A('n1 wipe', 0.8, fmt(s.name))}${A('n2 wipe', 1.0, fmt(s.role))}</div>`;

  // 18. まとめグリッド
  S.grid = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="tiles" style="--cols:${s.cols ?? 3}">${s.tiles.map((t, i) => A('tile pop', 0.3 + i * 0.15,
      `<div class="no">${esc(t.no ?? String(i + 1).padStart(2, '0'))}</div><div class="t">${fmt(t.t)}</div>`)).join('')}</div>`;

  // 19. 棒グラフが伸びる
  S.bars = (s) => {
    const max = s.max ?? Math.max(...s.bars.map((b) => b.value));
    return `${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.title))}
      <div class="chart">${s.bars.map((b, i) => `<div class="br">${A('fade', 0.3 + i * 0.3, fmt(b.label))}
        <div class="track2">${A(`fill growx${b.hot ? ' hot' : ''}`, 0.4 + i * 0.3, '', { style: `width:${(b.value / max) * 100}%` })}</div>
        ${A('val fade', 0.9 + i * 0.3, fmt(b.display ?? b.value))}</div>`).join('')}</div>
      ${sub(s.note, 1.0 + s.bars.length * 0.3)}`;
  };

  // 20. CTA（締め）
  S.cta = (s) => `
    ${tagLine(s.tag)}
    ${A('title slam', 0.1, fmt(s.title))}
    ${s.go ? A('go up', 0.6, `<span class="a arr pulse" style="--d:1s">→</span><span>${fmt(s.go)}</span>`) : ''}
    ${s.name ? A('who up', 0.9, `<div class="av">${esc(s.avatar ?? s.name[0])}</div><div><div class="nm">${fmt(s.name)}</div><div class="id">${esc(s.id ?? '')}</div></div>`) : ''}`;

  // シーン種類 → ルート要素に付けるクラス
  const ROOT = { impact: 'impact', kinetic: 'kinetic', split: 'split', versus: 'versus', counter: 'counter', table: 'tablesc', ranking: 'ranking',
    beforeAfter: 'ba', checklist: 'check', chat: 'chat', code: 'code', quote: 'quote', timeline: 'timeline', marker: 'marker center',
    zoom: 'zoom', carousel: 'carousel', lowerThird: 'lt', grid: 'gridsum', bars: 'bars', cta: 'cta' };

  window.Scenes = { S, ROOT, fmt, esc };
})();
