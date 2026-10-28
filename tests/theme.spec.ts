import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4321'

test('theme toggle works from the keyboard', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(BASE_URL)
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Toggle theme' }).focus()
  await page.keyboard.press('Enter')
  await expect(html).toHaveClass(/dark/)

  await page.keyboard.press('Space')
  await expect(html).not.toHaveClass(/dark/)
})

test('theme defaults to the system color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto(BASE_URL)

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('toggled theme persists across reloads without a consent prompt', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(BASE_URL)
  await expect(page.getByRole('alertdialog')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.reload()

  await expect(page.locator('html')).toHaveClass(/dark/)
})
