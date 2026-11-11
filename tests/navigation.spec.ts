import { test, expect } from '@playwright/test'

test('main navigation marks the current page', async ({ page }) => {
  await page.goto('/resume/')
  const main = page.getByRole('navigation', { name: 'Main' })

  await expect(main.getByRole('link', { name: 'Resume' })).toHaveAttribute('aria-current', 'page')
  await expect(main.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
})

test('profile links are a separate, labelled navigation', async ({ page }) => {
  await page.goto('/')
  const profiles = page.getByRole('navigation', { name: 'Profiles' })

  await expect(profiles.getByRole('link', { name: /GitHub profile/ })).toHaveAttribute(
    'href',
    'https://github.com/denniskasper',
  )
  await expect(profiles.getByRole('link', { name: /LinkedIn profile/ })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/denniskasper',
  )
})
