// scripts/generate-og-image.mjs
//
// Renders the Open Graph image (1200x630) from an HTML template using the
// Chromium browser shipped with Playwright, then writes it to
// public/og-image.png. Run with: npm run og:image

import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconPath = join(root, 'public', 'icon_music.png');
const outputPath = join(root, 'public', 'og-image.png');

const iconDataUri = `data:image/png;base64,${readFileSync(iconPath).toString('base64')}`;

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; }
      body {
        font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 64px;
        padding: 0 90px;
        color: #ffffff;
        background:
          radial-gradient(circle at 88% 18%, rgba(96, 165, 250, 0.55), transparent 45%),
          linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
      }
      .icon {
        width: 240px;
        height: 240px;
        border-radius: 56px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
        flex: 0 0 auto;
      }
      .content { flex: 1 1 auto; }
      .eyebrow {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #bfdbfe;
        margin-bottom: 18px;
      }
      h1 {
        font-size: 76px;
        line-height: 1.05;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      p {
        margin-top: 26px;
        font-size: 32px;
        line-height: 1.35;
        color: #dbeafe;
        max-width: 720px;
      }
      .wave { display: flex; align-items: flex-end; gap: 8px; height: 56px; margin-top: 34px; }
      .wave span { width: 8px; border-radius: 4px; background: rgba(255, 255, 255, 0.85); }
    </style>
  </head>
  <body>
    <img class="icon" src="${iconDataUri}" alt="" />
    <div class="content">
      <div class="eyebrow">MP3 Tool</div>
      <h1>MP3 Audio Editor</h1>
      <p>Trim, visualize and enhance your audio right in the browser.</p>
      <div class="wave">
        ${[18, 34, 52, 28, 44, 20, 38, 56, 30, 46, 24, 40]
          .map((h) => `<span style="height:${h}px"></span>`)
          .join('')}
      </div>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });

const buffer = await page.screenshot({ type: 'png' });
writeFileSync(outputPath, buffer);
await browser.close();

console.log(`Wrote ${outputPath} (1200x630)`);
