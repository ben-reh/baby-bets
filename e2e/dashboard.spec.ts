import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads with market header and live indicator', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('BABY BETS')).toBeVisible();
    await expect(page.getByText('LIVE')).toBeVisible();
    await expect(page.getByText(/\d+ ENTRIES/)).toBeVisible();
  });

  test('shows QR code and scan prompt', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByAltText('QR code')).toBeVisible();
    await expect(page.getByText(/scan to make your guess/i)).toBeVisible();
  });

  test('shows gender section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('BOY').first()).toBeVisible();
    await expect(page.getByText('GIRL').first()).toBeVisible();
  });

  test('shows weight odds panel', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Weight Odds')).toBeVisible();
    await expect(page.getByText("Ben's birth weight")).toBeVisible();
    await expect(page.getByText("Tess's birth weight")).toBeVisible();
  });

  test('shows birth date histogram', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Birth Date', { exact: true })).toBeVisible();
    await expect(page.getByText(/due date/i)).toBeVisible();
  });

  test('shows length odds panel', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Length Odds')).toBeVisible();
  });

  test('birth date grid shows July and August sections', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Birth Date', { exact: true })).toBeVisible();
    await expect(page.getByText('July')).toBeVisible();
    await expect(page.getByText('August')).toBeVisible();
  });

  test('birth date grid shows day-of-week headers', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Sat').first()).toBeVisible();
    await expect(page.getByText('Sun').first()).toBeVisible();
    await expect(page.getByText('Fri').first()).toBeVisible();
  });

  test('birth date grid shows due date indicator', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Due Date (Aug 8)')).toBeVisible();
  });

  test('birth date grid shows density legend', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('None')).toBeVisible();
    await expect(page.getByText('Popular')).toBeVisible();
  });

  test('birth date grid shows average guess when entries exist', async ({ page }) => {
    await page.goto('/dashboard');
    const avgLabel = page.getByText('Avg guess').nth(2); // third panel (after weight, length)
    await expect(avgLabel).toBeVisible();
  });
});
