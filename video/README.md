# 引用ポスト用テキスト動画

`script.json` にシーンを並べると、アニメーション付きの mp4（横 1920×1080）を書き出します。

```
node video/render.mjs video/posts/<名前>/script.json --out video/posts/<名前>/video.mp4
# 各シーンの静止画も欲しいとき: --thumbs <フォルダ>   静止画だけ: --only-thumbs
```

- 構図は20種類あります。一覧と使いどころは `video/patterns/catalog.html`、見本動画は `video/patterns/showcase.mp4`、全種類の書き方は `video/patterns/showcase.json` を見てください。
- 文字の書式: `[[強調]]` はオレンジ、`{{強調}}` は青、`==マーカー==` は蛍光ペン、`\n` は改行です。
- フォントは見出しが Dela Gothic One、本文と中見出しが Noto Sans JP（どちらも SIL OFL、`video/fonts/`）。`orchard` 配色だけ見出しが明朝（Shippori Mincho B1、SIL OFL）になります。
- 冒頭用に `burst`（巨大文字が突っ込む＋閃光＋揺れ＋放射線）、`stomp`（1文字ずつ叩きつける）、`shutter`（左右の扉が開く）、`ripple`（波紋から弾ける）があります。`quiz`（問い→選択肢→正解が光る）もあります。
- 切り替えは `"transition"` に `whip / zoom / flash / slide / spin / fade` を1つ、または配列で場面ごとに書きます（シーンに `"tr"` を書くとそのシーンだけ変更）。
- 構成を毎回変えるための参考リポジトリと構成の型は `references.md`。
- 配色: `"theme"` に `ember / neon / forest / ocean / crimson / violet / navy / orchard / paper / pop / mint / sky` のどれかを書きます。省略すると台本の中身から自動で選ぶので、動画ごとに色が変わります（`"random"` は毎回ランダム、`"themeOverrides": {"accent": "#..."}` で個別に上書き）。`lib/themes.js` に追加できます。
- `"mark": "sparkle"` でロゴ印とCTAのアイコンがキラッとした星になります。burst の `"sparkles": [[x%, y%, 大きさ], ...]` で冒頭に星を散らせます（`"shape": "leaf"` で葉っぱ）。cta の `"image": "cover.jpg"`（script.json からの相対パス）で記事のサムネを添えられます。
- BGM: `python3 video/bgm.py <秒数> <出力.wav> [--bpm 136] [--mood bright]` で合成BGMを作り、ffmpeg で mp4 に重ねます（`posts/projects-coordinator/` 参照）。
- 縦（`"width": 1080, "height": 1920`）にも書き出せますが、レイアウトは横向き用に調整しています。縦で使うときは静止画で確認してください。

## X記事から作る
- `python3 -I video/fetch_article.py <ポストURL> video/posts/<名前>/` で本文（article.md）・サムネ（cover.jpg）・表示回数を取り込みます。
- 記事探しから下書き保存までの手順は `.claude/skills/x-quote-video/SKILL.md`（Claude in Chrome が必要）。作成済みは `posts/done.txt`。

## 構成
- `lib/engine.html` / `lib/style.css` / `lib/scenes.js`: シーン部品と時間指定の描画
- `render.mjs`: Playwright で1フレームずつ撮って ffmpeg で mp4 にする
- `posts/claude-dashboards/`: 1本目（Claude Dashboards の記事の引用動画。横版・縦版・投稿文案）
- `posts/projects-coordinator/`: 2本目（Claude Code Projects 司令塔管理の記事。17秒の短尺・BGM付き）
- `posts/apple-vinegar/`: 4本目（@kokin661 のりんご酢の記事。サムネに合わせた orchard 配色・17秒）
- `posts/projects-five-rules/`: 3本目（同じ記事を「最初の五つの指定」の切り口で。sky 配色・15秒・明るいBGM）
