# X記事（記事タブ）のポストURLから、本文・サムネ・表示回数を取り込む。
# 使い方: python3 -I video/fetch_article.py <ポストURL> <出力フォルダ>
#   出力: article.md（タイトル・著者・表示回数・本文）, cover.jpg（サムネ）, source.json（元データ）
#   表示回数を標準出力の最後に "views=<数>" と出す（1万以上かの判定に使う）
import json, re, sys, urllib.request
from pathlib import Path

url, out = sys.argv[1], Path(sys.argv[2])
m = re.search(r'(?:x|twitter)\.com/([^/]+)/status/(\d+)', url)
if not m: sys.exit('ポストのURLではありません: ' + url)
out.mkdir(parents=True, exist_ok=True)
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})).read()
api = f'https://api.fxtwitter.com/{m.group(1)}/status/{m.group(2)}'
d = json.loads(get(api))['tweet']
(out / 'source.json').write_text(json.dumps(d, ensure_ascii=False, indent=1))
a = d.get('article')
if not a: sys.exit('このポストは記事（記事タブ）ではありません')
cover = (a.get('cover_media') or {}).get('media_info', {}).get('original_img_url')
if cover: (out / 'cover.jpg').write_bytes(get(cover))
lines = [f"# {a['title'].strip()}", '', f"- 著者: {d['author']['name']} (@{d['author']['screen_name']})",
         f"- ポスト: {d['url']}", f"- 表示回数: {d.get('views')}  いいね: {d.get('likes')}  ブックマーク: {d.get('bookmarks')}", '']
for b in a['content']['blocks']:
    t = b['text'].strip()
    if not t: continue
    lines.append(('\n## ' if 'header' in b['type'] else '') + t)
(out / 'article.md').write_text('\n'.join(lines) + '\n')
print(f"{a['title'].strip()} / @{d['author']['screen_name']}")
print(f"views={d.get('views') or 0}")
