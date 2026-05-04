import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads with market header and live indicator', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('BABY BETS MARKET')).toBeVisible();
    await expect(page.getByText('LIVE')).toBeVisible();
    await expect(page.getByText(/\d+ ENTRIES/)).toBeVisible();
  });

  test('shows QR code and scan prompt', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByAltText('QR code')).toBeVisible();
    await expect(page.getByText(/scan to make your guess/i)).toBeVisible();
  });

  test('shows gender market section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Gender Market')).toBeVisible();
    await expect(page.getByText('Boy', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Girl', { exact: true }).first()).toBeVisible();
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
});
