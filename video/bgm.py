# 動画用のBGMを合成して WAV で書き出す（音源ファイル不要・著作権フリー）。
# 使い方: python3 video/bgm.py <秒数> <出力.wav> [--bpm 128] [--mood dark|bright]
import sys, wave
import numpy as np

sec = float(sys.argv[1]); out = sys.argv[2]
bpm = float(sys.argv[sys.argv.index('--bpm') + 1]) if '--bpm' in sys.argv else 128
sr = 44100; n = int(sec * sr); beat = 60 / bpm
mix = np.zeros((n, 2))
rng = np.random.default_rng(7)

def put(sig, t, pan=0.0, gain=1.0):
    i = int(t * sr); sig = sig[: max(0, n - i)]
    if len(sig) == 0: return
    mix[i:i + len(sig), 0] += sig * gain * (1 - pan) / 2 * 2
    mix[i:i + len(sig), 1] += sig * gain * (1 + pan) / 2 * 2

def env(length, attack=0.003, decay=0.2):
    t = np.arange(int(length * sr)) / sr
    return np.minimum(1, t / attack) * np.exp(-t / decay), t

def kick():
    e, t = env(0.45, 0.001, 0.12)
    return np.sin(2 * np.pi * (45 * t + 110 * (1 - np.exp(-t * 35)) / 35)) * e

def hat(open_=False):
    e, _ = env(0.25 if open_ else 0.06, 0.001, 0.08 if open_ else 0.015)
    s = rng.standard_normal(len(e)); s = np.diff(s, prepend=0)
    return s * e * 0.35

def clap():
    e, _ = env(0.2, 0.001, 0.05)
    return rng.standard_normal(len(e)) * e * 0.5

def saw(freq, length, decay):
    e, t = env(length, 0.005, decay)
    s = sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, 9)) * 0.6
    return s * e

def note(m): return 440 * 2 ** ((m - 69) / 12)

mood = sys.argv[sys.argv.index('--mood') + 1] if '--mood' in sys.argv else 'dark'
if mood == 'bright':  # D - A - Bm - G（明るめ）
    chords = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]
    roots = [38, 33, 35, 31]
else:  # Am - F - C - G
    chords = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
    roots = [33, 29, 36, 31]
bars = int(sec / (beat * 4)) + 1

# 冒頭のヒット（巨大文字が突っ込むタイミングに合わせる）
e, t = env(1.6, 0.001, 0.5)
put(np.sin(2 * np.pi * (40 * t + 160 * (1 - np.exp(-t * 20)) / 20)) * e, 0.33, gain=1.1)
put(rng.standard_normal(len(e)) * e * 0.25, 0.33, gain=0.8)
# 上昇ノイズ（冒頭0.33秒まで）
L = int(0.33 * sr); r = np.linspace(0, 1, L) ** 2
put(rng.standard_normal(L) * r * 0.3, 0.0)

start = 0.33
for b in range(bars):
    bt = start + b * beat * 4
    ch = chords[b % 4]
    for q in range(4):
        tq = bt + q * beat
        put(kick(), tq, gain=0.9)
        put(hat(), tq + beat / 2, pan=0.3)
        put(hat(), tq + beat / 4, pan=-0.3, gain=0.5)
        put(hat(), tq + beat * 3 / 4, pan=-0.3, gain=0.5)
        if q in (1, 3): put(clap(), tq, gain=0.7)
        # ベース（裏拍）
        put(saw(note(roots[b % 4]), beat / 2, 0.12), tq + beat / 2, gain=0.55)
    # コードスタブ（8分のシンコペーション）
    for off in (0, 0.75, 1.5, 2.5, 3.25):
        for i, m in enumerate(ch):
            put(saw(note(m + 12), beat * 0.5, 0.09), bt + off * beat, pan=(i - 1) * 0.5, gain=0.16)
    # アルペジオ
    for k in range(16):
        m = ch[k % 3] + 24 + (12 if k % 8 == 7 else 0)
        put(saw(note(m), beat / 4, 0.05), bt + k * beat / 4, pan=0.4 * np.sin(k), gain=0.07)

# 終わりをフェードアウト
f = int(1.2 * sr); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.6) * 0.85
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
