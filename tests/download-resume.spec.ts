import { test, expect } from '@playwright/test'

test('download resume and verify file presence', async ({ page, context }) => {
  await page.goto('http://localhost:4321/resume')

  const [download] = await Promise.all([
    page.waitForEvent('download'), // Waits for download to start
    page.click('a[href="/resume.pdf"] button'),
  ])

  //   // Save the downloaded file to a path (optional: use a temp path or specific folder)
  const path = await download.path()
  expect(path).not.toBeNull()

  expect(download.suggestedFilename()).toBe('dennis-kasper-resume.pdf')
})
