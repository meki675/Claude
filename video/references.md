# 構成の参考帳（演出アイデアのサイト・GitHub）と構成の型

## まず演出アイデアのサイトを1つ見る（毎回ちがうサイト）
`node video/inspire.mjs /tmp/inspire` を実行すると、下の8サイトのうち**最近使っていないサイト**を開き、
今のページを2画面分の画像（と見えている作品名）で保存する。開けないサイトは飛ばして次へ進む。
画像を見て、借りる演出を**1つだけ**決め、`script.json` の `"inspiration"` に残す：
`{"site": "<サイト名>", "work": "<見た作品>", "idea": "<借りた見せ方>"}`

| サイト名（inspire.mjs） | サイト | 見るところ | 向く動画 |
|---|---|---|---|
| motionographer | Motionographer | 文字の動かし方・場面転換・図形アニメ | AI解説・洗練された紹介 |
| vimeo-staff-picks | Vimeo Staff Picks | オープニング・ストーリー構成・カメラ演出 | 印象に残る冒頭 |
| behance-motion | Behance – Motion Graphics | 動く文字・インフォグラフィック | 文字中心・図解中心 |
| motion-design-awards | Motion Design Awards | 大胆な画面構成・3D・アプリ紹介 | 高級感のあるサービス紹介 |
| tiktok-creative-center | TikTok Creative Center | 冒頭のつかみ・テロップ・引き込む構成 | X・ショートの冒頭 |
| pinterest-motion | Pinterest – Motion Graphics | 色使い・文字配置・世界観 | テロップデザイン |
| capcut-templates | CapCut Templates | SNS向けの完成形・文字演出 | 短いSNS動画 |
| mixkit | Mixkit | トランジション・ロゴアニメ | 切り替え・演出 |

クラウドからは Behance（403）・Mixkit（429）・CapCut は開けないことがある。パソコンの Chrome なら開けるので、
その場合は Claude in Chrome で開いて同じように1つ借りる。
今の部品で表せない見せ方なら、`lib/scenes.js` と `lib/style.css` に新しいシーンとして作り、下の一覧に足す。

### これまでに作った演出（どこから借りたか）
| シーン | 借りたもの |
|---|---|
| `orbit` | Motionographer トップ「20 years」：単色の全面背景・輪で囲む巨大数字・点線の軌道と粒・字間の広い英字 |
| `shutter` | （サムネの2色ロゴから）左右の扉が開く |


動画ごとに **構成の型を1つ** と **参考にするリポジトリを1つ** 選ぶ。直近3本で使った型・参考は避ける
（使ったものは各 `posts/<名前>/script.json` の `"structure"` と `"reference"` に残す）。

## 次に GitHub（動きの作り方を調べるとき）
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

冒頭は `burst` / `stomp` / `shutter` / `ripple` / `orbit` から、切り替えは
`whip` / `zoom` / `flash` / `slide` / `spin`（配列で場面ごとに変えられる）から、直近と違うものを選ぶ。
