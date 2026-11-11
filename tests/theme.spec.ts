import { test, expect } from '@playwright/test'

test('theme toggle works from the keyboard', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Dark theme' }).focus()
  await page.keyboard.press('Enter')
  await expect(html).toHaveClass(/dark/)

  await page.keyboard.press('Space')
  await expect(html).not.toHaveClass(/dark/)
})

test('theme defaults to the system color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('toggled theme persists across reloads without a consent prompt', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.getByRole('alertdialog')).toHaveCount(0)

  await page.getByRole('button', { name: 'Dark theme' }).click()
  await page.reload()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('toggle reports the dark theme as pressed', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Dark theme' })
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'false')
})

test('theme still follows the system and toggles when site data is blocked', async ({ page }) => {
  // Browsers that block site data throw on any localStorage access
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
    })
  })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Dark theme' }).click()
  await expect(html).not.toHaveClass(/dark/)
})

test('browser theme color follows an explicit toggle instead of the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const themeColors = page.locator('meta[name="theme-color"]')
  await expect(themeColors).toHaveCount(2)

  await page.getByRole('button', { name: 'Dark theme' }).click()

  // Both tags, whatever their media query, now carry the dark page background
  for (const themeColor of await themeColors.all()) {
    await expect(themeColor).toHaveAttribute('content', 'rgb(19, 24, 26)')
  }
})

test('toggle shows exactly one icon in each theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Dark theme' })
  const visibleIcons = button.locator('svg').filter({ visible: true })
  await expect(visibleIcons).toHaveCount(1)

  await button.click()
  await expect(visibleIcons).toHaveCount(1)
})
