// slides.html の各スライドを PNG にして、ffmpeg でクロスフェードつなぎの mp4 にする。
// 使い方: node video/render.mjs   (playwright はグローバルのものを使う)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g']).toString().trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const dir = path.dirname(fileURLToPath(import.meta.url));
const framesDir = path.join(dir, 'frames');
const out = path.join(dir, 'claude-dashboards-quote.mp4');
mkdirSync(framesDir, { recursive: true });

// 各スライドの表示秒数（文字量に合わせる）
const durations = [5, 6, 5, 5, 5, 5, 5, 4.5, 5, 5];
const fade = 0.4;

const browser = await chromium.launch(
  existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {}
);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const pageUrl = pathToFileURL(path.join(dir, 'slides.html')).href;
const pngs = [];
for (let i = 1; i <= durations.length; i++) {
  await page.goto(`${pageUrl}?s=${i}`);
  await page.evaluate(() => document.fonts.ready);
  const p = path.join(framesDir, `slide-${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: p });
  pngs.push(p);
}
await browser.close();

// 入力ごとに静止画ループ、xfade を順につなぐ
const args = ['-y'];
pngs.forEach((p, i) => args.push('-loop', '1', '-t', String(durations[i] + fade), '-framerate', '30', '-i', p));
let filter = '';
let prev = '[0:v]';
let offset = 0;
for (let i = 1; i < pngs.length; i++) {
  offset += durations[i - 1];
  const label = i === pngs.length - 1 ? '[vout]' : `[v${i}]`;
  filter += `${prev}[${i}:v]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}${label};`;
  prev = label;
}
args.push(
  '-filter_complex', filter.replace(/;$/, ''),
  '-map', '[vout]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '20',
  '-movflags', '+faststart', out
);
execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
console.log('wrote', out);
