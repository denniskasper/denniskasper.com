import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4321'

for (const path of ['/', '/resume/']) {
  test(`${path} has canonical, social and structured metadata`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://denniskasper.com${path}`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://denniskasper.com${path}`)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://denniskasper.com/og-image.png')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/)

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '')
    expect(jsonLd['@type']).toBe('Person')
    expect(jsonLd.name).toBe('Dennis Kasper')
  })
}

test('404 page is not indexed', async ({ page }) => {
  await page.goto(`${BASE_URL}/does-not-exist`)

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test('robots.txt points to the sitemap', async ({ request }) => {
  const robots = await (await request.get(`${BASE_URL}/robots.txt`)).text()
  expect(robots).toContain('Sitemap: https://denniskasper.com/sitemap-index.xml')

  const sitemap = await request.get(`${BASE_URL}/sitemap-index.xml`)
  expect(sitemap.status()).toBe(200)
})

test('social images are served', async ({ request }) => {
  for (const path of ['/og-image.png', '/apple-touch-icon.png']) {
    const response = await request.get(`${BASE_URL}${path}`)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type'], path).toContain('image/png')
  }
})

test('homepage hero photo is described and served in modern formats', async ({ page }) => {
  await page.goto(BASE_URL)

  const photo = page.locator('section img')
  await expect(photo).toHaveAttribute('alt', /windsurfing.*Hvide Sande/)
  await expect(page.locator('section picture source[type="image/avif"]')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Dennis\s*Kasper/)
})
