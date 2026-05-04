import { test, expect } from '@playwright/test';

test.describe('Guessing Form', () => {
  test('loads with correct heading and all fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Baby Bets' })).toBeVisible();
    await expect(page.getByText("Make your guesses for the big arrival!")).toBeVisible();
    await expect(page.getByPlaceholder(/aunt sarah/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /boy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /girl/i })).toBeVisible();
    await expect(page.getByText('Birth weight')).toBeVisible();
    await expect(page.getByText('Birth date')).toBeVisible();
    await expect(page.getByText('Length')).toBeVisible();
    await expect(page.getByRole('button', { name: /submit my guess/i })).toBeVisible();
  });

  test('shows validation error if gender not selected', async ({ page }) => {
    await page.goto('/');
    // fill all HTML-required fields but skip gender so JS validation fires
    await page.getByPlaceholder(/aunt sarah/i).fill('Test User');
    await page.getByPlaceholder('7').fill('7');
    await page.getByPlaceholder('4').fill('8');
    await page.getByPlaceholder('20').fill('20');
    await page.getByRole('button', { name: /submit my guess/i }).click();
    await expect(page.getByText(/please pick boy or girl/i)).toBeVisible();
  });

  test('highlights boy button when selected', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /boy/i }).click();
    const boyBtn = page.getByRole('button', { name: /boy/i });
    await expect(boyBtn).toHaveClass(/bg-blue-500/);
  });

  test('highlights girl button when selected', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /girl/i }).click();
    const girlBtn = page.getByRole('button', { name: /girl/i });
    await expect(girlBtn).toHaveClass(/bg-pink-500/);
  });

  test('submits form and shows success screen', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder(/aunt sarah/i).fill('Playwright Test');
    await page.getByRole('button', { name: /boy/i }).click();

    // weight
    await page.getByPlaceholder('7').fill('7');
    await page.getByPlaceholder('4').fill('8');

    // length
    await page.getByPlaceholder('20').fill('20');

    await page.getByRole('button', { name: /submit my guess/i }).click();

    await expect(page.getByText(/you're entered/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /see the leaderboard/i })).toBeVisible();
  });
});
