import { readdirSync } from 'fs'
import { test, expect, type APIRequestContext } from '@playwright/test'

const BASE_URL = 'http://localhost:4321'

// Every PDF in public/certificates/ is a published certificate.
const CERTIFICATE_PATHS = readdirSync('public/certificates')
  .filter((file) => file.endsWith('.pdf'))
  .map((file) => `/certificates/${file}`)

async function expectPdf(request: APIRequestContext, path: string): Promise<void> {
  const response = await request.get(`${BASE_URL}${path}`)

  expect(response.status(), path).toBe(200)
  expect(response.headers()['content-type'], path).toContain('application/pdf')
  expect((await response.body()).subarray(0, 5).toString(), path).toBe('%PDF-')
}

test('every certificate is served as a PDF', async ({ request }) => {
  expect(CERTIFICATE_PATHS).not.toHaveLength(0)

  for (const path of CERTIFICATE_PATHS) {
    await expectPdf(request, path)
  }
})

test('certification links on the resume open their certificate in a new tab', async ({ page, request }) => {
  await page.goto(`${BASE_URL}/resume`)

  // The links are authored in the resume repo; every certificate has exactly one.
  const links = await page.locator('h2#certifications + ul a').all()
  const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')))

  expect([...hrefs].sort()).toEqual([...CERTIFICATE_PATHS].sort())

  for (const link of links) {
    const href = await link.getAttribute('href')

    expect(href).toMatch(/^\/certificates\//)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
    await expectPdf(request, href!)
  }
})
