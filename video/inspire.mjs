// 動画の演出アイデアを参考サイトから拾う。8サイトを順番に回し、今のページを画像で保存する。
// 使い方: node video/inspire.mjs <出力フォルダ> [--site <名前>]
//   サイトを省略すると、posts/*/script.json の "inspiration.site" を見て、最近使っていないサイトから順に試す。
//   出力: <出力フォルダ>/<サイト名>-1.png, -2.png（ページの上から2画面分）と titles.txt（見えている作品名）
// 開けないサイト（ログイン必須・アクセス制限）は飛ばして次へ進む。
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITES = [
  { name: 'motionographer', url: 'https://motionographer.com/', use: '文字の動かし方・場面転換・図形アニメ（AI解説・洗練された紹介）' },
  { name: 'vimeo-staff-picks', url: 'https://vimeo.com/channels/staffpicks', use: '印象に残るオープニング・ストーリー構成・カメラ演出' },
  { name: 'behance-motion', url: 'https://www.behance.net/galleries/motion', use: '動く文字・インフォグラフィック（文字中心・図解中心）' },
  { name: 'motion-design-awards', url: 'https://motiondesignawards.com/', use: '大胆な画面構成・3D・アプリ紹介（高級感）' },
  { name: 'tiktok-creative-center', url: 'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/ja', use: '冒頭のつかみ・テロップ・引き込む構成（X・ショート向け）' },
  { name: 'pinterest-motion', url: 'https://www.pinterest.com/search/pins/?q=motion%20graphics%20typography', use: '色使い・文字配置・世界観・テロップデザイン' },
  { name: 'capcut-templates', url: 'https://www.capcut.com/templates', use: 'SNS向けショート・文字演出の完成形' },
  { name: 'mixkit', url: 'https://mixkit.co/free-after-effects-templates/', use: 'トランジション・ロゴアニメ・演出例' },
];

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const out = path.resolve(args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--site') ?? 'inspiration');
const pick = args.includes('--site') ? args[args.indexOf('--site') + 1] : null;

// 最近使ったサイト（新しい順）
const used = [];
const postsDir = path.join(dir, 'posts');
for (const p of readdirSync(postsDir)) {
  const f = path.join(postsDir, p, 'script.json');
  if (!existsSync(f)) continue;
  const site = JSON.parse(readFileSync(f, 'utf8')).inspiration?.site;
  if (site) used.push({ site, t: statSync(f).mtimeMs });
}
used.sort((a, b) => b.t - a.t);
const rank = (s) => { const i = used.findIndex((u) => u.site === s.name); return i < 0 ? -1 : used.length - i; };
const order = pick ? SITES.filter((s) => s.name === pick) : [...SITES].sort((a, b) => rank(a) - rank(b));
if (!order.length) { console.error('不明なサイト名: ' + pick + '（' + SITES.map((s) => s.name).join(', ') + '）'); process.exit(1); }

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'));
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' });
mkdirSync(out, { recursive: true });
let done = null;
for (const s of order) {
  try {
    const res = await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!res || res.status() >= 400) throw new Error('HTTP ' + (res && res.status()));
    await page.waitForTimeout(4000);
    for (let i = 1; i <= 2; i++) {
      await page.screenshot({ path: path.join(out, `${s.name}-${i}.png`) });
      await page.mouse.wheel(0, 900); await page.waitForTimeout(1500);
    }
    const titles = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,a[title],img[alt]')]
      .map((e) => (e.getAttribute('title') || e.getAttribute('alt') || e.textContent || '').trim().replace(/\s+/g, ' '))
      .filter((t) => t.length > 3 && t.length < 120).slice(0, 60));
    writeFileSync(path.join(out, 'titles.txt'), `${s.name}\n${s.url}\n参考にする点: ${s.use}\n\n${[...new Set(titles)].join('\n')}\n`);
    done = s; break;
  } catch (e) { console.error(`skip ${s.name}: ${e.message}`); }
}
await browser.close();
if (!done) { console.error('どのサイトも開けませんでした'); process.exit(1); }
console.log(`site=${done.name}\nurl=${done.url}\nuse=${done.use}\nout=${out}`);
