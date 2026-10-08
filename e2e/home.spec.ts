import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the header and the editor heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'MP3 Tool', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Audio Editor', level: 1 })).toBeVisible();
  });

  test('shows the drag & drop zone on first load', async ({ page }) => {
    await expect(page.getByText('Drag & drop an MP3 file here')).toBeVisible();
    await expect(page.getByText('or click to browse your computer')).toBeVisible();
    await expect(page.locator('#audio-upload')).toBeAttached();
  });

  test('renders the footer with author links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('LouisVolant.com. All rights reserved.');
    await expect(footer.getByRole('link', { name: 'Personal Page' })).toHaveAttribute(
      'href',
      'https://www.louisvolant.com'
    );
    await expect(footer.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'href',
      'https://www.louisvolant.com/portfolio'
    );
  });

  test('toggles dark mode and persists the choice', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /Mode$/ });
    await expect(toggle).toContainText('Dark');

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(toggle).toContainText('Light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    // Reloading keeps the persisted dark theme.
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
