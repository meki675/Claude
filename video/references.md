# 構成の参考帳（GitHub）と構成の型

動画ごとに **構成の型を1つ** と **参考にするリポジトリを1つ** 選ぶ。直近3本で使った型・参考は避ける
（使ったものは各 `posts/<名前>/script.json` の `"structure"` と `"reference"` に残す）。

## 参考にするリポジトリ
開いて、README・デモ・テンプレートの「見せ方」を1つ借りる。コードはそのまま持ち込まず、
このエンジン（`lib/scenes.js` / `lib/style.css`）の部品として作り直す。

| リポジトリ | 借りやすいもの | このエンジンでの置き場 |
|---|---|---|
| `remotion-dev/remotion`（公式サイトのショーケース・テンプレート） | リール・字幕アニメ・データ動画の構成、場面の長さ配分 | 構成の型、場面の順番 |
| `remotion-dev/template-tiktok` | 縦型の大きな字幕が1語ずつ出るリズム | `kinetic` / `stomp` の速さ |
| `remotion-dev/template-audiogram` | 音に合わせた波形・テロップ | BGMのビートに合わせた切り替え |
| `motion-canvas/motion-canvas`（公式サイトの例） | 図がつながる・線が伸びる解説アニメ | `timeline` / 新しい図解シーン |
| `redotvideo/revideo` | コードで組む解説動画の場面転換 | 切り替え（`transition`） |
| `greensock/GSAP`（公式デモ・CodePen） | 文字の分解・弾け・回転、スタッガー（ずらし）の動き | `stomp` / `ripple` / 新しい冒頭 |
| `airbnb/lottie-web`（LottieFiles の素材） | アイコン・装飾の小さな動き | 背景の飾り（`sparkles` の仲間） |
| `theatre-js/theatre` | カメラが寄る・引くような奥行きの動き | `zoom` 系の切り替え、`zoom` シーン |
| `animate-css/animate.css` | 入り・出の定番アニメ一覧 | 要素の入り方（`.up` `.pop` などの追加） |

新しい動きを足したら、`lib/scenes.js` にシーンとして登録し、`README.md` と下の一覧に1行足す。

## 構成の型（例）
| 型 | 並び | 向く記事 |
|---|---|---|
| 衝撃ワード | burst → kinetic → checklist → beforeAfter → cta | 「〇〇はいらない」系の主張 |
| 数字で掴む | shutter → counter → quiz → timeline → code → cta | 実測・事例が多い記事 |
| クイズ | ripple → quiz → marker → split → cta | 意外な正解がある記事 |
| ランキング | stomp → ranking → carousel → quote → cta | 〇選・まとめ記事 |
| 会話再現 | burst → chat → code → versus → cta | 頼み方・プロンプトの記事 |
| 誤解→真実 | stomp → versus → marker → checklist → cta | 誤情報を正す記事 |
| 手順 | shutter → timeline → code → grid → cta | 設定・導入の記事 |

冒頭は `burst` / `stomp` / `shutter` / `ripple` から、切り替えは
`whip` / `zoom` / `flash` / `slide` / `spin`（配列で場面ごとに変えられる）から、直近と違うものを選ぶ。
