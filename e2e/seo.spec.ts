import { test, expect, Page } from '@playwright/test';

const SITE_URL = 'https://mp3-tool.louisvolant.com';
const SITE_NAME = 'MP3 Audio Editor';

/** Read the `content` attribute of the first matching meta tag. */
async function metaContent(page: Page, selector: string): Promise<string | null> {
  return page.locator(selector).first().getAttribute('content');
}

test.describe('SEO metadata', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exposes a title, description and language', async ({ page }) => {
    await expect(page).toHaveTitle('Audio Editor - Trim and Enhance Your Audio Files');
    expect(await page.locator('html').getAttribute('lang')).toBe('en');

    const description = await metaContent(page, 'meta[name="description"]');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThanOrEqual(180);
  });

  test('declares a canonical URL', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(new RegExp(`^${SITE_URL}/?$`));
  });

  test('has Open Graph and Twitter Card tags', async ({ page }) => {
    expect(await metaContent(page, 'meta[property="og:title"]')).toContain('Audio Editor');
    expect(await metaContent(page, 'meta[property="og:description"]')).toBeTruthy();
    expect(await metaContent(page, 'meta[property="og:type"]')).toBe('website');
    expect(await metaContent(page, 'meta[property="og:site_name"]')).toBe(SITE_NAME);
    expect(await metaContent(page, 'meta[property="og:image"]')).toContain('/og-image.png');
    expect(await metaContent(page, 'meta[property="og:image:width"]')).toBe('1200');
    expect(await metaContent(page, 'meta[property="og:image:height"]')).toBe('630');

    expect(await metaContent(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(await metaContent(page, 'meta[name="twitter:title"]')).toContain('Audio Editor');
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toContain('/og-image.png');
  });

  test('serves a 1200x630 Open Graph image', async ({ page }) => {
    const response = await page.request.get('/og-image.png');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');

    // A proper OG image is 1200x630; verify the PNG IHDR header dimensions.
    const body = await response.body();
    const width = body.readUInt32BE(16);
    const height = body.readUInt32BE(20);
    expect({ width, height }).toEqual({ width: 1200, height: 630 });
  });

  test('is indexable by search engines', async ({ page }) => {
    const robots = await metaContent(page, 'meta[name="robots"]');
    expect(robots).toContain('index');
    expect(robots).toContain('follow');

    const googlebot = await metaContent(page, 'meta[name="googlebot"]');
    expect(googlebot).toContain('index');
    expect(googlebot).toContain('follow');
  });

  test('has a single top-level heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Audio Editor');
  });

  test('exposes valid JSON-LD structured data', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(raw).toBeTruthy();

    const data = JSON.parse(raw!);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe(SITE_NAME);
    expect(data.url).toBe(SITE_URL);
    expect(data.offers).toMatchObject({ '@type': 'Offer', price: '0' });
  });

  test('links to a web manifest', async ({ page }) => {
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBe('/manifest.webmanifest');

    const response = await page.request.get(href!);
    expect(response.ok()).toBeTruthy();
    const manifest = await response.json();
    expect(manifest.name).toBe(SITE_NAME);
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});

test.describe('Crawler files', () => {
  test('serves robots.txt with the sitemap reference', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain(`${SITE_URL}/sitemap.xml`);
  });

  test('serves a sitemap that lists the site URL', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain(`<loc>${SITE_URL}`);
  });
});
