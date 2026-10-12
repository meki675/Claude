# 引用ポスト用テキスト動画

`script.json` にシーンを並べると、アニメーション付きの mp4（横 1920×1080）を書き出します。

```
node video/render.mjs video/posts/<名前>/script.json --out video/posts/<名前>/video.mp4
# 各シーンの静止画も欲しいとき: --thumbs <フォルダ>   静止画だけ: --only-thumbs
```

- 構図は20種類あります。一覧と使いどころは `video/patterns/catalog.html`、見本動画は `video/patterns/showcase.mp4`、全種類の書き方は `video/patterns/showcase.json` を見てください。
- 文字の書式: `[[強調]]` はオレンジ、`{{強調}}` は青、`==マーカー==` は蛍光ペン、`\n` は改行です。
- フォントは見出しが Dela Gothic One、本文と中見出しが Noto Sans JP（どちらも SIL OFL、`video/fonts/`）。
- 冒頭用に `burst`（巨大文字が突っ込む＋閃光＋揺れ＋放射線）があります。script.json に `"transition": "whip"` を書くと、画面切り替えが横に振り抜く動きになります。
- BGM: `python3 video/bgm.py <秒数> <出力.wav>` で合成BGMを作り、ffmpeg で mp4 に重ねます（`posts/projects-coordinator/` 参照）。
- 縦（`"width": 1080, "height": 1920`）にも書き出せますが、レイアウトは横向き用に調整しています。縦で使うときは静止画で確認してください。

## 構成
- `lib/engine.html` / `lib/style.css` / `lib/scenes.js`: シーン部品と時間指定の描画
- `render.mjs`: Playwright で1フレームずつ撮って ffmpeg で mp4 にする
- `posts/claude-dashboards/`: 1本目（Claude Dashboards の記事の引用動画。横版・縦版・投稿文案）
- `posts/projects-coordinator/`: 2本目（Claude Code Projects 司令塔管理の記事。17秒の短尺・BGM付き）
