// script.json からアニメーション付きの mp4 を書き出す。
// 使い方:
//   node video/render.mjs <script.json> [--out 出力.mp4] [--thumbs 静止画フォルダ] [--only-thumbs]
// 出力を省略すると script.json と同じフォルダに video.mp4 を作る。
// --thumbs を付けると、各シーンの見せ場（80%地点）を PNG で保存する。
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const scriptPath = path.resolve(args.find((a, i) => !a.startsWith('--') && !['--out', '--thumbs'].includes(args[i - 1])) ?? '');
if (!scriptPath.endsWith('.json')) {
  console.error('usage: node video/render.mjs <script.json> [--out out.mp4] [--thumbs dir] [--only-thumbs]');
  process.exit(1);
}
const out = path.resolve(opt('--out') ?? path.join(path.dirname(scriptPath), 'video.mp4'));
const thumbs = opt('--thumbs') && path.resolve(opt('--thumbs'));
const onlyThumbs = args.includes('--only-thumbs');

const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g']).toString().trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const dir = path.dirname(fileURLToPath(import.meta.url));
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
// 画像のパスは script.json からの相対パスで書ける
for (const s of script.scenes) for (const k of ['image', 'bg']) if (s[k] && !/^(https?|file|data):/.test(s[k])) s[k] = pathToFileURL(path.resolve(path.dirname(scriptPath), s[k])).href;
const width = script.width ?? 1920, height = script.height ?? 1080;

const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const page = await browser.newPage({ viewport: { width, height } });
page.on('pageerror', (e) => { console.error('page error:', e.message); process.exitCode = 1; });
await page.goto(pathToFileURL(path.join(dir, 'lib', 'engine.html')).href);
const info = await page.evaluate((s) => window.build(s), script);
await page.evaluate(() => document.fonts.ready);
console.log(`scenes: ${script.scenes.length}, total: ${info.total}s, ${width}x${height}@${info.fps}, theme: ${info.theme}`);

if (thumbs) {
  mkdirSync(thumbs, { recursive: true });
  for (let i = 0; i < script.scenes.length; i++) {
    const s = script.scenes[i];
    await page.evaluate((t) => window.seek(t), info.starts[i] + (s.dur ?? 4) * (s.thumbAt ?? 0.8));
    await page.screenshot({ path: path.join(thumbs, `${String(i + 1).padStart(2, '0')}-${s.type}.png`) });
  }
  console.log('thumbs ->', thumbs);
}

if (!onlyThumbs) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
  const frames = Math.round(info.total * info.fps);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.seek(t), f / info.fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % (info.fps * 10) === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  console.log('wrote', out);
}
await browser.close();
