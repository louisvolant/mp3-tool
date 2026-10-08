import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SAMPLE_MP3 = join(__dirname, 'fixtures', 'sample.mp3');

/** Upload the sample MP3 through the hidden file input. */
async function uploadSample(page: Page) {
  await page.locator('#audio-upload').setInputFiles({
    name: 'sample.mp3',
    mimeType: 'audio/mpeg',
    buffer: readFileSync(SAMPLE_MP3),
  });
}

test.describe('Audio editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads an MP3 and replaces the drop zone with the editor', async ({ page }) => {
    await uploadSample(page);

    // The drop zone is replaced...
    await expect(page.getByText('Drag & drop an MP3 file here')).toBeHidden();
    // ...the uploaded file name is displayed...
    await expect(page.getByText('sample.mp3', { exact: true })).toBeVisible();
    // ...and the editing controls are rendered.
    await expect(page.getByRole('button', { name: /Play/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear Selection' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview Trim' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Modified MP3' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });

  test('decodes the audio and shows the waveform timing markers', async ({ page }) => {
    await uploadSample(page);

    // showTimingMarkers flips to true once WaveSurfer has decoded the file.
    await expect(page.getByText('Start Trim')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('End Trim')).toBeVisible();
    await expect(page.getByText('Current')).toBeVisible();
    await expect(page.getByText(/Selected Duration:/)).toBeVisible();
  });

  test('accepts an MP3 dropped onto the drop zone', async ({ page }) => {
    const buffer = readFileSync(SAMPLE_MP3);
    const dataTransfer = await page.evaluateHandle(
      ({ data, name }) => {
        const dt = new DataTransfer();
        dt.items.add(new File([new Uint8Array(data)], name, { type: 'audio/mpeg' }));
        return dt;
      },
      { data: Array.from(buffer), name: 'dropped.mp3' }
    );

    await page.getByText('Drag & drop an MP3 file here').dispatchEvent('drop', { dataTransfer });
    await dataTransfer.dispose();

    await expect(page.getByText('dropped.mp3', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Modified MP3' })).toBeVisible();
  });

  test('updates the export settings selects', async ({ page }) => {
    await uploadSample(page);

    const fadeIn = page.locator('xpath=//label[normalize-space()="Fade In"]/following-sibling::select');
    const fadeOut = page.locator('xpath=//label[normalize-space()="Fade Out"]/following-sibling::select');
    const bitrate = page.locator('xpath=//label[normalize-space()="MP3 Bitrate"]/following-sibling::select');

    await fadeIn.selectOption('2');
    await fadeOut.selectOption('3');
    await bitrate.selectOption('320');

    await expect(fadeIn).toHaveValue('2');
    await expect(fadeOut).toHaveValue('3');
    await expect(bitrate).toHaveValue('320');
  });

  test('resets the editor back to the drop zone', async ({ page }) => {
    await uploadSample(page);
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page.getByText('Drag & drop an MP3 file here')).toBeVisible();
    await expect(page.getByText('sample.mp3', { exact: true })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Save Modified MP3' })).toBeHidden();
  });
});
