// 台本1本から、BGM付きの mp4 まで一度に作る。
// 使い方: node video/make.mjs <script.json> [--out 出力.mp4]
//   script.json の "bpm"（既定 128）と "mood"（dark / bright、既定 bright）で BGM を作る。
//   "bpm" があり場面を "beats" で書いているときは、BGM の拍を 0 秒から始めて切り替えと合わせる。
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const scriptPath = path.resolve(args.find((a) => a.endsWith('.json')));
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
const out = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : scriptPath.replace(/\.json$/, '.mp4'));
const bpm = script.bpm ?? 128;
const beatSync = script.bpm && script.scenes.some((s) => s.beats);
const total = script.scenes.reduce((t, s) => t + (s.beats && script.bpm ? s.beats * 60 / script.bpm : (s.dur ?? 4)), 0);
const tmp = mkdtempSync(path.join(tmpdir(), 'make-'));
const run = (cmd, a) => execFileSync(cmd, a, { stdio: 'inherit' });
run('python3', [path.join(dir, 'bgm.py'), String(total), path.join(tmp, 'bgm.wav'), '--bpm', String(bpm), '--mood', script.mood ?? 'bright', ...(beatSync ? ['--start', '0'] : [])]);
run('node', [path.join(dir, 'render.mjs'), scriptPath, '--out', path.join(tmp, 'silent.mp4')]);
run('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(tmp, 'silent.mp4'), '-i', path.join(tmp, 'bgm.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
console.log('wrote', out, `(${total.toFixed(2)}s, ${bpm}BPM${beatSync ? '・拍に合わせた切り替え' : ''})`);
