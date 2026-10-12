---
name: x-quote-video
description: Xのおすすめ欄からインプ1万以上のAI記事を探し、サムネの雰囲気に合わせた短い動画と引用コメントを作って、Xの下書きに保存する。「引用動画を作って下書きに」「今日の3本」などで使う。
---

# X記事の引用動画を作って下書きに保存する

1回の実行で作るのは**最大3本**。Claude in Chrome（ログイン済みのChrome）が必要。
Chromeの操作に入る前に、Claude in Chrome のスキルを読み込むこと。

## 1. 記事を探す（Chrome）
- `https://x.com/home` を開き、右上のアカウントが **@seiri_gakari** であることを確認する（違えば止めてユーザーに伝える）。
- 「おすすめ」タブをスクロールして、**記事（記事タブ）形式のポスト**で、AI（Claude・ChatGPT・Gemini・生成AI・AIエージェント・業務自動化など）がテーマのものを集める。
- 各候補のポストURLで次を実行し、`views=` が **10000以上** のものだけ残す。
  `python3 -I video/fetch_article.py <ポストURL> video/posts/<短い英語名>/`
- `video/posts/done.txt` に載っているURLは作成済みなので飛ばす。
- 自分の記事（@seiri_gakari 本人）は対象外にする。

## 2. 動画を作る
- `article.md` を全部読み、`cover.jpg` を目で見る。
- **配色**：サムネの背景色・文字色・差し色に近い配色を `video/lib/themes.js` から選ぶ。合うものがなければ新しく足す（明朝のサムネなら `orchard` のように見出しフォントも変える）。
- **台本**：`script.json` に書く。15〜20秒、5〜6場面にする。
  - 1場面目は必ず `burst`（大きな動き）にする。サムネの雰囲気に合えば `sparkles`（星）や `"shape": "leaf"`（葉っぱ）を使う。
  - `"transition": "whip"`、`footer` は `出典：@<著者> のX記事` とする。
  - 最後は `cta` にして、`"image": "cover.jpg"` を付ける。
  - 中身は記事の**具体的に役立つ点・他より優れている点**（手順、数値、比較、そのまま使える指示文など）に絞る。記事にない事実や数字は足さない。
- **確認**：まず静止画を書き出す。
  `node video/render.mjs video/posts/<名前>/script.json --only-thumbs --thumbs /tmp/<名前>`
  画像を見て、文字の切れ・はみ出し・改行の崩れを直す。
- **書き出し**：BGMを作って、映像に重ねる。
  ```
  python3 video/bgm.py <秒数> /tmp/<名前>.wav --bpm 120〜136 --mood bright|dark
  node video/render.mjs video/posts/<名前>/script.json --out /tmp/<名前>-silent.mp4
  ffmpeg -y -i /tmp/<名前>-silent.mp4 -i /tmp/<名前>.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart video/posts/<名前>/<名前>-16x9.mp4
  ```

## 3. 引用コメントを書く
- `video/posts/<名前>/quote-post.md` に3案を書き、案1を使う。
- **抽象的にしない**。「勉強になる」「すごい」などで終わらせず、記事の一番使える点を具体的に書く（何ができる／何分短くなる／どの設定をどう変える／どの指示文を使う、など）。
- 140字以内（全角）。最後は「〇秒でまとめました👇」のように動画へつなげる。
- 書き手は @seiri_gakari。他人の記事なので「記事にまとめています」ではなく「元記事が詳しいです」のように書く。

## 4. 下書きに保存する（Chrome）
- 元記事のポストを開き、リポスト → 「引用」を選ぶ。
- 引用コメント（案1）を入力し、動画ファイルを添付して「準備完了」まで待つ。
- **投稿ボタンは押さない**。作成画面を閉じ、「下書きを保存」を選ぶ。
- 下書き一覧（作成画面の「下書き」）に入ったことを確認する。引用ポストが下書きに残らない場合は、止めてユーザーに伝える（勝手に投稿しない）。

## 5. 記録する
- `video/posts/done.txt` に `日付<TAB>ポストURL<TAB>フォルダ名` を1行追記する。
- 動画・台本・quote-post.md・cover.jpg をコミットしてプッシュする。
- 最後に、作った本数・各記事のタイトル・使った引用コメントを短く報告する。
