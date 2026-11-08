import { test, expect } from '@playwright/test'

test('download resume and verify file presence', async ({ page }) => {
  await page.goto('/resume')

  const [download] = await Promise.all([
    page.waitForEvent('download'), // Waits for download to start
    page.click('a[href="/resume.pdf"]'),
  ])

  const path = await download.path()
  expect(path).not.toBeNull()

  expect(download.suggestedFilename()).toBe('dennis-kasper-resume.pdf')
})
