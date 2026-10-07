import { test, expect, type APIRequestContext } from '@playwright/test'

const BASE_URL = 'http://localhost:4321'

const CERTIFICATE_PATHS = [
  '/certificates/deep-learning-specialization.pdf',
  '/certificates/tensorflow-developer.pdf',
  '/certificates/model-order-reduction.pdf',
  '/certificates/msmd-battery-module.pdf',
  '/certificates/cfd-with-cad-preparation-and-meshing.pdf',
  '/certificates/dymola-and-modelica.pdf',
]

async function expectPdf(request: APIRequestContext, path: string): Promise<void> {
  const response = await request.get(`${BASE_URL}${path}`)

  expect(response.status(), path).toBe(200)
  expect(response.headers()['content-type'], path).toContain('application/pdf')
  expect((await response.body()).subarray(0, 5).toString(), path).toBe('%PDF-')
}

test('every certificate is served as a PDF', async ({ request }) => {
  for (const path of CERTIFICATE_PATHS) {
    await expectPdf(request, path)
  }
})

test('certification links on the resume open their certificate in a new tab', async ({ page, request }) => {
  await page.goto(`${BASE_URL}/resume`)

  // The links are authored in the resume repo, so there are none until it adds them.
  const links = await page.locator('h2#certifications + ul a').all()

  for (const link of links) {
    const href = await link.getAttribute('href')

    expect(href).toMatch(/^\/certificates\//)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
    await expectPdf(request, href!)
  }
})
