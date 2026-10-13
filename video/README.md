# 引用ポスト用テキスト動画

`script.json` にシーンを並べると、アニメーション付きの mp4（横 1920×1080）を書き出します。

```
node video/render.mjs video/posts/<名前>/script.json --out video/posts/<名前>/video.mp4
# 各シーンの静止画も欲しいとき: --thumbs <フォルダ>   静止画だけ: --only-thumbs
```

- 構図は20種類あります。一覧と使いどころは `video/patterns/catalog.html`、見本動画は `video/patterns/showcase.mp4`、全種類の書き方は `video/patterns/showcase.json` を見てください。
- 文字の書式: `[[強調]]` はオレンジ、`{{強調}}` は青、`==マーカー==` は蛍光ペン、`\n` は改行です。
- フォントは見出しが Dela Gothic One、本文と中見出しが Noto Sans JP（どちらも SIL OFL、`video/fonts/`）。`orchard` 配色だけ見出しが明朝（Shippori Mincho B1、SIL OFL）になります。
- 冒頭用に `burst`（巨大文字が突っ込む＋閃光＋揺れ＋放射線）、`stomp`（1文字ずつ叩きつける）、`shutter`（左右の扉が開く）、`ripple`（波紋から弾ける）、`orbit`（単色の画面に輪で囲んだ巨大数字）、`repeat`（同じ単語を何段も重ねて流す）、`tiles`（アプリのタイルが並ぶ）、`dialog`（設定画面に入力→スイッチ→カーソルで保存の操作再現）、`shock`（黄色地に赤い太文字の叩き込み）、`gitgraph`（Gitの線：本流→ブランチ→合流→打ち消し）、`buttons`（緑のボタンが順に押される）、`poster`（映画のキービジュアル風。`"bg": "cover.jpg"` で背景にサムネ）があります。`quiz`（問い→選択肢→正解が光る）、`scorecard`（大きな数字＋数字タイルの採点表）もあります。
- 図形を動かすモーショングラフィック用に、`stickers`（白い箱のテロップを貼る）、`pipeline`（ファイルが関門を順に通って光る）、`gate`（弾かれて別の道へ回る）、`particles`（粒が集まる冒頭）、`stack`（ブロックが落ちて積み上がる）、`term`（ターミナル実行の再現。行ごとに `cmd / ok / bad / dim`）、`sort`（カードが箱へ仕分けられる）があります。アイコン（鍵・書類・リスト・ファイル）は `lib/scenes.js` の `ICON`。
- 切り替えは `"transition"` に `whip / zoom / flash / slide / spin / cine / fade` を1つ、または配列で場面ごとに書きます（シーンに `"tr"` を書くとそのシーンだけ変更）。
- 構成を毎回変えるための参考サイト・参考リポジトリ・構成の型は `references.md`。`node video/inspire.mjs <フォルダ>` で、8つの参考サイトから最近使っていないものを開いて画像に保存します。
- デザインの様式: `"style"` に `brutal`（太い黒線・硬い影・黄×青）/ `swiss`（白・黒・赤1色・罫線のグリッド）/ `glass`（にじむ色の玉・すりガラス）/ `crt`（緑の端末・走査線・等幅）/ `editorial`（明朝・細い罫線・深い赤）/ `pixel`（空色・角ばった太線・段々の影・金色）/ `fluent`（Microsoft の Fluent デザイン風。明るい地・淡い光・すりガラス・小さめの角丸・細身の書体・減速して止まる動き）。書体・線・角・影・背景と専用の色をまとめて切り替えます。見比べは `patterns/styles-compare.jpg`。
- 配色: `"theme"` に `ember / neon / forest / ocean / crimson / violet / navy / orchard / paper / pop / mint / sky` のどれかを書きます。省略すると台本の中身から自動で選ぶので、動画ごとに色が変わります（`"random"` は毎回ランダム、`"themeOverrides": {"accent": "#..."}` で個別に上書き）。`lib/themes.js` に追加できます。
- `"mark": "sparkle"` でロゴ印とCTAのアイコンがキラッとした星になります。burst の `"sparkles": [[x%, y%, 大きさ], ...]` で冒頭に星を散らせます（`"shape": "leaf"` で葉っぱ）。cta の `"image": "cover.jpg"`（script.json からの相対パス）で記事のサムネを添えられます。
- BGM: `python3 video/bgm.py <秒数> <出力.wav> [--bpm 136] [--mood bright]` で合成BGMを作り、ffmpeg で mp4 に重ねます（`posts/projects-coordinator/` 参照）。
- 縦（`"width": 1080, "height": 1920`）にも書き出せますが、レイアウトは横向き用に調整しています。縦で使うときは静止画で確認してください。

## 数字で決める・拍で切る・コマで確かめる
- 一度に書き出す: `node video/make.mjs <script.json> [--out 出力.mp4]`（`"bpm"` と `"mood"` から BGM を作り、映像に重ねる）
- 拍で切る: `"bpm": 120` を書き、場面の長さを `"beats": 6` のように拍で書くと、切り替えが BGM の拍に乗る。
- 数字で決めたテロップ: `telop`（1文字2コマずらし・3〜4コマ目124%の行き過ぎ・9コマ目で停止・帯は左から伸びる・寄り104.7%→108.1%。`stagger` `pushAt` `outAt` はコマ番号）。
- コマで確かめる: `node video/frames.mjs <script.json> --scene 1 --frames 0,1,3,4,7,9 --out sheet.png`（見本 `patterns/telop-frames.png`）
- 参考動画を測る: `python3 -I video/analyze_ref.py <URL か ファイル> <出力フォルダ> [--to 秒] [--color R,G,B --tol 60] [--area 左,上,幅,高さ]`（1秒30コマに分け、一覧・コマごとの画素の測定・切り替わり・文字起こしを出す。URL は yt-dlp、文字起こしは whisper が要る）

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
