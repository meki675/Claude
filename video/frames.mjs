// 指定したコマ番号を1枚に並べて確かめる（共有マニュアルの「同じコマ番号で並べて見比べる」用）。
// 使い方: node video/frames.mjs <script.json> --scene <番号(1から)> --frames 1,3,4,7,9 [--out sheet.png] [--cols 5]
//   コマ番号はその場面の頭からの番号（30fps）。各コマの左上に番号を入れる。
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const scriptPath = path.resolve(args.find((a) => a.endsWith('.json')));
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
for (const s of script.scenes) for (const k of ['image', 'bg']) if (s[k] && !/^(https?|file|data):/.test(s[k])) s[k] = pathToFileURL(path.resolve(path.dirname(scriptPath), s[k])).href;
const scene = Number(opt('--scene', '1')) - 1, frames = opt('--frames', '0,5,10,15,20').split(',').map(Number);
const out = path.resolve(opt('--out', 'frames.png')), cols = Number(opt('--cols', String(Math.min(frames.length, 5))));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'));
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const page = await browser.newPage({ viewport: { width: script.width ?? 1920, height: script.height ?? 1080 } });
await page.goto(pathToFileURL(path.join(dir, 'lib', 'engine.html')).href);
const info = await page.evaluate((s) => window.build(s), script);
await page.evaluate(() => document.fonts.ready);
const tmp = mkdtempSync(path.join(tmpdir(), 'frames-'));
const inputs = [];
for (const f of frames) {
  await page.evaluate((t) => window.seek(t), info.starts[scene] + f / info.fps);
  const p = path.join(tmp, `${f}.png`);
  await page.screenshot({ path: p });
  inputs.push('-i', p);
}
await browser.close();
const rows = Math.ceil(frames.length / cols);
const label = frames.map((f, i) => `[${i}]scale=640:-1,drawtext=text='${f}コマ目':fontfile=${path.join(dir, 'fonts', 'NotoSansJP-VF.ttf')}:fontsize=30:fontcolor=white:box=1:boxcolor=black@0.7:x=10:y=10[v${i}]`).join(';');
const layout = frames.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|');
const pad = rows * cols - frames.length;
const padIns = Array.from({ length: pad }, (_, k) => `[p${k}]`);
const graph = `${label}${pad ? ';' + Array.from({ length: pad }, (_, k) => `color=black:s=640x360:d=1[p${k}]`).join(';') : ''};${frames.map((_, i) => `[v${i}]`).join('')}${padIns.join('')}xstack=inputs=${rows * cols}:layout=${layout}${pad ? '|' + padIns.map((_, k) => { const i = frames.length + k; return `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`; }).join('|') : ''}`;
const g = frames.length === 1 ? label.replace('[v0]', '') : graph;
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', g, '-frames:v', '1', out], { stdio: 'inherit' });
console.log('wrote', out);
