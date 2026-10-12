# 参考動画を測る（共有マニュアルの手順1）。URL かファイルを渡すと、1秒30コマに分けて数字の表を作る。
# 使い方: python3 -I video/analyze_ref.py <URL または 動画ファイル> <出力フォルダ> [--from 秒] [--to 秒]
#   出力: frames/（1秒30コマのPNG）, sheet.png（先頭48コマの一覧・左上にコマ番号）, measure.csv（コマごとの測定値）,
#         cuts.txt（画面の切り替わり）, transcript.txt（Whisper があるとき）
#   measure.csv は「白に近い画素（テロップの文字）」を数えて、面積・外接枠・中心・前のコマに対する大きさの比を出す。
#   目で読まず、同じ基準で数字を出すため。色の閾値は --white 220 で変えられる。
#   範囲は --area 左,上,幅,高さ（px）。省略時は上下左右の5%を除く。
#   白以外のテロップ（例：赤い文字、白地の動画）は --color 230,30,30 --tol 60 のように、数える色と許す差を指定する。
#   URL の取り込みには yt-dlp、文字起こしには whisper（openai-whisper）が要る。無ければその部分を飛ばす。
import csv, os, shutil, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

src, out = sys.argv[1], Path(sys.argv[2])
opt = lambda n, d: sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d
t0, t1, white = float(opt('--from', 0)), opt('--to', None), int(opt('--white', 220))
color = [int(v) for v in opt('--color', '').split(',')] if '--color' in sys.argv else None
tol = int(opt('--tol', 60))
# 測る範囲（左,上,幅,高さ のpx）。省略すると上下左右の5%を除く（進み具合バーやロゴの映り込みを避ける）
area_opt = [int(v) for v in opt('--area', '').split(',')] if '--area' in sys.argv else None
out.mkdir(parents=True, exist_ok=True)

video = Path(src)
if src.startswith('http'):
    if not shutil.which('yt-dlp'):
        sys.exit('yt-dlp がありません。pip install yt-dlp で入れるか、動画を自分で保存してファイルを渡してください。')
    subprocess.run(['yt-dlp', '-f', 'mp4/bestvideo+bestaudio', '-o', str(out / 'source.%(ext)s'), src], check=True)
    video = next(out.glob('source.*'))

frames = out / 'frames'
if frames.exists(): shutil.rmtree(frames)
frames.mkdir()
cut = ['-ss', str(t0)] + (['-to', str(t1)] if t1 else [])
subprocess.run(['ffmpeg', '-loglevel', 'error', *cut, '-i', str(video), '-vf', 'fps=30', str(frames / '%05d.png')], check=True)
files = sorted(frames.glob('*.png'))
print(f'{len(files)} コマ（30fps）')

# 一覧（先頭48コマ、左上にコマ番号）
font = next((str(p) for p in [Path(__file__).parent / 'fonts' / 'NotoSansJP-VF.ttf'] if p.exists()), None)
n = min(48, len(files))
if n:
    draw = f":fontfile={font}" if font else ''
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-start_number', '1', '-i', str(frames / '%05d.png'), '-frames:v', '1',
                    '-vf', f"scale=320:-1,drawtext=text='%{{eif\\:n\\:d}}'{draw}:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6:x=6:y=6,tile=8x{(n + 7) // 8}",
                    str(out / 'sheet.png')], check=True)

# コマごとの測定
rows, prev = [], None
for i, f in enumerate(files):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    H, W = a.shape[:2]
    ax, ay, aw, ah = area_opt or (int(W * .05), int(H * .05), int(W * .9), int(H * .9))
    a = a[ay:ay + ah, ax:ax + aw]
    mask = (np.abs(a - np.array(color)).max(axis=2) <= tol) if color else (a.min(axis=2) >= white)
    area = int(mask.sum())
    if area:
        ys, xs = np.nonzero(mask)
        box = (int(xs.min()) + ax, int(ys.min()) + ay, int(xs.max()) + ax, int(ys.max()) + ay)
        h = box[3] - box[1] + 1
        cx, cy = float(xs.mean()) + ax, float(ys.mean()) + ay
    else:
        box, h, cx, cy = (None,) * 4, None, None, None
    scale = round(h / prev * 100, 1) if (h and prev) else ''
    rows.append([i, round(i / 30 + t0, 3), area, *(box if area else ('',) * 4), h or '', round(cx, 1) if cx else '', round(cy, 1) if cy else '', scale])
    prev = h or prev
with open(out / 'measure.csv', 'w', newline='') as fp:
    w = csv.writer(fp)
    w.writerow(['コマ', '秒', '数えた画素の数', '左', '上', '右', '下', '高さpx', '中心x', '中心y', '前のコマ比%'])
    w.writerows(rows)

# 画面の切り替わり
r = subprocess.run(['ffmpeg', '-hide_banner', *cut, '-i', str(video), '-vf', "select='gt(scene,0.3)',showinfo", '-f', 'null', '-'], capture_output=True, text=True)
times = [float(l.split('pts_time:')[1].split()[0]) for l in r.stderr.splitlines() if 'pts_time:' in l]
(out / 'cuts.txt').write_text('\n'.join(f'{t:.3f}秒（{round(t * 30)}コマ目）' for t in times) + '\n')

# 文字起こし
if shutil.which('whisper'):
    subprocess.run(['whisper', str(video), '--language', 'ja', '--output_format', 'txt', '--output_dir', str(out)], check=False)
else:
    print('whisper が無いので文字起こしは飛ばしました（pip install openai-whisper）')
print('wrote', out)
