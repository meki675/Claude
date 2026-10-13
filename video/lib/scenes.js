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

  // 21. 冒頭の爆発（巨大文字が画面に突っ込む + 閃光 + 揺れ + 放射線）
  S.burst = (s) => `
    <div class="a rays spin" style="--d:.2s"></div>
    ${s.ghost ? A('ghost drift', 0, fmt(s.ghost)) : ''}
    <div class="a shk shake" style="--d:.42s">
      ${tagLine(s.tag, 0.6)}
      ${A('h-xl crash', 0.05, fmt(s.title))}
      ${sub(s.sub, 0.85)}
    </div>
    ${(s.sparkles ?? []).map(([x, y, z], i) => A(`spark twinkle${s.shape === 'leaf' ? ' leaf' : ''}`, 0.4 + i * 0.12, '', { style: `left:${x}%;top:${y}%;--z:${z ?? 1};rotate:${(i * 67) % 360}deg` })).join('')}
    <div class="a flash flashout" style="--d:0s"></div>`;

  // 文字を1字ずつの <span> に分ける（[[ ]] と {{ }} の色は保つ）
  const chars = (str, d0, step) => {
    let i = 0;
    return String(str).split('\n').map((line) => line.split(/(\[\[.+?\]\]|\{\{.+?\}\})/).map((seg) => {
      const m = seg.match(/^(\[\[|\{\{)(.+)(\]\]|\}\})$/);
      const cls = m ? (m[1] === '[[' ? ' em' : ' em2') : '';
      return [...(m ? m[2] : seg)].map((c) => A(`ch stompin${cls}`, d0 + (i++) * step, esc(c), { tag: 'span' })).join('');
    }).join('')).join('<br>');
  };

  // 22. 冒頭：1文字ずつ叩きつける
  S.stomp = (s) => `
    ${tagLine(s.tag)}
    <div class="a shk shake" style="--d:${0.1 + [...s.title.replace(/\[\[|\]\]|\{\{|\}\}|\n/g, '')].length * (s.step ?? 0.07)}s">
      <div class="h-xl">${chars(s.title, 0.1, s.step ?? 0.07)}</div>
    </div>
    ${sub(s.sub, 0.4 + [...s.title].length * (s.step ?? 0.07))}`;

  // 23. 冒頭：シャッターが左右に開いて見出しが出る
  S.shutter = (s) => `
    ${A('h-xl pop', 0.35, fmt(s.title), { style: '--len:.5s' })}
    ${sub(s.sub, 0.8)}
    ${tagLine(s.tag, 0.6)}
    <div class="a door l openl" style="--d:.15s"><span>${fmt(s.left ?? '')}</span></div>
    <div class="a door r openr" style="--d:.15s"><span>${fmt(s.right ?? '')}</span></div>`;

  // 24. 冒頭：波紋が広がって中央から見出しが弾ける
  S.ripple = (s) => `
    ${[0, 1, 2].map((i) => A('ring ringout', 0.05 + i * 0.18, '')).join('')}
    ${tagLine(s.tag, 0.5)}
    ${A('h-xl boing', 0.1, fmt(s.title))}
    ${sub(s.sub, 0.7)}`;

  // 25. クイズ（問い → 選択肢 → 正解が光る）
  S.quiz = (s) => {
    const reveal = s.reveal ?? 0.5 + s.options.length * 0.3 + 0.8;
    return `${tagLine(s.tag)}${A('h-md up', 0.05, fmt(s.q))}
      <div class="opts">${s.options.map((o, i) => A(`opt up${i === s.answer ? ' ok' : ' ng'}`, 0.4 + i * 0.3,
        `<b>${'ABCDE'[i]}</b><span>${fmt(o)}</span>`, { style: `--rv:${reveal}s` })).join('')}</div>
      ${sub(s.note, reveal + 0.3)}`;
  };

  // 26. 冒頭：単色の画面に巨大数字。輪が描かれ、その中に小さな言葉（参考: Motionographer 20 years）
  S.orbit = (s) => `
    <div class="orow">
      <div class="oring">
        <svg viewBox="0 0 200 200"><circle class="a draw" style="--d:.35s" cx="100" cy="100" r="88" pathLength="100"/>
          <circle class="a fade dash" style="--d:.9s" cx="100" cy="100" r="98"/></svg>
        ${A('onum boing', 0.1, fmt(s.num))}
        ${[0, 1, 2].map((i) => `<i class="a dot orbitspin" style="--d:${0.9 + i * 0.1}s;--a0:${i * 120}deg"></i>`).join('')}
      </div>
      ${A('oin left', 0.75, fmt(s.inner))}
    </div>
    ${s.tagline ? A('otag fade', 1.0, fmt(s.tagline)) : ''}
    ${sub(s.sub, 1.2)}`;

  // 27. 冒頭：映画のキービジュアル風（参考: Vimeo Staff Picks「DEAR [NAME]」）
  //   上下の黒帯・ゆっくり寄るカメラ・角かっこの題名・丸いバッジ・下のクレジット
  S.poster = (s) => `
    ${s.bg ? `<div class="a pbg kenburns" style="--d:0s;--len:${s.dur}s;background-image:url('${esc(s.bg)}')"></div>` : ''}
    <div class="a pvig fade" style="--d:0s"></div>
    ${s.badge ? A('pbadge pop', 0.9, fmt(s.badge)) : ''}
    ${A('ptitle wipe', 0.35, fmt(s.title), { style: '--len:.7s' })}
    ${s.sub ? A('psub up', 0.9, fmt(s.sub)) : ''}
    ${s.credits ? A('pcred fade', 1.3, fmt(s.credits)) : ''}
    <div class="a lbox top barin" style="--d:0s"></div><div class="a lbox bot barin" style="--d:0s"></div>`;

  // 28. 採点表（参考: Motion Design Awards「VIDEO OF THE DAY」）
  //   斜めストライプの帯・大きな総合の数字・小さな数字タイルが横に並ぶ
  S.scorecard = (s) => `
    <div class="a stripes slidex" style="--d:0s"></div>
    <div class="sc-row">
      <div class="sc-main">${tagLine(s.tag)}${A('sc-big boing', 0.15, fmt(s.big))}${A('sc-cap up', 0.45, fmt(s.caption))}</div>
      <div class="sc-tiles">${s.tiles.map((t, i) => A('sc-t pop', 0.6 + i * 0.22,
        `<div class="v">${fmt(t.v)}</div><div class="l">${fmt(t.l)}</div>`)).join('')}</div>
    </div>`;

  // 小さなアイコン（SVG）
  const ICON = {
    lock: '<svg viewBox="0 0 100 100"><path d="M32 46V34a18 18 0 0 1 36 0v12" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><rect x="22" y="44" width="56" height="44" rx="9" fill="currentColor"/><circle cx="50" cy="63" r="6" fill="var(--bg)"/><rect x="47" y="64" width="6" height="12" rx="3" fill="var(--bg)"/></svg>',
    doc: '<svg viewBox="0 0 100 100"><path d="M26 10h34l18 18v62H26z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M60 10v18h18" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M37 58l10 10 18-22" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    list: '<svg viewBox="0 0 100 100"><circle cx="20" cy="26" r="7" fill="currentColor" opacity=".45"/><circle cx="20" cy="50" r="7" fill="currentColor" opacity=".45"/><circle cx="20" cy="74" r="7" fill="var(--accent2)"/><rect x="34" y="22" width="44" height="8" rx="4" fill="currentColor" opacity=".45"/><rect x="34" y="46" width="44" height="8" rx="4" fill="currentColor" opacity=".45"/><rect x="34" y="70" width="30" height="8" rx="4" fill="currentColor" opacity=".45"/><circle cx="78" cy="74" r="16" fill="var(--accent2)"/><path d="M70 74l6 6 10-12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spark: '<svg viewBox="0 0 100 100">' + [0, 45, 90, 135, 22, 67, 112, 157].map((a, i) => `<rect x="${i < 4 ? 45 : 46.5}" y="12" width="${i < 4 ? 10 : 7}" height="76" rx="5" fill="#fff" transform="rotate(${a} 50 50)"/>`).join('') + '</svg>',
    file: '<svg viewBox="0 0 80 100"><path d="M6 4h46l22 22v70H6z" fill="var(--bg)" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M52 4v22h22" fill="none" stroke="currentColor" stroke-width="6"/><rect x="18" y="44" width="40" height="6" rx="3" fill="currentColor" opacity=".5"/><rect x="18" y="58" width="44" height="6" rx="3" fill="currentColor" opacity=".5"/><rect x="18" y="72" width="30" height="6" rx="3" fill="currentColor" opacity=".5"/></svg>',
  };

  // 29. テロップの貼り付け（参考: TikTok Creative Center のトップ広告の白い箱テロップ）
  S.stickers = (s) => `
    ${tagLine(s.tag)}
    <div class="stk">${s.lines.map((l, i) => A(`st${i % 2 ? ' tl' : ' tr'} slap`, 0.15 + i * (s.step ?? 0.55), fmt(l))).join('')}</div>
    ${sub(s.sub, 0.4 + s.lines.length * (s.step ?? 0.55))}`;

  // 30. 検査のレール：ファイルが3つの関門を通り、順に光る（記事サムネのタイルと鎖をそのまま動かす）
  S.pipeline = (s) => {
    const L = s.travel ?? 3.6, d0 = 0.6, hit = [0.18, 0.5, 0.82];
    return `${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="pipe">
      ${A('chain growx', 0.3, '')}
      ${A('ctile pop', 0.1, ICON.spark)}
      ${s.stations.map((st, i) => `
        <div class="stn" style="left:${520 + i * 400}px">
          ${A('tile pop', 0.2 + i * 0.12, ICON[st.icon])}
          ${A('glow flashon', d0 + hit[i] * L, '')}
          ${A('lbl up', d0 + hit[i] * L + 0.1, `<b>${fmt(st.label)}</b><span>${fmt(st.event)}</span>`)}
        </div>`).join('')}
      ${A('mover travel', d0, ICON.file, { style: `--len:${L}s` })}
    </div>`;
  };

  // 31. 関門：原本への書き込みを止め、修正版の置き場へ回す
  S.gate = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="gatebox">
      ${A('lane l1 growx', 0.2, '')}${A('lane l2 growx', 1.6, '')}
      ${A('dest d1 pop', 0.3, `<i>${ICON.lock}</i><span>${fmt(s.blocked)}</span>`)}
      ${A('dest d2 pop', 1.7, `<i>${ICON.doc}</i><span>${fmt(s.allowed)}</span>`)}
      ${A('gmark ng pop', 1.25, '✕')}${A('gmark ok pop', 2.75, '✓')}
      ${A('mover reroute', 0.5, ICON.file, { style: '--len:2.4s' })}
    </div>
    ${sub(s.note, 2.9)}`;

  // 32. 冒頭：画面中の粒が中央に集まって輪になり、見出しが弾ける
  S.particles = (s) => {
    const n = s.count ?? 48;
    const dots = Array.from({ length: n }, (_, i) => {
      const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12543.123;
      const x = ((r1 - Math.floor(r1)) - 0.5) * 2000, y = ((r2 - Math.floor(r2)) - 0.5) * 1200;
      const a = (i / n) * Math.PI * 2, R = 380;
      return `<i class="a pdot gather" style="--d:${(i % 8) * 0.03}s;--x0:${x.toFixed(0)}px;--y0:${y.toFixed(0)}px;--x1:${(Math.cos(a) * R).toFixed(0)}px;--y1:${(Math.sin(a) * R * 0.62).toFixed(0)}px"></i>`;
    }).join('');
    return `<div class="pfield">${dots}</div>
      ${tagLine(s.tag, 1.1)}${A('h-xl boing', 1.0, fmt(s.title))}${sub(s.sub, 1.4)}`;
  };

  // 33. 積み上げ：ブロックが上から落ちて積み上がる（下から順に）
  S.stack = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="stk2">${s.blocks.map((b, i) => A(`blk drop${b.hot ? ' hot' : ''}`, 0.3 + i * 0.45,
      `<b>${fmt(b.name)}</b><span>${fmt(b.text)}</span>`)).join('')}</div>
    ${sub(s.note, 0.6 + s.blocks.length * 0.45)}`;

  // 34. ターミナル実行：行が順に出て、止められた行は赤、通った行は緑
  S.term = (s) => `
    ${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    ${A('tw up', 0.15, `<div class="tbar"><i></i><i></i><i></i><span>${esc(s.file ?? 'claude')}</span></div>
      <div class="tbody">${s.lines.map((l, i) => A(`tl ${l.c ?? ''} type`, 0.5 + i * (s.step ?? 0.55), fmt(l.t), { style: '--len:.45s' })).join('')}
      ${A('cur blink', 0.5 + s.lines.length * (s.step ?? 0.55), '')}</div>`)}
    ${sub(s.note, 0.8 + s.lines.length * (s.step ?? 0.55))}`;

  // 35. 仕分け：カードが流れてきて、それぞれの箱へ振り分けられる
  S.sort = (s) => {
    const nb = s.bins.length, w = 1680 / nb;
    return `${tagLine(s.tag)}${s.title ? A('h-md up', 0.05, fmt(s.title)) : ''}
    <div class="sortbox">
      ${s.bins.map((b, i) => A(`bin up ${b.c ?? ''}`, 0.2 + i * 0.08, `<b>${fmt(b.name)}</b><span>${fmt(b.hint ?? '')}</span>`, { style: `left:${i * w + 10}px;width:${w - 20}px` })).join('')}
      ${s.cards.map((c, i) => A(`card2 fly ${s.bins[c.bin].c ?? ''}`, 0.6 + i * (s.step ?? 0.4), fmt(c.t),
        { style: `--tx:${(c.bin * w + w / 2 - 840).toFixed(0)}px;--ty:${444 + (s.cards.slice(0, i).filter((x) => x.bin === c.bin).length) * -62}px;--len:.8s` })).join('')}
    </div>`;
  };

  // 36. 数字で決めたテロップ（共有マニュアルの見本の値をそのまま使う。30fps のコマ番号で指定）
  //   1文字ずつ stagger コマずらし。各文字：74% → 3〜4コマ目124%（行き過ぎ）→ 7コマ目94% → 9コマ目100%、
  //   上下：54px下 → 4コマ目30px上 → 9コマ目で元の位置。帯：左から 58% → 4コマ目98% → 8コマ目100%。
  //   全体：pushAt コマ目から寄り始め、+1コマで104.7%、+4コマで108.1%。outAt コマ目から上へ抜け、+3コマで消える。
  S.telop = (s) => {
    const F = (n) => (n / 30).toFixed(4), st = s.stagger ?? 2, f0 = s.firstFrame ?? 1;
    let i = 0;
    const starts = [];
    const line = (str) => (starts.push(i), 0) ||  String(str).split(/(\[\[.+?\]\])/).map((seg) => {
      const m = seg.match(/^\[\[(.+)\]\]$/);
      return [...(m ? m[1] : seg)].map((c) => `<span class="a tch tpop${m ? ' em' : ''}" style="--d:${F(f0 - 1 + st * i++)}s;--len:${F(9)}s">${esc(c)}</span>`).join('');
    }).join('');
    const push = s.pushAt ?? 26, out = s.outAt ?? 79;
    return `<div class="a tpush tzoom" style="--d:${F(push)}s;--len:${F(4)}s">
      <div class="a tout tleave" style="--d:${F(out)}s;--len:${F(3)}s">
        ${s.kicker ? `<div class="a tkick fade" style="--d:${F(0)}s;--len:${F(6)}s">${fmt(s.kicker)}</div>` : ''}
        ${s.lines.map((l) => { const t = line(l); return `<div class="tline"><i class="a tband tgrow" style="--d:${F(f0 - 1 + st * starts[starts.length - 1])}s;--len:${F(8)}s"></i><span class="ttext">${t}</span></div>`; }).join('')}
      </div></div>`;
  };

  // 37. 冒頭：同じ単語を画面いっぱいに何段も重ね、段ごとに左右へ流す。1段だけ色を変えて言いたいことを入れる
  //   （参考: Pinterest「motion graphics typography」で見えた「MOTION」を積み重ねた作品）
  S.repeat = (s) => {
    const rows = s.rows ?? 7, hi = s.hi ?? Math.floor(rows / 2);
    return `<div class="rp">${Array.from({ length: rows }, (_, r) => {
      const txt = r === hi ? fmt(s.hiText ?? s.word) : esc(s.word);
      return `<div class="a rrow ${r % 2 ? 'rl' : 'rr'}${r === hi ? ' hi' : ''}" style="--d:${(r * 0.06).toFixed(2)}s;--len:${s.dur}s">${Array(6).fill(`<span>${txt}</span>`).join('')}</div>`;
    }).join('')}</div>
    ${s.sub ? A('rsub pop', 0.9, fmt(s.sub)) : ''}`;
  };

  // 20. CTA（締め）
  S.cta = (s) => `
    ${tagLine(s.tag)}
    ${A('title slam', 0.1, fmt(s.title))}
    ${s.image ? A('cimg pop', 0.35, `<img src="${esc(s.image)}">`, { style: '--len:.7s' }) : ''}
    ${s.go ? A('go up', 0.6, `<span class="a arr pulse" style="--d:1s">→</span><span>${fmt(s.go)}</span>`) : ''}
    ${s.name ? A('who up', 0.9, `<div class="av">${esc(s.avatar ?? s.name[0])}</div><div><div class="nm">${fmt(s.name)}</div><div class="id">${esc(s.id ?? '')}</div></div>`) : ''}`;

  // シーン種類 → ルート要素に付けるクラス
  const ROOT = { impact: 'impact', kinetic: 'kinetic', split: 'split', versus: 'versus', counter: 'counter', table: 'tablesc', ranking: 'ranking',
    beforeAfter: 'ba', checklist: 'check', chat: 'chat', code: 'code', quote: 'quote', timeline: 'timeline', marker: 'marker center',
    zoom: 'zoom', carousel: 'carousel', lowerThird: 'lt', grid: 'gridsum', bars: 'bars', cta: 'cta', burst: 'burst center', stomp: 'burst center', shutter: 'shutter center', ripple: 'ripple center', quiz: 'quiz', orbit: 'orbit center', poster: 'poster center', scorecard: 'scorecard', stickers: 'stickers center', pipeline: 'pipeline', gate: 'gatesc', particles: 'particles center', stack: 'stacksc', term: 'term', sort: 'sortsc', telop: 'telopsc center', repeat: 'repeatsc' };

  window.Scenes = { S, ROOT, fmt, esc };
})();
