import { test, expect } from '@playwright/test';

/**
 * Guards the responsive behaviour of the editor shell (`.editor-shell`).
 * On desktop the shell should nearly fill the viewport so the waveform and
 * drag & drop areas keep very small left/right margins (~90vw at the time of
 * writing, i.e. margins reduced by roughly a factor of three).
 */
test.describe('Adaptive editor width', () => {
  test('fills most of a desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const shell = page.locator('.editor-shell');
    await expect(shell).toBeVisible();

    const box = await shell.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // The shell should be close to 90% of the viewport width.
    expect(box.width).toBeGreaterThan(1440 * 0.85);

    // Left and right margins should each stay under ~8% of the viewport.
    const leftMargin = box.x;
    const rightMargin = 1440 - (box.x + box.width);
    expect(leftMargin).toBeLessThan(1440 * 0.08);
    expect(rightMargin).toBeLessThan(1440 * 0.08);
  });

  test('does not overflow a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/');

    const shell = page.locator('.editor-shell');
    await expect(shell).toBeVisible();

    const box = await shell.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // The shell must stay inside the viewport on small screens.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375 + 1);
  });
});
